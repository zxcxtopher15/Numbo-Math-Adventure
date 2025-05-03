<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\OtpMail;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use App\Models\ParentStudentRelationship;
use Illuminate\Support\Facades\RateLimiter;

class OtpController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        if (RateLimiter::tooManyAttempts($request->email, 3)) {
            return response()->json(['message' => 'Too many attempts. Try again later.'], 429);
        }

        RateLimiter::hit($request->email, 60);

        $parentId = Auth::id();

        $student = User::where('email', $request->email)
            ->where('user_type', 'Student')
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $existingRelation = ParentStudentRelationship::where('parent_id', $parentId)
            ->where('student_id', $student->id)
            ->exists();

        if ($existingRelation) {
            return response()->json(['message' => 'Student is already linked to this parent'], 400);
        }

        return $this->otpService->generateOtp($request->email);
    }


    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $verificationResult = $this->otpService->verifyOtp($request->email, $request->otp);

        $responseData = json_decode($verificationResult->getContent(), true);

        if (isset($responseData['message']) && $responseData['message'] === 'Invalid or expired OTP') {
            return response()->json([
                'message' => 'Invalid or expired OTP. Please try again.',
            ], 400);
        }

        $parentId = Auth::id();

        $student = User::where('email', $request->email)
            ->where('user_type', 'Student')
            ->first();

        if ($student) {
            $existingRelation = ParentStudentRelationship::where('parent_id', $parentId)
                ->where('student_id', $student->id)
                ->exists();

            if (!$existingRelation) {
                ParentStudentRelationship::create([
                    'parent_id' => $parentId,
                    'student_id' => $student->id,
                ]);
            }

            return response()->json([
                'message' => 'OTP verified successfully',
            ], 200);
        } else {
            return response()->json([
                'message' => 'Student not found',
                'parent_id' => $parentId,
            ], 404);
        }
    }

    public function send_otp_registration(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)
            ->where('status', 0)
            ->first();

        if ($user) {
            return response()->json(['error' => 'This email is already registered.'], 400);
        }

        $now = Carbon::now();
        $otp = rand(100000, 999999);

        Session::put('otp', $otp);
        Session::put('otp_email', $request->email);
        Session::put('otp_sent_time', $now);
        Session::put('otp_expiry', $now->addMinutes(5));

        Mail::to($request->email)->send(new OtpMail($otp));

        return response()->json(['message' => 'OTP sent']);
    }

    public function verify_otp_registration(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required']);

        $storedOtp = Session::get('otp');
        $storedEmail = Session::get('otp_email');
        $otpExpiry = Session::get('otp_expiry');
        $now = Carbon::now();

        if (!$storedOtp || !$storedEmail || !$otpExpiry) {
            return response()->json(['message' => 'No OTP session found. Please request a new OTP.'], 400);
        }

        if ($now->greaterThan(Carbon::parse($otpExpiry))) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        if ($request->email !== $storedEmail) {
            return response()->json(['message' => 'Email mismatch.'], 400);
        }

        if ($request->otp != $storedOtp) {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }

        Session::forget(['otp', 'otp_email', 'otp_expiry', 'otp_sent_time']);

        return response()->json(['message' => 'OTP verified successfully.']);
    }
}

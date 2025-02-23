<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
}

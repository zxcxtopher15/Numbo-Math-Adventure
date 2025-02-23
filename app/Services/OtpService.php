<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Otp;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public function generateOtp($email)
    {
        $user = User::where('email', $email)->where('user_type', 'Student')->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found or not a Student'], 404);
        }

        $otp = rand(100000, 999999);

        Otp::where('email', $email)->delete();

        Otp::create([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new OtpMail($otp));

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function verifyOtp($email, $otp)
    {
        $otpRecord = Otp::where('email', $email)
            ->where('otp', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $otpRecord->delete();

        return response()->json(['message' => 'OTP verified successfully']);
    }
}

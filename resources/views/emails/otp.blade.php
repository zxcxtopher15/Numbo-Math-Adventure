@component('mail::message')
# One-Time Pin (OTP)

Hello,

Use the OTP below to verify your email:

@component('mail::panel')
**{{ $otp }}**
@endcomponent

This OTP is valid for **5 minutes**. Do not share this code with anyone.

Thanks,  
{{ config('app.name') }}
@endcomponent

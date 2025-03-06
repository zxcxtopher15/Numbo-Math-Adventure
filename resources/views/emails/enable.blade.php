@component('mail::message')
# Account Enabled

Hello {{ $user->name }},

Your account has been successfully enabled! You can now log in using the link below:

@component('mail::button', ['url' => url('/login')])
Login to Your Account
@endcomponent

Thanks,  
{{ config('app.name') }}
@endcomponent
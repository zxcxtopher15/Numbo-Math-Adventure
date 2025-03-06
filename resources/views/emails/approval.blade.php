@component('mail::message')
    # Account Approved

    Hello,

    Your account has been successfully approved! You can now log in using the link below:

    @component('mail::button', ['url' => config('app.url') . '/login'])
        Login to Your Account
    @endcomponent

    If you did not request this, please ignore this email.

    Thanks,
    {{ config('app.name') }}
@endcomponent

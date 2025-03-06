@component('mail::message')
    # Account Enabled

    Hello,

    Your account has been **enabled**! You can now log in and access your account again.

    @component('mail::button', ['url' => config('app.url') . '/login'])
        Login to Your Account
    @endcomponent

    If you encounter any issues, please contact support.

    Thanks,
    {{ config('app.name') }}
@endcomponent

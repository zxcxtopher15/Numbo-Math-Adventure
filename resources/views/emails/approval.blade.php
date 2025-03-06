@props(['url'])

@component('mail::message')
    # Account Approval

    Hello,

    Your account has been successfully approved! You can now log in using the link below:

    @component('mail::button', ['url' => $url])
        Login to Your Account
    @endcomponent

    Thanks,
    {{ config('app.name') }}
@endcomponent

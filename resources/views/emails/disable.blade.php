@component('mail::message')
    # Account Disabled

    Hello {{ $user->name }},
    
    Your account has been disabled. You will no longer be able to access the system until further notice.

    If you believe this was done in error, please contact our support team.

    Thanks,
    {{ config('app.name') }}
@endcomponent

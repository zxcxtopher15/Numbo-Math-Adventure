@component('mail::message')
    # Account Rejected

    Hello {{ $user->name }},

    Your account has been rejected. This means you can't access the system.

    If you think this is a mistake or need further assistance, please contact our support team.

    Thanks,
    {{ config('app.name') }}
@endcomponent

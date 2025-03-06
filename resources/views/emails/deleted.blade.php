@component('mail::message')
    # Account Deleted

    Hello,

    Your account has been deleted. This means you will no longer have access to the system, and all associated data may
    have been removed.

    If you think this is a mistake or need further assistance, please contact our support team.

    Thanks,
    {{ config('app.name') }}
@endcomponent

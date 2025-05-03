<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->user_type === 'Student' && !str_ends_with($value, '@my.jru.edu')) {
                        $fail('Students must use a @my.jru.edu email address.');
                    }
                    if ($request->user_type === 'Teacher' && !str_ends_with($value, '@jru.edu')) {
                        $fail('Teachers must use a @jru.edu email address.');
                    }
                },
                'unique:users,email',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'student_id' => [
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->user_type === 'Student' && empty($value)) {
                        $fail('The student ID field is required.');
                    }
                },
            ],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'student_id' => $request->user_type === 'Student' ? $request->student_id : null,
            'status' => in_array($request->user_type, ['Teacher', 'Student', 'Parent']) ? 2 : 0,
        ]);

        event(new Registered($user));

        return redirect()->route('login');
    }
}

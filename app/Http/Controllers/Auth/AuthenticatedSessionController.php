<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');

        $fieldType = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (!Auth::attempt([$fieldType => $credentials['email'], 'password' => $credentials['password']], $request->filled('remember'))) {
            return redirect()->back()->withErrors(['email' => 'Invalid email/username or password.']);
        }

        $user = Auth::user();

        if ($user->status == 1) {
            Auth::logout();
            return redirect()->back()->withErrors(['error' => 'Your account is disabled. Please contact admin.']);
        }

        if ($user->status == 2) {
            Auth::logout();
            return redirect()->back()->withErrors(['error' => 'Your account is for approval. Please contact admin.']);
        }

        if ($user->status == 3) {
            Auth::logout();
            return redirect()->back()->withErrors(['error' => 'Your account is rejected. Please contact admin.']);
        }

        if ($user->section_id == 0 && $user->user_type !== 'Administrator') {
            Auth::logout();
            if ($user->user_type == 'Student') {
                return redirect()->back()->withErrors(['error' => "You can't login yet. No section assigned! Please contact your teacher."]);
            } elseif ($user->user_type == 'Teacher') {
                return redirect()->back()->withErrors(['error' => "You can't login yet. No section assigned! Please contact admin."]);
            }
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

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

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if ($user && $user->status == 1) {
            return redirect()->back()->withErrors(['email' => 'Your account is disabled. Please contact admin.']);
        }

        if ($user && $user->section_id == 0 && $user->user_type != 'Administrator') {
            if ($user->user_type == 'Student') {
                return redirect()->back()->withErrors(['email' => "You can't login yet. No section assigned! Please contact your teacher."]);
            } else if ($user->user_type == 'Teacher') {
                return redirect()->back()->withErrors(['email' => "You can't login yet. No section assigned! Please contact admin."]);
            }
        }

        if ($user && $user->status == 2) {
            return redirect()->back()->withErrors(['email' => 'Your account is for approval. Please contact admin.']);
        } 
        
        if ($user && $user->status == 3) {
            return redirect()->back()->withErrors(['email' => 'Your account is rejected. Please contact admin.']);
        }

        $request->authenticate();
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

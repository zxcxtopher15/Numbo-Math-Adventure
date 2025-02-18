<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validatedData = $request->validated();

        if (isset($validatedData['email'])) {
            $email = $validatedData['email'];

            if ($user->user_type === 'Student' && !str_ends_with($email, '@my.jru.edu')) {
                return Redirect::route('profile.edit')->withErrors(['email' => 'Students must use a @my.jru.edu email.']);
            }

            if ($user->user_type === 'Teacher' && !str_ends_with($email, '@jru.edu')) {
                return Redirect::route('profile.edit')->withErrors(['email' => 'Teachers must use a @jru.edu email.']);
            }

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }
        }

        $user->fill($validatedData);
        $user->save();

        return Redirect::route('profile.edit')->with('status', 'Profile updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

<?php

namespace App\Http\Controllers\Settings;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Client;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $role = $request->user()?->role;

        if ($role === UserRole::ADMIN) {
            return Inertia::render('Profile/AdminSettings');
        }

        if ($role === UserRole::CLIENT) {
            $client = Client::query()
                ->where('user_id', $request->user()->id)
                ->first();

            return Inertia::render('Profile/ClientSettings', [
                'clientProfile' => [
                    'company_name' => $client?->company_name,
                    'phone' => $client?->phone,
                    'address' => $client?->address,
                ],
            ]);
        }

        if ($role === UserRole::EMPLOYEE) {
            return Inertia::render('Profile/EmployeeSettings');
        }

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->role === UserRole::CLIENT) {
            Client::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $validated['company_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'] ?? null,
                ]
            );
        }

        return to_route('dashboard');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

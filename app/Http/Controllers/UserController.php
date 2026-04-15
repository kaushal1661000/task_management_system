<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Repositories\NotificationRepository;
use App\Repositories\UserRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class UserController extends BaseController
{
    public function __construct(
        private UserRepository $userRepository,
        private NotificationRepository $notificationRepository
    ) {}

    public function index(Request $request): Response
    {
        return inertia('Users/Index', [
            'users' => $this->userRepository->getPaginatedWithFilters($request),
        ]);
    }

    public function create(): Response
    {
        return inertia('Users/Create');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $user = $this->userRepository->storeWithClient($request);

            $this->notificationRepository->notifyUserCreated($user);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('User creation failed.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectError(route('users.index'), 'Failed to create user. Please try again.');
        }

        return $this->sendRedirectResponse(route('users.index'), 'User created successfully.');
    }

    public function show(User $user): Response
    {
        $result = $this->userRepository->getByIdWithStats($user->id);

        return inertia('Users/Show', [
            'user'  => $result['user'],
            'stats' => $result['stats'],
        ]);
    }

    public function edit(User $user): Response
    {
        return inertia('Users/Edit', [
            'user' => $this->userRepository->getByIdWithClients($user->id),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $updatedUser = $this->userRepository->updateWithClient($user, $request);

            $this->notificationRepository->notifyUserUpdated($request, $updatedUser);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('User update failed.', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to update user. Please try again.');
        }

        return $this->sendRedirectResponse(route('users.index'), 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $userId   = (string) $user->id;
        $userName = $user->name;

        try {
            DB::beginTransaction();
            $this->userRepository->destroyWithClient($user);

            $this->notificationRepository->notifyUserDeleted($request, $userId, $userName);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('User deletion failed.', [
                'user_id' => $userId,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectError(route('users.index'), 'Failed to delete user. Please try again.');
        }

        return $this->sendRedirectDelete(route('users.index'), 'User deleted successfully.');
    }
}
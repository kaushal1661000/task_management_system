<?php

namespace App\Http\Controllers;

use App\Repositories\NotificationRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class NotificationController extends BaseController
{
    public function __construct(
        private NotificationRepository $notificationRepository
    ) {}

    public function view(): Response
    {
        return inertia('Notifications/Index');
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $userId = (string) $request->user()->id;
            $limit = max(1, min((int) $request->integer('limit', 10), 200));

            return $this->jsonSuccess([
                'notifications' => $this->notificationRepository->getUserNotifications($userId, $limit),
                'unreadCount'   => $this->notificationRepository->getUnreadCount($userId),
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to fetch notifications.', [
                'user_id' => $request->user()->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            
            return $this->jsonError('Failed to fetch notifications. Please try again.');
        }
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $userId = (string) $request->user()->id;
            $this->notificationRepository->markAsRead($id, $userId);
            $unreadCount = $this->notificationRepository->getUnreadCount($userId);
            
            DB::commit();

            return $this->jsonSuccess([
                'unreadCount' => $unreadCount,
                'message'     => 'Notification marked as read.',
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            
            Log::warning('Notification not found.', [
                'notification_id' => $id,
                'user_id'         => $request->user()->id,
            ]);
            
            return $this->jsonError('Notification not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            
            Log::error('Failed to mark notification as read.', [
                'notification_id' => $id,
                'user_id'         => $request->user()->id,
                'error'           => $e->getMessage(),
                'trace'           => $e->getTraceAsString(),
            ]);
            
            return $this->jsonError('Failed to mark notification as read. Please try again.');
        }
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $userId       = (string) $request->user()->id;
            $updatedCount = $this->notificationRepository->markAllAsRead($userId);
            $unreadCount  = $this->notificationRepository->getUnreadCount($userId);
            
            DB::commit();

            return $this->jsonSuccess([
                'updatedCount' => $updatedCount,
                'unreadCount'  => $unreadCount,
                'message'      => 'All notifications marked as read.',
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            
            Log::error('Failed to mark all notifications as read.', [
                'user_id' => $request->user()->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            
            return $this->jsonError('Failed to mark notifications as read. Please try again.');
        }
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $userId = (string) $request->user()->id;
            $this->notificationRepository->deleteNotification($id, $userId);
            $unreadCount = $this->notificationRepository->getUnreadCount($userId);
            
            DB::commit();

            return $this->jsonSuccess([
                'unreadCount' => $unreadCount,
                'message'     => 'Notification deleted successfully.',
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            
            Log::warning('Notification not found for deletion.', [
                'notification_id' => $id,
                'user_id'         => $request->user()->id,
            ]);
            
            return $this->jsonError('Notification not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            
            Log::error('Failed to delete notification.', [
                'notification_id' => $id,
                'user_id'         => $request->user()->id,
                'error'           => $e->getMessage(),
                'trace'           => $e->getTraceAsString(),
            ]);
            
            return $this->jsonError('Failed to delete notification. Please try again.');
        }
    }
}
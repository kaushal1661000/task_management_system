<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    public function sendRedirectResponse(string $redirect, string $message = ''): RedirectResponse
    {
        //        activity()->log($message);

        return Redirect::to($redirect)
            ->with('message', [
                'status' => 'success',
                'description' => $message,
            ]);
    }

    public function sendRedirectBackResponse(string $message = ''): RedirectResponse
    {
        return Redirect::back()
            ->with('message', [
                'status' => 'success',
                'description' => $message,
            ]);
    }

    public function sendRedirectError(string $redirect, string $message): RedirectResponse
    {
        //        activity()->log($message);

        return Redirect::to($redirect)
            ->with('message', [
                'status' => 'error',
                'description' => $message,
            ]);
    }

    public function sendRedirectBackError(string $message = ''): RedirectResponse
    {
        return Redirect::back()
            ->with('message', [
                'status' => 'error',
                'description' => $message,
            ]);
    }

    public function sendRedirectDelete(string $redirect, string $message = ''): RedirectResponse
    {
        return Redirect::to($redirect)
            ->with('message', [
                'status' => 'delete',
                'description' => $message,
            ]);
    }
    protected function jsonSuccess(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, ...$data], $status);
    }

    protected function jsonError(string $message, int $status = 500): JsonResponse
    {
        return response()->json(['success' => false, 'error' => $message], $status);
    }
}

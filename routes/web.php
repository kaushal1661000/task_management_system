<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications - Available to all authenticated users
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/view', [NotificationController::class, 'view'])->name('view');
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('markAsRead');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // Shared routes to avoid duplicate route names across role groups.
    Route::middleware('role:admin,employee')->group(function () {
        Route::resource('tasks', TaskController::class);
    });

    Route::middleware('role:admin,employee,client')->group(function () {
        Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    });

    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class);

        Route::resource('clients', ClientController::class);

        Route::resource('projects', ProjectController::class)->except(['index', 'show']);
        
        // Reports - Admin only
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });

    Route::middleware('role:employee')->group(function () {
        // Employee-only routes can be added here.
    });

    Route::middleware('role:client,employee,admin')->group(function () {
        Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    });

    Route::middleware('role:client')->group(function () {
        Route::get('my-projects', [ProjectController::class, 'index'])->name('client.projects');
    });
});

require __DIR__.'/settings.php';
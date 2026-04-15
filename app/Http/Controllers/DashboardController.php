<?php

namespace App\Http\Controllers;

use App\Repositories\DashboardRepository;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends BaseController
{
    public function __construct(private DashboardRepository $dashboardRepository) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return inertia('Dashboard/Index', [
            ...$this->dashboardRepository->getDashboardData($user),
            'userRole' => $user->role,
        ]);
    }
}
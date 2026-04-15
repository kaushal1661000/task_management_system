<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Repositories\ReportRepository;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class ReportController extends BaseController
{
    public function __construct(private ReportRepository $reportRepository) {}

    public function index(ReportRequest $request): Response
    {
        try {
            $data = $this->reportRepository->getReportData($request);
        } catch (Throwable $e) {
            Log::error('Failed to load reports dashboard.', [
                ...$request->filters(),
                'exception' => $e,
            ]);

            $data = [
                ...$this->reportRepository->emptyReportData($request),
                'error' => 'Unable to load reports right now. Please try again.',
            ];
        }

        return inertia('Reports/Index', $data);
    }
}
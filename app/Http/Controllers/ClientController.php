<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use App\Repositories\ClientRepository;
use App\Repositories\NotificationRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class ClientController extends BaseController
{
    public function __construct(
        private ClientRepository $clientRepository,
        private NotificationRepository $notificationRepository
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return inertia('Clients/Index', [
            'clients' => $this->clientRepository->getWithRelations($search),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return inertia('Clients/Create');
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $client = $this->clientRepository->createWithUser($request);
            
            $this->notificationRepository->notifyClientCreated($request, $client);
            
            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Client creation failed.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to create client. Please try again.');
        }

        return $this->sendRedirectResponse(route('clients.index'), 'Client created successfully.');
    }

    public function show(Client $client): Response
    {
        $client->load(['user', 'projects']);
        $client->loadCount('projects');

        return inertia('Clients/Show', compact('client'));
    }

    public function edit(Client $client): Response
    {
        $client->load('user');

        return inertia('Clients/Edit', compact('client'));
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $updatedClient = $this->clientRepository->updateWithUser($client, $request);
            
            $this->notificationRepository->notifyClientUpdated($request, $updatedClient);
            
            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Client update failed.', [
                'client_id' => $client->id,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to update client. Please try again.');
        }

        return $this->sendRedirectResponse(route('clients.index'), 'Client updated successfully.');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $client->loadMissing('user:id,name');
        $deletedClientUserId = (string) $client->user_id;
        $deletedClientName   = $client->company_name ?: ($client->user?->name ?? 'Client');

        try {
            DB::beginTransaction();
            $this->clientRepository->destroyWithUser($client);
            
            $this->notificationRepository->notifyClientDeleted($request, $deletedClientUserId, $deletedClientName);
            
            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Client deletion failed.', [
                'client_user_id' => $deletedClientUserId,
                'error'          => $e->getMessage(),
                'trace'          => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectError(route('clients.index'), 'Failed to delete client. Please try again.');
        }

        return $this->sendRedirectDelete(route('clients.index'), 'Client deleted successfully.');
    }
}
<?php

namespace App\Repositories;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ClientRepository extends BaseRepository
{
    public function __construct(Client $model, private UserRepository $userRepository)
    {
        parent::__construct($model);
    }

    public function getWithRelations(?string $search = null): LengthAwarePaginator
    {
        $searchTerm = trim((string) $search);

        return $this->newQuery()
            ->with([
                'user',
                'projects.members:id,name,email',
            ])
            ->withCount('projects')
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('company_name', 'like', "%{$searchTerm}%")
                        ->orWhere('phone', 'like', "%{$searchTerm}%")
                        ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                            $userQuery->where('name', 'like', "%{$searchTerm}%")
                                ->orWhere('email', 'like', "%{$searchTerm}%");
                        });
                });
            })
            ->paginate(10)
            ->withQueryString();
    }

    public function getForProjectSelection(): Collection
    {
        return $this->getAll(
            relations: ['user:id,name'],
            selects: ['id', 'user_id', 'company_name'],
            orderBy: ['company_name' => 'asc']
        );
    }

    public function createWithUser(StoreClientRequest $request): Client
    {
        $user = $this->userRepository->createClientUser($request->userData());

        return $this->store(
            array_merge($request->clientData(), ['user_id' => $user->id])
        );
    }

    public function updateWithUser(Client $client, UpdateClientRequest $request): Client
    {
        if ($client->user) {
            $this->userRepository->update($client->user->id, $request->userData());
        }

        return $this->update($client->id, $request->clientData());
    }

    public function destroyWithUser(Client $client): bool
    {
        return $client->user
            ? $this->userRepository->destroy($client->user->id)
            : $this->destroy($client->id);
    }
}
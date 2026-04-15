<?php

namespace App\Repositories;

use Illuminate\Support\Collection;

interface RepositoryInterface
{
    public function exists(string $key, $value, bool $withTrashed = false): bool;

    public function getByAttribute(
        string $attr_name,
        mixed $attr_value,
        array $relations = [],
        bool $withTrashed = false,
        array $selects = []
    ): mixed;

    public function getPaginate(int $n, array $relations = [], bool $withTrashed = false, array $selects = []): mixed;

    public function store(array $inputs): mixed;

    public function getById($id, array $relations = [], bool $withTrashed = false, array $selects = []): mixed;

    public function search($key, $value, array $relations = [], bool $withTrashed = false, array $selects = []): mixed;

    public function getAll(array $relations = [], bool $withTrashed = false, array $selects = []): mixed;

    public function countAll(bool $withTrashed = false): mixed;

    public function getAllSelectable($key): Collection;

    public function update($id, array $inputs): mixed;

    public function destroy($id): bool;

    public function destroyAll(): bool;

    public function forceDelete($id): bool;

    public function restore($id): bool;

    public function destroyByIds(array $ids): mixed;
}

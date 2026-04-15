<?php

namespace App\Repositories;

// use App\Traits\FilterableTrait;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

abstract class BaseRepository implements RepositoryInterface
{
    protected Model|Builder $model;

    /**
     * Create a new repository instance.
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function exists(string $key, $value, bool $withTrashed = false): bool
    {
        try {
            $query = $this->model->where($key, $value);
            if ($withTrashed) {
                $query = $query->hasMacro('withTrashed') ? $query->withTrashed() : $query;
            }

            return $query->exists();
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return false;
        }
    }

    public function getByAttribute(
        string $attr_name,
        mixed $attr_value,
        array $relations = [],
        bool $withTrashed = false,
        array $selects = []
    ): Builder|Model|null {
        try {
            $query = $this->initiateQuery($relations, $withTrashed, $selects);

            return $query->where($attr_name, $attr_value)->first();
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return null;
        }
    }

    private function initiateQuery(array $relations = [], bool $withTrashed = false, array $selects = [], array $orderBy = [], $filters = false): Model|Builder
    {
        $query = $this->model;
        if (count($relations) > 0) {
            $query = $query->with($relations);
        }

        if (count($selects) > 0) {
            $query = $query->select($selects);
        }

        if ($filters) {
            $query = $this->setFilters($query);
        }

        if (empty($orderBy) === false) {
            foreach ($orderBy as $column => $direction) {
                $query = $query->orderBy($column, $direction);
            }
        }

        if ($withTrashed) {
            $query = $query->hasMacro('withTrashed') ? $query->withTrashed() : $query;
        }

        return $query;
    }

    public function getPaginate(?int $n = 10, array $relations = [], bool $withTrashed = false, array $selects = [], array $orderBy = [], $filters = false): LengthAwarePaginator
    {
        $query = $this->initiateQuery($relations, $withTrashed, $selects, $orderBy, $filters);
        if ($filters) {
            $query = $query->paginate($n)->appends(request()->query());
        } else {
            $query = $query->paginate($n);
        }

        return $query;
    }

    public function store(array $inputs): Model
    {
        try {
            return $this->model->create($inputs);
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            throw $exc;
        }
    }

    public function search($key, $value, array $relations = [], bool $withTrashed = false, array $selects = []): array|Collection|EloquentCollection
    {
        $query = $this->initiateQuery($relations, $withTrashed, $selects);

        return $query->where($key, 'like', '%' . $value . '%')
            ->get();
    }

    public function getAll(array $relations = [], bool $withTrashed = false, array $selects = [], $filters = false, $orderBy = []): array|Collection|EloquentCollection
    {
        $query = $this->initiateQuery($relations, $withTrashed, $selects, $orderBy, $filters);

        return $query->get();
    }

    public function countAll(bool $withTrashed = false): int
    {
        $query = $this->model;
        if ($withTrashed) {
            $query = $query->hasMacro('withTrashed') ? $query->withTrashed() : $query;
        }

        return $query->count();
    }

    public function getAllSelectable($key, string $attr = 'id'): Collection
    {
        return $this->model->pluck($key, $attr);
    }

    public function update($id, array $inputs): mixed
    {
        try {
            $model = $this->getById($id);
            if ($model) {
                $model->update($inputs);

                return $model->fresh();
            } else {
                return null;
            }
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return null;
        }
    }

    public function getById($id, array $relations = [], bool $withTrashed = false, array $selects = []): mixed
    {
        try {
            $query = $this->initiateQuery($relations, $withTrashed, $selects);

            return $query->find($id);
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return null;
        }
    }

    public function destroy($id): bool
    {
        try {
            $data = $this->getById($id);

            return $data ? $data->delete() : false;
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return false;
        }
    }

    public function destroyAll(): bool
    {
        try {
            return $this->model->delete();
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return false;
        }
    }

    public function forceDelete($id): bool
    {
        try {
            $data = $this->getById($id, [], true);

            return $data ? $data->forceDelete() : false;
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return false;
        }
    }

    public function restore($id): bool
    {
        try {
            $data = $this->getById($id, [], true);

            return $data ? $data->restore() : false;
        } catch (QueryException $exc) {
            Log::error($exc->getMessage(), $exc->getTrace());

            return false;
        }
    }

    public function destroyByIds(array $ids): mixed
    {
        return $this->model->newQuery()->whereIn('id', $ids)->delete();
    }

    public function newQuery(): Builder
    {
        return $this->model->newQuery();
    }

    public function updateOrCreate(array $values, array $key = []): Model|Builder
    {
        return $this->newQuery()
            ->updateOrCreate(
                $key,
                $values
            );
    }

    public function insert(array $values): array|bool
    {
        return $this->model->insert($values);
    }

    public function filterFields(string $id, string $type, array $options = [], string|array|null $value = null): array
    {
        return [
            'id' => $id,
            'type' => $type,
            'name' => ucwords(preg_replace('/_/', ' ', $id)),
            'options' => $options,
            'value' => $value,
        ];
    }

    public function filterOptions(string $label, string $value, bool $checked = false): array
    {
        return [
            'label' => $label,
            'value' => $value,
            'checked' => $checked,
        ];
    }

    public function getFilters(array $filterFields, $is_default_filter = true): array
    {
        $filters = [];
        if ($is_default_filter) {
            $filterFields = array_merge($filterFields, $this->__defaultFilters());
        }
        // $this->model->setFilterFields($filterFields); // Disabled for models without trait
        foreach ($filterFields as $field) {
            $filters[$field['type']][] = $this->__populateValuesFromRequest($field);
        }

        return $filters;
    }

    private function __populateValuesFromRequest(array $options): array
    {
        if (request()->filled('filters')) {
            $filters = request('filters');
            foreach ($filters as $filterName => $filterValue) {
                if ($filterName == $options['id']) {
                    switch ($options['type']) {
                        case 'select':
                            foreach ($options['options'] as $optionKey => $optionValue) {
                                $options['options'][$optionKey]['checked'] = in_array($optionValue['value'], $filterValue);
                            }
                            break;
                        default:
                            $options['value'] = $filterValue ?? $options['value'];
                    }
                    break;
                }
            }
        }

        return $options;
    }

    private function __defaultFilters(): array
    {
        return [
            $this->filterFields(
                id: 'search',
                type: 'text',
                value: ''
            ),
        ];
    }

    /**
     * @param  Builder  $query
     * @return Builder
     */
    public function setFilters(Builder $query): Builder
    {
        $filters = request()->input('filters');
        if (!empty($filters)) {
            $filterFields = []; // getFilterFields not available
            $filterFieldQuery = []; // getAttachFilters not available
            foreach ($filters as $key => $filter) {
                $filterFields = collect($filterFields);
                $filterFieldQuery = collect($filterFieldQuery);
                $filterField = $filterFields
                    ->filter(fn($filterField) => $filterField['id'] == $key)
                    ->first();
                $filterFieldQueryKey = $filterFieldQuery
                    ->filter(fn($filterField) => $filterField['id'] == $key)
                    ->first();
                if (!empty($filterField) && !empty($filterFieldQueryKey)) {
                    $key = $filterFieldQueryKey['query'];
                    if ($filterField['type'] == 'select') {
                        $query = $query->where(function (Builder $q) use ($key, $filter) {
                            return $this->recursiveWhereInClause($q, $key, $filter);
                        });
                    }

                    if ($filterField['type'] == 'date_range') {
                        [$startDate, $endDate] = [$filter['start_date'] ?? null, $filter['end_date'] ?? null];
                        $query = $query->where(function (Builder $query) use ($startDate, $endDate, $key) {
                            if (is_array($key)) {
                                $query = $query->where(function (Builder $q) use ($startDate, $endDate, $key) {
                                    $q->where($key[0], '<=', $endDate)
                                        ->where($key[1], '>=', $startDate);
                                });
                            } else {
                                $query = $query->where(function (Builder $q) use ($startDate, $endDate, $key) {
                                    $q->where($key, '<=', $endDate)
                                        ->where($key, '>=', $startDate);
                                });
                            }

                            return $query;
                        });
                    }

                    if ($filterField['type'] == 'text') {
                        $query = $query->where(function (Builder $q) use ($key, $filter) {
                            return $this->recursiveWhereClause($q, $key, $filter);
                        });
                    }
                }
            }
        }

        return $query;
    }

    public function insertToFilters(array $attachFields): void
    {
        $this->model->attachFilters($attachFields);
    }

    public function attachFilterWithQuery($id, $query): array
    {
        return [
            'id' => $id,
            'query' => $query,
        ];
    }

    private function recursiveWhereInClause(Builder $query, $column, $filter): Builder
    {
        if (is_array($column)) {
            $query->where(function (Builder $query) use ($column, $filter) {
                foreach ($column as $relation => $columnKey) {
                    if (is_int($relation)) {
                        $query->orWhereIn($columnKey, $filter);
                    } else {
                        $query->whereHas($relation, function (Builder $query) use ($columnKey, $filter) {
                            $this->recursiveWhereInClause($query, $columnKey, $filter);
                        });
                    }
                }
            });
        } else {
            $query->whereIn($column, $filter);
        }

        return $query;
    }

    private function recursiveWhereClause(Builder $query, $column, $value): Builder
    {
        if (is_array($column)) {
            $query->where(function (Builder $query) use ($column, $value) {
                foreach ($column as $relation => $columnKey) {
                    if (is_int($relation)) {
                        $query->orWhere($columnKey, 'LIKE', '%' . $value . '%');
                    } else {
                        $query->orWhereHas($relation, function (Builder $q) use ($columnKey, $value) {
                            $this->recursiveWhereClause($q, $columnKey, $value);
                        });
                    }
                }
            });
        } else {
            $query->where($column, 'LIKE', '%' . $value . '%');
        }

        return $query;
    }
}

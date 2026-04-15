<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable,HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */


    protected $guarded = [
        'id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'id' => 'string',
            'role' => UserRole::class,
        ];
    }

    /**
     * Clients owned by this user.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Tasks assigned to this user.
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Tasks reporting to this user.
     */
    public function reportingTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'reporting_to');
    }

    /**
     * Projects this user is member of.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, ProjectMember::class);
    }

    /**
     * Project memberships.
     */
    public function projectMembers(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }
}

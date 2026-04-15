<?php

namespace App\Enums;

use App\Traits\OptionsTrait;

enum ProjectStatus: string
{
    use OptionsTrait;

    case ACTIVE = 'active';
    case PAUSED = 'paused';
    case COMPLETED = 'completed';
    case PLANNING = 'planning';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

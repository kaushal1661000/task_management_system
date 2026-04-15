<?php

namespace App\Enums;

use App\Traits\OptionsTrait;

enum TaskStatus: string
{
    use OptionsTrait;

    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

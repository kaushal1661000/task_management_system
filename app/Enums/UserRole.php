<?php

namespace App\Enums;

use App\Traits\OptionsTrait;

enum UserRole: string
{
    use OptionsTrait;

    case ADMIN = 'admin';
    case EMPLOYEE = 'employee';
    case CLIENT = 'client';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

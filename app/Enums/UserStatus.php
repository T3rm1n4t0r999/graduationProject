<?php

namespace App\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case PendingVerification = 'pending_verification';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Активна',
            self::Suspended => 'Приостановлена',
            self::PendingVerification => 'На проверке',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'green',
            self::Suspended => 'red',
            self::PendingVerification => 'yellow',
        };
    }
}

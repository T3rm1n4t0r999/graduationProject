<?php

namespace App\Enums;

enum OrganizationStatus: string
{
    case Active = 'active';
    case Trial = 'trial';
    case Suspended = 'suspended';
    case PendingVerification = 'pending_verification';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Активна',
            self::Trial => 'Пробный период',
            self::Suspended => 'Приостановлена',
            self::PendingVerification => 'На проверке',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'green',
            self::Trial => 'blue',
            self::Suspended => 'red',
            self::PendingVerification => 'yellow',
        };
    }
}

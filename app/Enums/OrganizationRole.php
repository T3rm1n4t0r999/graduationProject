<?php

namespace App\Enums;

enum OrganizationRole: string
{
    case Teacher = 'teacher';

    case Student = 'student';
    case Manager = 'manager';
    case Owner = 'owner';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'Студент',
            self::Teacher => 'Преподаватель',
            self::Manager => 'Менеджер',
            self::Owner => 'Владелец',
        };
    }

    public function isManagerOrOwner(): bool
    {
        return in_array($this, [self::Manager, self::Owner], true);
    }
}

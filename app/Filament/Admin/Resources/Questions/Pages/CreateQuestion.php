<?php

namespace App\Filament\Admin\Resources\Questions\Pages;

use App\Filament\Admin\Resources\Questions\QuestionResource;
use Filament\Resources\Pages\CreateRecord;

class CreateQuestion extends CreateRecord
{
    protected static string $resource = QuestionResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

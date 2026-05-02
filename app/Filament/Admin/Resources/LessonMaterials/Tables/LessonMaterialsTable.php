<?php

namespace App\Filament\Admin\Resources\LessonMaterials\Tables;

use App\Models\LessonMaterial;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class LessonMaterialsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $tenant = \Filament\Facades\Filament::getTenant();

                if ($tenant) {
                    return $query->where('organization_id', $tenant->id);
                }

                return $query->whereRaw('1 = 0');
            })

            ->columns([
                TextColumn::make('title')
                    ->label('Название')
                    ->searchable()
                    ->sortable(),

                BadgeColumn::make('material_type')
                    ->label('Тип')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'theory' => 'Теория',
                        'example' => 'Пример',
                        'reference' => 'Справочник',
                        'video_lesson' => 'Видеоурок',
                        'article' => 'Статья',
                        default => $state,
                    })
                    ->colors([
                        'theory' => 'primary',
                        'example' => 'success',
                        'reference' => 'info',
                        'video_lesson' => 'warning',
                        'article' => 'gray',
                    ]),

                TextColumn::make('lesson.title')
                    ->label('Урок')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('lesson.module.title')
                    ->label('Модуль')
                    ->sortable(),

                TextColumn::make('files_count')
                    ->label('Файлов')
                    ->counts('files')
                    ->badge()
                    ->color('gray'),

                TextColumn::make('order')
                    ->label('Порядок')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Создан')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
                SelectFilter::make('material_type')
                    ->label('Тип материала')
                    ->options([
                        'theory' => 'Теория',
                        'example' => 'Пример',
                        'reference' => 'Справочник',
                        'video_lesson' => 'Видеоурок',
                        'article' => 'Статья',
                    ]),

                Filter::make('title')
                    ->form([
                        TextInput::make('title_search')
                            ->label('Поиск по названию')
                            ->placeholder('Введите название...'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['title_search'],
                            fn (Builder $query, $search) => $query->where('title', 'like', "%{$search}%")
                        );
                    }),
            ])

            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])

            ->bulkActions([
                // Массовые действия при необходимости
            ])

            ->headerActions([
                CreateAction::make()
                    ->label('Создать материал'),
            ]);
    }
}

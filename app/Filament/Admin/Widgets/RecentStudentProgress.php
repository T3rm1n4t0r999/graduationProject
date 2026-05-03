<?php

namespace App\Filament\Admin\Widgets;

use App\Models\StudentProgress;
use Filament\Widgets\TableWidget as BaseWidget;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class RecentStudentProgress extends BaseWidget implements Tables\Contracts\HasTable
{
    use Tables\Concerns\InteractsWithTable;

    protected static ?string $heading = 'Последние выполнения заданий';

    protected int | string | array $columnSpan = 'full';

    protected function getTableQuery(): Builder
    {
        $organization = filament()->getTenant();

        if (!$organization) {
            return StudentProgress::whereRaw('1 = 0'); // Более чистый способ вернуть пустоту
        }

        return StudentProgress::where('organization_id', $organization->id)
            ->with(['student', 'progressable'])
            ->latest('updated_at');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('student.firstname')
                    ->label('Студент')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('progressable.title')
                    ->label('Задание')
                    ->limit(30)
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= 30) {
                            return null;
                        }
                        return $state;
                    }),

                Tables\Columns\BadgeColumn::make('progressable_type')
                    ->label('Тип')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'App\\Models\\LessonTask' => 'Учебное задание',
                        'App\\Models\\Homework' => 'Домашнее задание',
                        default => $state,
                    })
                    ->colors([
                        'primary' => 'App\\Models\\LessonTask',
                        'success' => 'App\\Models\\Homework',
                    ]),

                Tables\Columns\TextColumn::make('points')
                    ->label('Баллы')
                    ->formatStateUsing(fn ($record): string => "{$record->points} / {$record->max_points}")
                    ->sortable(),

                Tables\Columns\TextColumn::make('attempt')
                    ->label('Попытка')
                    ->sortable(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Дата выполнения')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('updated_at', 'desc')
            ->paginated([10, 25, 50])
            ->defaultPaginationPageOption(10)

            // ✅ ВОТ ЭТО ИСПРАВЛЯЕТ СООБЩЕНИЕ "НЕ НАЙДЕНО":
            ->emptyStateHeading('Нет данных')
            ->emptyStateDescription('Студенты еще не выполняли задания в этой организации.');
    }
}

<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BotResource\Pages;
use App\Models\Bot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class BotResource extends Resource
{
    protected static ?string $model = Bot::class;

    // Исправлено: иконка должна быть строкой, совместимой с Heroicons v2
    protected static string|null|\BackedEnum $navigationIcon = 'heroicon-o-robot';

    protected static ?string $navigationLabel = 'Мой бот';
    protected static ?int $navigationSort = 1;

    // Ограничиваем видимость
    public static function canViewAny(): bool
    {
        $user = Auth::user();
        // Проверка: есть ли пользователь, его организация и бот у организации
        return $user
            && $user->organization
            && $user->organization->bot;
    }

    public static function form(\Filament\Schemas\Schema $form): \Filament\Schemas\Schema
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Информация о боте')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->label('Название бота'),

                        Forms\Components\TextInput::make('token')
                            ->required()
                            ->maxLength(255)
                            ->label('Telegram Token')
                            ->password()
                            ->revealable(),

                        // Внимание: в вашей модели Bot нет поля 'status' в fillable,
                        // но есть 'is_active'. Лучше использовать Toggle или Select для is_active.
                        // Если вы хотите использовать статус как строку, убедитесь, что он есть в БД.
                        // Ниже пример для is_active (boolean), так как это более надежно для вашей модели:

                        Forms\Components\Toggle::make('is_active')
                            ->label('Активен')
                            ->default(true),

                        // Если вы все же хотите использовать поле 'status' (string), раскомментируйте ниже,
                        // но убедитесь, что колонка 'status' есть в миграции bots и в $fillable модели.
                        /*
                        Forms\Components\Select::make('status')
                            ->options([
                                'active' => 'Активен',
                                'stopped' => 'Остановлен',
                            ])
                            ->default('active')
                            ->label('Статус'),
                        */
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->query(function ($query) {
                $user = Auth::user();
                if (!$user || !$user->organization) {
                    return $query->whereRaw('1 = 0'); // Более надежный способ вернуть пустую выборку
                }
                // Фильтруем по организации текущего пользователя
                return $query->where('organization_id', $user->organization->id);
            })
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->label('Название'),

                // Используем is_active для отображения статуса
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Статус'),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->label('Создан')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    // Отключаем массовое удаление, если не нужно
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBots::route('/'),
            'edit' => Pages\EditBot::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    // Важно: Запрещаем удаление, если бот должен быть всегда один
    public static function canDelete($record): bool
    {
        return false;
    }
}

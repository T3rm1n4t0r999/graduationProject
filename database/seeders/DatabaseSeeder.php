<?php

namespace Database\Seeders;

use App\Models\Bot;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1️⃣ Сначала создаём пользователей
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $users = User::factory()->count(10)->create();

//        // 2️⃣ Создаём организации и заполняем pivot organization_user
//        $organizations = Organization::factory()
//            ->count(5)
//            ->create()
//            ->each(function ($org) use ($users) {
//                $owner = $users->random();
//
//                $org->users()->attach($owner->id, [
//                    'role' => 'owner',
//                    'is_active' => true,
//                    'joined_at' => now(),
//                    'invited_at' => now(),
//                ]);
//
//                // Добавляем 1-3 случайных сотрудников
//                $members = $users->where('id', '!=', $owner->id)->random(rand(1, 3));
//
//                foreach ($members as $member) {
//                    $org->users()->attach($member->id, [
//                        'role' => fake()->randomElement(['admin', 'manager', 'member']),
//                        'is_active' => fake()->boolean(90), // 90% активных
//                        'joined_at' => now()->subDays(rand(1, 30)),
//                        'invited_at' => now()->subDays(rand(35, 40)),
//                    ]);
//                }
//            });
//
//        // 3️⃣ Создаём ботов для каждой организации
//        $organizations->each(function ($org) {
//            Bot::factory()
//                ->count(rand(1, 3))
//                ->create([
//                    'organization_id' => $org->id,
//                ]);
//        });
    }
}

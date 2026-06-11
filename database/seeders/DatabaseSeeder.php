<?php

namespace Database\Seeders;

use App\Models\Bot;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\OrganizationUser;
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
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name'              => "User{$i}",
                'email'             => "user{$i}@example.com",
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]);

            OrganizationUser::create([
                'organization_id' => 1,
                'user_id'         => $user->id,
                'role'            => 'manager',
                'is_active'       => true,
            ]);
        }
//        Bot::create([
//            'name' => 'Super Admin',
//            'bot_url' => '@online_ege_school_bot',
//            'token' => '7830450993:AAHIx2gzOr_2ZFjUGg-HR-o0Ofh5BUkNgiQ',
//            'organization_id' => 1,
//        ]);
//
//        Invitation::create([
//            'organization_id' => 1,
//            'sender_id' => 1,
//            'email' => 'admin@example.com',
//            'type' => 'student',
//            'token'=>'123',
//            'expires_at' => now()->addDays(30),
//        ]);
    }
}

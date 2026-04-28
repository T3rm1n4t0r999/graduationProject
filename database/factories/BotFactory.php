<?php

namespace Database\Factories;

use App\Models\Bot;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bot>
 */
class BotFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'token' => fake()->text(10),
            'organization_id' => rand(2,3),
            'is_active' => false,
        ];
    }
}

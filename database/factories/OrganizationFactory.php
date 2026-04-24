<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'owner_id' => 1,
            'email' => fake()->unique()->safeEmail(),
            'status' => fake()->randomElement(['active', 'trial', 'pending_verification']),
        ];
    }
}

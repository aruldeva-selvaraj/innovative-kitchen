<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Brand>
 */
class BrandFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'logo'        => 'https://placehold.co/160x80/f3f4f6/374151?text=' . urlencode($name),
            'description' => fake()->sentence(),
            'is_featured' => fake()->boolean(40),
            'sort_order'  => fake()->numberBetween(1, 100),
        ];
    }
}

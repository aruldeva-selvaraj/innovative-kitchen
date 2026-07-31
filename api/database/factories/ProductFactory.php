<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name          = fake()->unique()->words(3, true);
        $price         = fake()->randomFloat(2, 200, 50000);
        $hasDiscount   = fake()->boolean(40);
        $originalPrice = $hasDiscount ? round($price * fake()->randomFloat(2, 1.1, 1.5), 2) : null;

        return [
            'name'              => ucwords($name),
            'slug'              => Str::slug($name),
            'sku'               => strtoupper(fake()->unique()->bothify('##??-####')),
            'thumbnail'         => 'https://placehold.co/400x400/f3f4f6/374151?text=' . urlencode(ucwords($name)),
            'images'            => [],
            'price'             => $price,
            'original_price'    => $originalPrice,
            'short_description' => fake()->sentence(12),
            'description'       => fake()->paragraphs(3, true),
            'is_new'            => fake()->boolean(20),
            'is_featured'       => fake()->boolean(15),
            'in_stock'          => fake()->boolean(85),
            'stock_qty'         => fake()->numberBetween(0, 200),
            'category_id'       => Category::factory(),
            'brand_id'          => Brand::factory(),
            'specs'             => null,
            'tags'              => [],
            'rating'            => fake()->optional(0.7)->randomFloat(2, 3.0, 5.0),
            'review_count'      => fake()->numberBetween(0, 300),
            'sales_count'       => fake()->numberBetween(0, 1000),
            'is_active'         => true,
        ];
    }

    public function featured(): static
    {
        return $this->state(['is_featured' => true]);
    }

    public function newArrival(): static
    {
        return $this->state(['is_new' => true]);
    }

    public function withDiscount(float $discountPct = 0.20): static
    {
        return $this->state(function (array $attributes) use ($discountPct) {
            $original = $attributes['price'];

            return [
                'original_price' => round($original / (1 - $discountPct), 2),
            ];
        });
    }

    public function bestSeller(): static
    {
        return $this->state(['sales_count' => fake()->numberBetween(500, 3000)]);
    }
}

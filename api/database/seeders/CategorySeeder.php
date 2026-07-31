<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            ['name' => 'Commercial Cooking Equipment', 'featured' => true, 'sort' => 1, 'children' => [
                'Commercial Gas Ranges',
                'Commercial Electric Ovens',
                'Combi Ovens',
                'Commercial Grills & Griddles',
                'Deep Fryers',
                'Salamanders & Broilers',
                'Induction Cookers',
            ]],
            ['name' => 'Commercial Refrigeration', 'featured' => true, 'sort' => 2, 'children' => [
                'Commercial Upright Refrigerators',
                'Commercial Freezers',
                'Display Chillers & Showcase',
                'Ice Machines',
                'Under-Counter Refrigerators',
                'Cold Rooms',
            ]],
            ['name' => 'Food Preparation Equipment', 'featured' => true, 'sort' => 3, 'children' => [
                'Commercial Mixers',
                'Food Processors & Cutters',
                'Vegetable Prep Machines',
                'Meat Grinders & Mincers',
                'Slicers',
                'Peelers',
            ]],
            ['name' => 'Warewashing Equipment', 'featured' => false, 'sort' => 4, 'children' => [
                'Commercial Dishwashers',
                'Glass Washers',
                'Pot Washers',
                'Rack Conveyor Dishwashers',
            ]],
            ['name' => 'Food Display & Serving', 'featured' => true, 'sort' => 5, 'children' => [
                'Hot Display Cases',
                'Cold Display Cases',
                'Buffet Counters',
                'Heated Display Cabinets',
            ]],
            ['name' => 'Beverage Equipment', 'featured' => true, 'sort' => 6, 'children' => [
                'Commercial Coffee Machines',
                'Juice Extractors',
                'Water Dispensers & Coolers',
                'Commercial Blenders',
                'Soft Drink Dispensers',
                'Tea Brewers',
            ]],
            ['name' => 'Bakery Equipment', 'featured' => false, 'sort' => 7, 'children' => [
                'Deck Ovens',
                'Convection Ovens',
                'Dough Mixers',
                'Bread Slicers',
                'Proofing Cabinets',
                'Dough Sheeters',
            ]],
            ['name' => 'Kitchen Ventilation', 'featured' => false, 'sort' => 8, 'children' => [
                'Exhaust Hoods',
                'Make-Up Air Units',
                'Grease Filters',
                'Ventilation Fans',
            ]],
            ['name' => 'Catering & Buffet', 'featured' => true, 'sort' => 9, 'children' => [
                'Chafing Dishes',
                'Bain Marie',
                'Service Trolleys',
                'Food Warmers',
                'Carving Stations',
            ]],
            ['name' => 'Kitchen Smallwares', 'featured' => false, 'sort' => 10, 'children' => [
                'Commercial Pots & Pans',
                'Professional Knives',
                'Kitchen Utensils',
                'Bakeware & Molds',
            ]],
            ['name' => 'Storage & Shelving', 'featured' => false, 'sort' => 11, 'children' => [
                'Wire Shelving Units',
                'Solid Shelving',
                'Storage Containers',
                'Mobile Storage Racks',
            ]],
            ['name' => 'Bar Equipment', 'featured' => false, 'sort' => 12, 'children' => [
                'Bar Refrigerators',
                'Ice Bins & Crushers',
                'Draft Beer Systems',
                'Bar Blenders',
            ]],
            ['name' => 'Outdoor Grills & BBQ', 'featured' => false, 'sort' => 13, 'children' => [
                'Charcoal BBQ Grills',
                'Gas BBQ Grills',
                'Tandoor Ovens',
                'Outdoor Cooking Accessories',
            ]],
            ['name' => 'Hotel & Hospitality Supplies', 'featured' => true, 'sort' => 14, 'children' => [
                'Room Service Trolleys',
                'Banquet Equipment',
                'Housekeeping Trolleys',
                'Amenity Dispensers',
            ]],
        ];

        foreach ($tree as $root) {
            $rootId = DB::table('categories')->insertGetId([
                'name'        => $root['name'],
                'slug'        => Str::slug($root['name']),
                'description' => 'Premium commercial ' . strtolower($root['name']) . ' for UAE hospitality and foodservice.',
                'parent_id'   => null,
                'is_featured' => $root['featured'],
                'sort_order'  => $root['sort'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            foreach ($root['children'] as $i => $childName) {
                DB::table('categories')->insert([
                    'name'        => $childName,
                    'slug'        => Str::slug($childName),
                    'description' => $childName . ' for commercial kitchens in the UAE.',
                    'parent_id'   => $rootId,
                    'is_featured' => false,
                    'sort_order'  => $i + 1,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }
    }
}

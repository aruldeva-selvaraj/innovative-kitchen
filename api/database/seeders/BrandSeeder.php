<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Rational',              'country' => 'Germany',      'featured' => true,  'sort' => 1],
            ['name' => 'Hobart',                'country' => 'USA',          'featured' => true,  'sort' => 2],
            ['name' => 'Hoshizaki',             'country' => 'Japan',        'featured' => true,  'sort' => 3],
            ['name' => 'Electrolux Professional', 'country' => 'Italy',      'featured' => true,  'sort' => 4],
            ['name' => 'Robot Coupe',           'country' => 'France',       'featured' => true,  'sort' => 5],
            ['name' => 'Vitamix',               'country' => 'USA',          'featured' => true,  'sort' => 6],
            ['name' => 'La Marzocco',           'country' => 'Italy',        'featured' => true,  'sort' => 7],
            ['name' => 'Winterhalter',          'country' => 'Germany',      'featured' => true,  'sort' => 8],
            ['name' => 'True Refrigeration',    'country' => 'USA',          'featured' => false, 'sort' => 9],
            ['name' => 'Vulcan',                'country' => 'USA',          'featured' => false, 'sort' => 10],
            ['name' => 'Garland',               'country' => 'USA',          'featured' => false, 'sort' => 11],
            ['name' => 'Alto-Shaam',            'country' => 'USA',          'featured' => false, 'sort' => 12],
            ['name' => 'Turbochef',             'country' => 'USA',          'featured' => false, 'sort' => 13],
            ['name' => 'Manitowoc',             'country' => 'USA',          'featured' => false, 'sort' => 14],
            ['name' => 'Atosa',                 'country' => 'USA',          'featured' => false, 'sort' => 15],
            ['name' => 'Cambro',                'country' => 'USA',          'featured' => false, 'sort' => 16],
            ['name' => 'Franke Coffee Systems', 'country' => 'Switzerland',  'featured' => true,  'sort' => 17],
            ['name' => 'Comenda',               'country' => 'Italy',        'featured' => false, 'sort' => 18],
            ['name' => 'Faema',                 'country' => 'Italy',        'featured' => false, 'sort' => 19],
            ['name' => 'Blodgett',              'country' => 'USA',          'featured' => false, 'sort' => 20],
            ['name' => 'Middleby Marshall',     'country' => 'USA',          'featured' => false, 'sort' => 21],
            ['name' => 'Cleveland Range',       'country' => 'USA',          'featured' => false, 'sort' => 22],
            ['name' => 'Welbilt',               'country' => 'USA',          'featured' => false, 'sort' => 23],
            ['name' => 'Meiko',                 'country' => 'Germany',      'featured' => false, 'sort' => 24],
            ['name' => 'Carpigiani',            'country' => 'Italy',        'featured' => false, 'sort' => 25],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->insertOrIgnore([
                'name'        => $brand['name'],
                'slug'        => Str::slug($brand['name']),
                'logo'        => 'https://placehold.co/160x80/f3f4f6/374151?text=' . urlencode($brand['name']),
                'description' => 'Leading manufacturer of commercial kitchen equipment from ' . $brand['country'] . '.',
                'is_featured' => $brand['featured'],
                'sort_order'  => $brand['sort'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }
}

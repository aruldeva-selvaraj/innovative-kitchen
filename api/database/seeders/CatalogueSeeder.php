<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeds brands, categories, and products sourced from:
 *  - Creative Display quotation (DB/22/07/2026/421) — 4 island freezers with exact prices
 *  - Creative Display product catalogue 2025-2026 — Sagi, Angelo Po, Mastercool,
 *    Berjaya, Roller Grill, Robot-Coupe, Santos, Brema, Kromo, Convotherm
 *
 * Images: set to placehold.co stubs. Replace paths with real product images extracted
 * from the catalogue PDF and placed in public/assets/products/{slug}.jpg
 */
class CatalogueSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBrands();
        $this->seedCategories();
        $this->seedProducts();
    }

    // ─────────────────────────────────────────────
    // BRANDS
    // ─────────────────────────────────────────────
    private function seedBrands(): void
    {
        $brands = [
            // Brands from the Creative Display catalogue
            ['name' => 'Sagi',              'slug' => 'sagi',              'country' => 'Italy',    'featured' => true,  'sort' => 26],
            ['name' => 'Angelo Po',         'slug' => 'angelo-po',         'country' => 'Italy',    'featured' => true,  'sort' => 27],
            ['name' => 'Mastercool',        'slug' => 'mastercool',        'country' => 'Italy',    'featured' => true,  'sort' => 28],
            ['name' => 'Berjaya',           'slug' => 'berjaya',           'country' => 'Malaysia', 'featured' => true,  'sort' => 29],
            ['name' => 'Roller Grill',      'slug' => 'roller-grill',      'country' => 'France',   'featured' => true,  'sort' => 30],
            ['name' => 'Santos',            'slug' => 'santos',            'country' => 'France',   'featured' => false, 'sort' => 31],
            ['name' => 'Brema Ice Makers',  'slug' => 'brema-ice-makers',  'country' => 'Italy',    'featured' => true,  'sort' => 32],
            ['name' => 'Kromo',             'slug' => 'kromo',             'country' => 'Italy',    'featured' => false, 'sort' => 33],
            ['name' => 'Convotherm',        'slug' => 'convotherm',        'country' => 'Germany',  'featured' => true,  'sort' => 34],
            ['name' => 'Creative Display',  'slug' => 'creative-display',  'country' => 'UAE',      'featured' => true,  'sort' => 35],
            ['name' => 'Universal',         'slug' => 'universal',         'country' => 'Turkey',   'featured' => false, 'sort' => 36],
            ['name' => 'Diktas',            'slug' => 'diktas',            'country' => 'Turkey',   'featured' => false, 'sort' => 37],
            ['name' => 'Fricon',            'slug' => 'fricon',            'country' => 'Portugal', 'featured' => false, 'sort' => 38],
            ['name' => 'Menumaster',        'slug' => 'menumaster',        'country' => 'USA',      'featured' => false, 'sort' => 39],
        ];

        foreach ($brands as $b) {
            DB::table('brands')->insertOrIgnore([
                'name'        => $b['name'],
                'slug'        => $b['slug'],
                'logo'        => "https://placehold.co/160x60/1a1a2e/ffffff?text={$b['name']}",
                'description' => "{$b['name']} — professional commercial kitchen & refrigeration equipment from {$b['country']}. Distributed across UAE by Innovative Kitchen.",
                'is_featured' => $b['featured'],
                'sort_order'  => $b['sort'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    // ─────────────────────────────────────────────
    // CATEGORIES
    // ─────────────────────────────────────────────
    private function seedCategories(): void
    {
        // New parent: Supermarket Equipment & Refrigeration
        $supermarketId = DB::table('categories')->insertGetId([
            'name'        => 'Supermarket Equipment & Refrigeration',
            'slug'        => 'supermarket-equipment-refrigeration',
            'description' => 'Complete supermarket solutions including island freezers, chest freezers, multideck chillers, gondola shelving, checkout counters and trolleys.',
            'icon'        => '🏪',
            'parent_id'   => null,
            'is_featured' => true,
            'sort_order'  => 15,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $supermarketChildren = [
            'Island Freezers',
            'Chest Freezers',
            'Multideck Display Chillers',
            'Meat & Deli Display Chillers',
            'Gondola & Wall Shelving',
            'Checkout Counters',
            'Supermarket Baskets & Trolleys',
        ];

        foreach ($supermarketChildren as $i => $name) {
            DB::table('categories')->insertOrIgnore([
                'name'        => $name,
                'slug'        => Str::slug($name),
                'description' => "{$name} for supermarkets, hypermarkets and retail stores across UAE.",
                'parent_id'   => $supermarketId,
                'is_featured' => false,
                'sort_order'  => $i + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // New parent: Warehouse & Industrial Storage
        $warehouseId = DB::table('categories')->insertGetId([
            'name'        => 'Warehouse & Industrial Storage',
            'slug'        => 'warehouse-industrial-storage',
            'description' => 'Heavy and medium duty racking, wire shelving, pallet systems and mobile ladders for warehouses and industrial use.',
            'icon'        => '🏭',
            'parent_id'   => null,
            'is_featured' => false,
            'sort_order'  => 16,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $warehouseChildren = [
            'Heavy Duty Racking',
            'Medium Duty Racking',
            'Wire Shelving Systems',
            'Pallet Jacks & Handling',
        ];

        foreach ($warehouseChildren as $i => $name) {
            DB::table('categories')->insertOrIgnore([
                'name'        => $name,
                'slug'        => Str::slug($name),
                'description' => "{$name} for warehouses and storage facilities across UAE.",
                'parent_id'   => $warehouseId,
                'is_featured' => false,
                'sort_order'  => $i + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Add Blast Chillers & Shock Freezers under Commercial Refrigeration
        $refrigerationId = DB::table('categories')->where('slug', 'commercial-refrigeration')->value('id');
        if ($refrigerationId) {
            DB::table('categories')->insertOrIgnore([
                'name'        => 'Blast Chillers & Shock Freezers',
                'slug'        => 'blast-chillers-shock-freezers',
                'description' => 'Professional blast chillers and shock freezers for rapid temperature reduction in compliance with HACCP standards.',
                'parent_id'   => $refrigerationId,
                'is_featured' => false,
                'sort_order'  => 7,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Add Shawarma & Rotisserie under Commercial Cooking
        $cookingId = DB::table('categories')->where('slug', 'commercial-cooking-equipment')->value('id');
        if ($cookingId) {
            DB::table('categories')->insertOrIgnore([
                'name'        => 'Shawarma & Rotisserie Machines',
                'slug'        => 'shawarma-rotisserie-machines',
                'description' => 'Commercial shawarma machines, rotisserie chicken machines and vertical broilers for restaurants and fast food outlets.',
                'parent_id'   => $cookingId,
                'is_featured' => false,
                'sort_order'  => 8,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    // ─────────────────────────────────────────────
    // PRODUCTS
    // ─────────────────────────────────────────────
    private function seedProducts(): void
    {
        foreach ($this->getProducts() as $product) {
            $categoryId = DB::table('categories')->where('slug', $product['category_slug'])->value('id');
            $brandId    = DB::table('brands')->where('slug', $product['brand_slug'])->value('id');

            if (! $categoryId || ! $brandId) {
                continue;
            }

            $slug = Str::slug($product['name']);
            // Ensure unique slug
            $base = $slug; $i = 1;
            while (DB::table('products')->where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }

            DB::table('products')->insert([
                'name'              => $product['name'],
                'slug'              => $slug,
                'sku'               => $product['sku'],
                'thumbnail'         => $product['thumbnail'],
                'images'            => json_encode($product['images'] ?? []),
                'price'             => $product['price'],
                'original_price'    => $product['original_price'] ?? null,
                'short_description' => $product['short_description'],
                'description'       => $product['description'],
                'is_new'            => $product['is_new'] ?? false,
                'is_featured'       => $product['is_featured'] ?? false,
                'in_stock'          => true,
                'stock_qty'         => $product['stock_qty'] ?? 5,
                'category_id'       => $categoryId,
                'brand_id'          => $brandId,
                'specs'             => json_encode($product['specs'] ?? []),
                'tags'              => json_encode($product['tags'] ?? []),
                'rating'            => $product['rating'] ?? 4.5,
                'review_count'      => $product['review_count'] ?? 0,
                'sales_count'       => $product['sales_count'] ?? 0,
                'is_active'         => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
    }

    /** @return array<int,array<string,mixed>> */
    private function getProducts(): array
    {
        $img = fn(string $color, string $text) =>
            'https://placehold.co/400x400/' . $color . '/ffffff?text=' . urlencode($text);

        return [

            // ══════════════════════════════════════════════════════════════
            // CREATIVE DISPLAY — Island Freezers
            // SOURCE: Quotation DB/22/07/2026/421 (exact prices & specs)
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Island Freezer RWD-2500 (2500mm)',
                'sku'               => 'RWD-2500',
                'category_slug'     => 'island-freezers',
                'brand_slug'        => 'creative-display',
                'price'             => 4400.00,
                'original_price'    => 4800.00,
                'thumbnail'         => $img('1e3a5f', 'Island+Freezer+RWD-2500'),
                'short_description' => 'Island freezer 2500mm with R290 refrigerant, 1115L total volume, -12 to -22°C. Ideal for supermarkets.',
                'description'       => 'The Creative Display Island Freezer RWD-2500 is a premium open-top island freezer designed for supermarkets and retail stores. With 2500mm length and 1115 litres of display space, it offers maximum product visibility while maintaining -12 to -22°C with eco-friendly R290 refrigerant. Supplied with LED lighting and easily accessible for customer self-service.',
                'is_new'            => true,
                'is_featured'       => true,
                'specs'             => [
                    ['key' => 'Model',         'value' => 'RWD-2500'],
                    ['key' => 'Dimensions',    'value' => '2500 x 650 x 850 mm'],
                    ['key' => 'Temperature',   'value' => '-12°C to -22°C'],
                    ['key' => 'Refrigerant',   'value' => 'R290 (Eco-Friendly)'],
                    ['key' => 'Total Volume',  'value' => '1115 Litres'],
                    ['key' => 'Net Weight',    'value' => '135 kg'],
                    ['key' => 'Origin',        'value' => 'Made in China'],
                    ['key' => 'VAT (5%)',      'value' => 'AED 220 (Total: AED 4,620)'],
                ],
                'tags'         => ['island freezer', 'supermarket', 'open top freezer', 'R290', 'display freezer', 'UAE'],
                'rating'       => 4.8,
                'review_count' => 12,
                'sales_count'  => 24,
                'stock_qty'    => 8,
            ],
            [
                'name'              => 'Island Freezer RWD800D (800L)',
                'sku'               => 'RWD800D',
                'category_slug'     => 'island-freezers',
                'brand_slug'        => 'creative-display',
                'price'             => 3900.00,
                'original_price'    => 4200.00,
                'thumbnail'         => $img('1e3a5f', 'Island+Freezer+800L'),
                'short_description' => 'Chest freezer 800L, 2200x900x780mm, -18 to -22°C, R-134A, 410W. Heavy-duty retail freezer.',
                'description'       => 'The Creative Display RWD800D is a large capacity chest/island freezer providing 800 litres of frozen storage. Ideal for supermarkets, hypermarkets and cold stores. Features robust R-134A refrigeration system with climate class N rating, operating at -18 to -22°C. The flat glass lid design allows easy customer access and clear product display.',
                'specs'             => [
                    ['key' => 'Model',          'value' => 'RWD800Y'],
                    ['key' => 'Dimensions',     'value' => '2200 x 900 x 780 mm'],
                    ['key' => 'Temperature',    'value' => '-18°C to -22°C'],
                    ['key' => 'Refrigerant',    'value' => 'R-134A'],
                    ['key' => 'Volume',         'value' => '800 Litres'],
                    ['key' => 'Power Supply',   'value' => '230V / 50Hz, 410W'],
                    ['key' => 'Climate Class',  'value' => 'N (Normal)'],
                    ['key' => 'Net Weight',     'value' => '116 kg'],
                    ['key' => 'Origin',         'value' => 'Made in China'],
                    ['key' => 'VAT (5%)',       'value' => 'AED 195 (Total: AED 4,095)'],
                ],
                'tags'         => ['island freezer', '800L', 'chest freezer', 'R-134A', 'supermarket freezer', 'UAE'],
                'rating'       => 4.7,
                'review_count' => 9,
                'sales_count'  => 18,
                'stock_qty'    => 10,
            ],
            [
                'name'              => 'Island Freezer RWD700 (700L)',
                'sku'               => 'RWD700',
                'category_slug'     => 'island-freezers',
                'brand_slug'        => 'creative-display',
                'price'             => 3600.00,
                'original_price'    => 3900.00,
                'thumbnail'         => $img('1e3a5f', 'Island+Freezer+700L'),
                'short_description' => 'Chest freezer 700L, 2000x700x940mm, -18 to -22°C, R-134A, 410W. Mid-size retail display freezer.',
                'description'       => 'The Creative Display RWD700 chest freezer offers 700 litres of high-capacity frozen storage in a compact footprint. With dimensions of 2000 x 700 x 940mm, it fits easily into supermarket floor plans. R-134A refrigerant ensures reliable and efficient operation at -18 to -22°C for year-round UAE climates.',
                'specs'             => [
                    ['key' => 'Model',          'value' => 'RWD700Y'],
                    ['key' => 'Dimensions',     'value' => '2000 x 700 x 940 mm'],
                    ['key' => 'Temperature',    'value' => '-18°C to -22°C'],
                    ['key' => 'Refrigerant',    'value' => 'R-134A'],
                    ['key' => 'Volume',         'value' => '700 Litres'],
                    ['key' => 'Power Supply',   'value' => '230V / 50Hz, 410W'],
                    ['key' => 'Climate Class',  'value' => 'N (Normal)'],
                    ['key' => 'Net Weight',     'value' => '116 kg'],
                    ['key' => 'Origin',         'value' => 'Made in China'],
                    ['key' => 'VAT (5%)',       'value' => 'AED 180 (Total: AED 3,780)'],
                ],
                'tags'         => ['island freezer', '700L', 'chest freezer', 'supermarket', 'UAE'],
                'rating'       => 4.6,
                'review_count' => 7,
                'sales_count'  => 15,
                'stock_qty'    => 10,
            ],
            [
                'name'              => 'Island Freezer RWD580D (580L)',
                'sku'               => 'RWD580D',
                'category_slug'     => 'island-freezers',
                'brand_slug'        => 'creative-display',
                'price'             => 3400.00,
                'original_price'    => 3700.00,
                'thumbnail'         => $img('1e3a5f', 'Island+Freezer+580L'),
                'short_description' => 'Compact island freezer 580L, 1600x900x780mm, -18 to -22°C, R-134A. Best for small supermarkets.',
                'description'       => 'The Creative Display RWD580D is a compact 580-litre island/chest freezer ideal for smaller supermarkets, convenience stores and pharmacies. Measuring 1600 x 900 x 780mm, it offers great product visibility and energy-efficient R-134A refrigeration maintaining -18 to -22°C reliably.',
                'specs'             => [
                    ['key' => 'Model',          'value' => 'RWD580Y'],
                    ['key' => 'Dimensions',     'value' => '1600 x 900 x 780 mm'],
                    ['key' => 'Temperature',    'value' => '-18°C to -22°C'],
                    ['key' => 'Refrigerant',    'value' => 'R-134A'],
                    ['key' => 'Volume',         'value' => '580 Litres'],
                    ['key' => 'Power Supply',   'value' => '230V / 50Hz, 410W'],
                    ['key' => 'Climate Class',  'value' => 'N (Normal)'],
                    ['key' => 'Net Weight',     'value' => '116 kg'],
                    ['key' => 'Origin',         'value' => 'Made in China'],
                    ['key' => 'VAT (5%)',       'value' => 'AED 170 (Total: AED 3,570)'],
                ],
                'tags'         => ['island freezer', '580L', 'chest freezer', 'compact', 'UAE'],
                'rating'       => 4.6,
                'review_count' => 5,
                'sales_count'  => 11,
                'stock_qty'    => 12,
            ],

            // ══════════════════════════════════════════════════════════════
            // SAGI (Italy) — Professional Commercial Refrigeration
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Sagi KSA4M Counter Chiller (4 Drawers)',
                'sku'               => 'SAGI-KSA4M',
                'category_slug'     => 'under-counter-refrigerators',
                'brand_slug'        => 'sagi',
                'price'             => 4800.00,
                'is_featured'       => false,
                'thumbnail'         => $img('374151', 'Sagi+KSA4M'),
                'short_description' => 'Italian-made 4-drawer counter chiller, stainless steel. HACCP compliant. Made in Italy.',
                'description'       => 'The Sagi KSA4M is a premium Italian-engineered under-counter refrigerator with 4 drawers, designed for professional kitchens. Made from high-quality stainless steel with sturdy, functional design ensuring reliable performance even in hot and humid environments typical of UAE kitchens.',
                'specs'             => [
                    ['key' => 'Model',       'value' => 'KSA4M'],
                    ['key' => 'Type',        'value' => 'Under-Counter Chiller – 4 Drawers'],
                    ['key' => 'Brand',       'value' => 'Sagi'],
                    ['key' => 'Origin',      'value' => 'Made in Italy'],
                    ['key' => 'Material',    'value' => 'Stainless Steel'],
                    ['key' => 'Compliance',  'value' => 'HACCP Certified'],
                    ['key' => 'Warranty',    'value' => '1 Year'],
                ],
                'tags'         => ['counter chiller', 'under counter', 'sagi', 'italy', 'HACCP', 'professional kitchen'],
                'rating'       => 4.7, 'review_count' => 8, 'sales_count' => 14,
            ],
            [
                'name'              => 'Sagi KIABM Counter Freezer (2 Door)',
                'sku'               => 'SAGI-KIABM',
                'category_slug'     => 'under-counter-refrigerators',
                'brand_slug'        => 'sagi',
                'price'             => 5200.00,
                'thumbnail'         => $img('374151', 'Sagi+KIABM'),
                'short_description' => 'Sagi 2-door under-counter freezer. Stainless steel, professional-grade. Made in Italy.',
                'description'       => 'The Sagi KIABM is a professional 2-door under-counter freezer designed for commercial kitchens. Sagi\'s robust Italian engineering ensures reliable freezing performance in demanding environments, with easy-clean stainless steel exterior and interior.',
                'specs'             => [
                    ['key' => 'Model',    'value' => 'KIABM'],
                    ['key' => 'Type',     'value' => 'Under-Counter Freezer – 2 Door'],
                    ['key' => 'Origin',   'value' => 'Made in Italy'],
                    ['key' => 'Material', 'value' => 'Stainless Steel'],
                    ['key' => 'Warranty', 'value' => '1 Year'],
                ],
                'tags' => ['counter freezer', 'sagi', 'under-counter', 'italy'],
                'rating' => 4.6, 'review_count' => 5, 'sales_count' => 9,
            ],
            [
                'name'              => 'Sagi FD70T Upright Chiller (Single Door)',
                'sku'               => 'SAGI-FD70T',
                'category_slug'     => 'commercial-upright-refrigerators',
                'brand_slug'        => 'sagi',
                'price'             => 6200.00,
                'thumbnail'         => $img('374151', 'Sagi+FD70T'),
                'short_description' => 'Sagi upright chiller single door, GN 2/1 capacity, stainless steel. Made in Italy.',
                'description'       => 'The Sagi FD70T is a professional upright single-door chiller with GN 2/1 capacity. Built entirely from stainless steel with Sagi\'s renowned Italian quality, it\'s ideal for restaurants and hotel kitchens requiring reliable cold storage with HACCP compliance.',
                'specs'             => [
                    ['key' => 'Model',    'value' => 'FD70T'],
                    ['key' => 'Type',     'value' => 'Upright Chiller – Single Door'],
                    ['key' => 'Origin',   'value' => 'Made in Italy'],
                    ['key' => 'Material', 'value' => 'Stainless Steel'],
                    ['key' => 'Compliance', 'value' => 'HACCP Certified'],
                ],
                'tags' => ['upright chiller', 'sagi', 'single door', 'GN 2/1', 'italy'],
                'rating' => 4.8, 'review_count' => 11, 'sales_count' => 19,
            ],
            [
                'name'              => 'Sagi DF41M Blast Chiller/Freezer (5 Trays)',
                'sku'               => 'SAGI-DF41M',
                'category_slug'     => 'blast-chillers-shock-freezers',
                'brand_slug'        => 'sagi',
                'price'             => 18500.00,
                'original_price'    => 21000.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1e3a5f', 'Sagi+DF41M+Blast+Chiller'),
                'short_description' => 'Sagi DF41M professional blast chiller/freezer, 5 trays. HACCP compliant. Made in Italy.',
                'description'       => 'The Sagi DF41M is a professional blast chiller and shock freezer with 5-tray capacity. Designed to rapidly reduce food temperature from +90°C to +3°C (blast chilling) or -18°C (shock freezing), ensuring full HACCP compliance. Essential for any professional UAE kitchen following food safety standards.',
                'specs'             => [
                    ['key' => 'Model',         'value' => 'DF41M'],
                    ['key' => 'Function',      'value' => 'Blast Chiller & Shock Freezer'],
                    ['key' => 'Tray Capacity', 'value' => '5 Trays (GN 1/1)'],
                    ['key' => 'Chilling',      'value' => '+90°C to +3°C'],
                    ['key' => 'Freezing',      'value' => '+90°C to -18°C'],
                    ['key' => 'Origin',        'value' => 'Made in Italy'],
                    ['key' => 'Compliance',    'value' => 'HACCP Certified'],
                ],
                'tags' => ['blast chiller', 'shock freezer', 'sagi', 'HACCP', '5 trays', 'italy'],
                'rating' => 4.9, 'review_count' => 6, 'sales_count' => 8,
            ],

            // ══════════════════════════════════════════════════════════════
            // ANGELO PO (Italy) — Commercial Cooking Equipment
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Angelo Po 4 Burner Gas Range (1S0FA0)',
                'sku'               => 'APO-1S0FA0',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'angelo-po',
                'price'             => 3200.00,
                'is_new'            => false,
                'is_featured'       => true,
                'thumbnail'         => $img('92400e', 'Angelo+Po+4+Burner'),
                'short_description' => 'Angelo Po 4 burner gas range, 700 series. Professional Italian cooking equipment. Made in Italy.',
                'description'       => 'Angelo Po 4-burner gas range from the 700 series – designed for medium to high production kitchens. Angelo Po, with nearly 100 years of history, is a market leader in professional cooking solutions. The 1S0FA0 delivers consistent performance for restaurant and hotel kitchens across UAE.',
                'specs'             => [
                    ['key' => 'Model',   'value' => '1S0FA0'],
                    ['key' => 'Burners', 'value' => '4 Burners'],
                    ['key' => 'Fuel',    'value' => 'Gas'],
                    ['key' => 'Series',  'value' => '700mm Depth'],
                    ['key' => 'Origin',  'value' => 'Made in Italy'],
                ],
                'tags' => ['gas range', '4 burner', 'angelo po', 'italy', 'cooking equipment'],
                'rating' => 4.7, 'review_count' => 14, 'sales_count' => 28,
            ],
            [
                'name'              => 'Angelo Po 6 Burner Gas Range (2S0FA0)',
                'sku'               => 'APO-2S0FA0',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'angelo-po',
                'price'             => 4500.00,
                'thumbnail'         => $img('92400e', 'Angelo+Po+6+Burner'),
                'short_description' => 'Angelo Po 6 burner gas range. High output for large restaurant & hotel kitchens. Made in Italy.',
                'description'       => 'The Angelo Po 2S0FA0 6-burner gas range is built for high-volume commercial kitchens. With 6 independent burners delivering maximum heat output, this Italian-engineered range is the choice of professional chefs across UAE.',
                'specs'             => [
                    ['key' => 'Model',   'value' => '2S0FA0'],
                    ['key' => 'Burners', 'value' => '6 Burners'],
                    ['key' => 'Fuel',    'value' => 'Gas'],
                    ['key' => 'Origin',  'value' => 'Made in Italy'],
                ],
                'tags' => ['gas range', '6 burner', 'angelo po', 'italy', 'high output'],
                'rating' => 4.8, 'review_count' => 10, 'sales_count' => 18,
            ],
            [
                'name'              => 'Angelo Po 4 Burner Gas Range + Static Oven (1N1FAAG)',
                'sku'               => 'APO-1N1FAAG',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'angelo-po',
                'price'             => 5800.00,
                'is_featured'       => true,
                'thumbnail'         => $img('92400e', 'Angelo+Po+4B+Oven'),
                'short_description' => 'Angelo Po 4 burner range with static gas oven below. Complete range solution. Made in Italy.',
                'description'       => 'The Angelo Po 1N1FAAG combines a 4-burner gas range with a full-size static oven, providing a complete cooking station in one unit. Ideal for restaurants, hotels and catering operations requiring versatile cooking capabilities.',
                'specs'             => [
                    ['key' => 'Model',   'value' => '1N1FAAG'],
                    ['key' => 'Burners', 'value' => '4 Burners'],
                    ['key' => 'Oven',    'value' => 'Static Gas Oven'],
                    ['key' => 'Fuel',    'value' => 'Gas'],
                    ['key' => 'Origin',  'value' => 'Made in Italy'],
                ],
                'tags' => ['gas range with oven', '4 burner oven', 'angelo po', 'italy', 'range cooker'],
                'rating' => 4.8, 'review_count' => 8, 'sales_count' => 13,
            ],
            [
                'name'              => 'Angelo Po 6 Burner Gas Range + Static Oven (2N1FAGF)',
                'sku'               => 'APO-2N1FAGF',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'angelo-po',
                'price'             => 7200.00,
                'thumbnail'         => $img('92400e', 'Angelo+Po+6B+Oven'),
                'short_description' => 'Angelo Po 6 burner range with static oven. Maximum capacity for large kitchens. Made in Italy.',
                'description'       => 'The Angelo Po 2N1FAGF is the professional\'s choice for high-volume kitchens – a 6-burner gas range with full-size static oven. Perfect for 5-star hotels, large restaurants and catering companies.',
                'specs'             => [
                    ['key' => 'Model',   'value' => '2N1FAGF'],
                    ['key' => 'Burners', 'value' => '6 Burners'],
                    ['key' => 'Oven',    'value' => 'Static Gas Oven'],
                    ['key' => 'Fuel',    'value' => 'Gas'],
                    ['key' => 'Origin',  'value' => 'Made in Italy'],
                ],
                'tags' => ['gas range 6 burner', 'gas oven', 'angelo po', 'high volume', 'italy'],
                'rating' => 4.9, 'review_count' => 6, 'sales_count' => 9,
            ],
            [
                'name'              => 'Angelo Po Gas Fryer 22L (0N1FR1G)',
                'sku'               => 'APO-0N1FR1G',
                'category_slug'     => 'deep-fryers',
                'brand_slug'        => 'angelo-po',
                'price'             => 3400.00,
                'thumbnail'         => $img('92400e', 'Angelo+Po+Fryer+22L'),
                'short_description' => 'Angelo Po gas fryer 22L capacity. Professional Italian kitchen equipment. Made in Italy.',
                'description'       => 'The Angelo Po 0N1FR1G is a high-performance gas fryer with 22-litre oil capacity, ideal for restaurants and fast food outlets. Precision temperature control and rapid recovery time ensure consistent frying results.',
                'specs'             => [
                    ['key' => 'Model',       'value' => '0N1FR1G'],
                    ['key' => 'Type',        'value' => 'Gas Fryer'],
                    ['key' => 'Oil Capacity','value' => '22 Litres'],
                    ['key' => 'Fuel',        'value' => 'Gas'],
                    ['key' => 'Origin',      'value' => 'Made in Italy'],
                ],
                'tags' => ['gas fryer', '22L', 'angelo po', 'italy', 'deep fryer'],
                'rating' => 4.6, 'review_count' => 9, 'sales_count' => 17,
            ],
            [
                'name'              => 'Angelo Po Gas Salamander (60SM)',
                'sku'               => 'APO-60SM',
                'category_slug'     => 'salamanders-broilers',
                'brand_slug'        => 'angelo-po',
                'price'             => 4200.00,
                'thumbnail'         => $img('92400e', 'Angelo+Po+Salamander'),
                'short_description' => 'Angelo Po gas salamander grill. Professional overhead grill for restaurants. Made in Italy.',
                'description'       => 'The Angelo Po 60SM gas salamander delivers powerful overhead grilling for professional kitchens. Used for finishing dishes, melting cheese, glazing and browning. A must-have in any high-end restaurant or hotel kitchen.',
                'specs'             => [
                    ['key' => 'Model',  'value' => '60SM'],
                    ['key' => 'Type',   'value' => 'Gas Salamander'],
                    ['key' => 'Fuel',   'value' => 'Gas'],
                    ['key' => 'Origin', 'value' => 'Made in Italy'],
                ],
                'tags' => ['salamander', 'grill', 'angelo po', 'gas', 'overhead grill', 'italy'],
                'rating' => 4.7, 'review_count' => 7, 'sales_count' => 12,
            ],

            // ══════════════════════════════════════════════════════════════
            // MASTERCOOL (Italy) — Professional Commercial Refrigeration
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Mastercool Open Chiller RMCVMD 2000mm',
                'sku'               => 'MCL-RMCVMD-2000',
                'category_slug'     => 'display-chillers-showcase',
                'brand_slug'        => 'mastercool',
                'price'             => 8500.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1e3a5f', 'Mastercool+Open+Chiller'),
                'short_description' => 'Mastercool open display chiller 2000mm. 100% Italian. HACCP certified for food safety.',
                'description'       => 'The Mastercool RMCVMD is a professional open multideck chiller available in 2000mm and 2500mm lengths. 100% Italian design and manufacture, specifically created for professional refrigeration. HACCP certified and designed for hot, humid environments like UAE kitchens and retail environments.',
                'specs'             => [
                    ['key' => 'Model',      'value' => 'RMCVMD'],
                    ['key' => 'Length',     'value' => '2000 mm'],
                    ['key' => 'Type',       'value' => 'Open Multideck Chiller'],
                    ['key' => 'Origin',     'value' => '100% Made in Italy'],
                    ['key' => 'Compliance', 'value' => 'HACCP Certified'],
                ],
                'tags' => ['open chiller', 'multideck', 'mastercool', 'italy', 'display chiller', 'HACCP'],
                'rating' => 4.8, 'review_count' => 7, 'sales_count' => 11,
            ],
            [
                'name'              => 'Mastercool Meat Display Chiller RMCS 1500mm',
                'sku'               => 'MCL-RMCS-1500',
                'category_slug'     => 'meat-deli-display-chillers',
                'brand_slug'        => 'mastercool',
                'price'             => 6800.00,
                'thumbnail'         => $img('1e3a5f', 'Mastercool+Meat+Chiller'),
                'short_description' => 'Mastercool meat & deli display chiller 1500mm. Curved glass top. Made in Italy.',
                'description'       => 'The Mastercool RMCS/RMCSP is a dedicated meat and deli display chiller with elegant curved glass design, available in 1500mm, 2000mm and 2500mm lengths. Designed specifically for meat, fish and deli product display in supermarkets and specialty food stores.',
                'specs'             => [
                    ['key' => 'Model',      'value' => 'RMCS'],
                    ['key' => 'Length',     'value' => '1500 mm'],
                    ['key' => 'Type',       'value' => 'Meat & Deli Display Chiller'],
                    ['key' => 'Origin',     'value' => 'Made in Italy'],
                    ['key' => 'Compliance', 'value' => 'HACCP Certified'],
                ],
                'tags' => ['meat display', 'deli chiller', 'mastercool', 'curved glass', 'italy'],
                'rating' => 4.7, 'review_count' => 6, 'sales_count' => 9,
            ],
            [
                'name'              => 'Mastercool Nerone Combi Oven Electric (4 Trays)',
                'sku'               => 'MCL-NERONE-4T',
                'category_slug'     => 'combi-ovens',
                'brand_slug'        => 'mastercool',
                'price'             => 9800.00,
                'original_price'    => 11500.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1e3a5f', 'Mastercool+Combi+Oven'),
                'short_description' => 'Mastercool Nerone electric combi oven 4/6/10 trays. Convection + steam. Made in Italy.',
                'description'       => 'The Mastercool Nerone is a professional electric combi oven available in 4, 6 and 10 tray configurations. Combining convection and steam cooking modes, it delivers perfect results for baking, roasting, steaming and regeneration. Compact Italian design ideal for restaurant and hotel kitchens.',
                'specs'             => [
                    ['key' => 'Model',        'value' => 'Nerone'],
                    ['key' => 'Type',         'value' => 'Electric Combi Oven'],
                    ['key' => 'Tray Capacity','value' => '4 / 6 / 10 Trays (GN 1/1)'],
                    ['key' => 'Modes',        'value' => 'Convection, Steam, Combi'],
                    ['key' => 'Origin',       'value' => 'Made in Italy'],
                ],
                'tags' => ['combi oven', 'nerone', 'mastercool', 'electric', 'steam oven', 'italy'],
                'rating' => 4.9, 'review_count' => 5, 'sales_count' => 7,
            ],
            [
                'name'              => 'Mastercool Blast Chiller/Shock Freezer (5 Trays)',
                'sku'               => 'MCL-BCF-5T',
                'category_slug'     => 'blast-chillers-shock-freezers',
                'brand_slug'        => 'mastercool',
                'price'             => 14500.00,
                'thumbnail'         => $img('1e3a5f', 'Mastercool+Blast+Chiller'),
                'short_description' => 'Mastercool blast chiller & shock freezer 5/10 trays. HACCP compliant. 100% Italian.',
                'description'       => 'The Mastercool blast chiller and shock freezer is a HACCP-compliant rapid cooling solution for professional kitchens. Available in 5 and 10 tray versions, it quickly reduces food temperature to ensure food safety and preserve quality.',
                'specs'             => [
                    ['key' => 'Function',      'value' => 'Blast Chilling & Shock Freezing'],
                    ['key' => 'Tray Capacity', 'value' => '5 / 10 Trays (GN 1/1)'],
                    ['key' => 'Origin',        'value' => 'Made in Italy'],
                    ['key' => 'Compliance',    'value' => 'HACCP Certified'],
                ],
                'tags' => ['blast chiller', 'shock freezer', 'mastercool', 'HACCP', 'italy', 'professional kitchen'],
                'rating' => 4.8, 'review_count' => 4, 'sales_count' => 6,
            ],

            // ══════════════════════════════════════════════════════════════
            // BERJAYA — Commercial Kitchen & Refrigeration
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Berjaya Confectionery Showcase 1200mm (3 Tier)',
                'sku'               => 'BRJ-CONF-1200',
                'category_slug'     => 'display-chillers-showcase',
                'brand_slug'        => 'berjaya',
                'price'             => 3200.00,
                'is_new'            => true,
                'thumbnail'         => $img('374151', 'Berjaya+Confectionery'),
                'short_description' => 'Berjaya refrigerated confectionery showcase 1200mm, 3-tier. Curved glass. For cakes & pastries.',
                'description'       => 'The Berjaya confectionery showcase is a refrigerated display unit for bakeries, cafes and restaurants. With 3-tier curved glass front, it perfectly displays cakes, pastries, and desserts while keeping them fresh. Available in 1200mm and 1500mm lengths.',
                'specs'             => [
                    ['key' => 'Length',  'value' => '1200 mm'],
                    ['key' => 'Tiers',   'value' => '3 Tier'],
                    ['key' => 'Type',    'value' => 'Refrigerated Confectionery Showcase'],
                    ['key' => 'Glass',   'value' => 'Curved Glass Front'],
                    ['key' => 'Brand',   'value' => 'Berjaya'],
                ],
                'tags' => ['confectionery showcase', 'cake display', 'pastry chiller', 'berjaya', 'bakery'],
                'rating' => 4.5, 'review_count' => 12, 'sales_count' => 22,
            ],
            [
                'name'              => 'Berjaya Counter Chiller 2 Door 1200mm',
                'sku'               => 'BRJ-CC-1200-2D',
                'category_slug'     => 'under-counter-refrigerators',
                'brand_slug'        => 'berjaya',
                'price'             => 4500.00,
                'thumbnail'         => $img('374151', 'Berjaya+Counter+Chiller'),
                'short_description' => 'Berjaya 2-door under-counter chiller 1200mm. Stainless steel top. For commercial kitchens.',
                'description'       => 'The Berjaya counter chiller 2-door provides reliable refrigeration directly under the prep counter. Stainless steel worktop allows direct use as a work surface. Available in 2 and 3 door versions in 1200mm, 1500mm, 1800mm and 2100mm lengths.',
                'specs'             => [
                    ['key' => 'Length',  'value' => '1200 mm'],
                    ['key' => 'Doors',   'value' => '2 Door'],
                    ['key' => 'Top',     'value' => 'Stainless Steel Worktop'],
                    ['key' => 'Type',    'value' => 'Under-Counter Chiller'],
                ],
                'tags' => ['counter chiller', '2 door', 'berjaya', 'prep table', 'under counter'],
                'rating' => 4.6, 'review_count' => 9, 'sales_count' => 16,
            ],
            [
                'name'              => 'Berjaya Gas Baking Oven (2 Deck)',
                'sku'               => 'BRJ-BO-GAS-2D',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'berjaya',
                'price'             => 3600.00,
                'thumbnail'         => $img('92400e', 'Berjaya+Baking+Oven'),
                'short_description' => 'Berjaya 2-deck gas baking oven. Professional baker\'s oven for UAE bakeries.',
                'description'       => 'The Berjaya gas baking oven with 2 decks provides even heat distribution for consistent baking results. Suitable for bread, pastries and pizza. The independent deck temperature control allows simultaneous baking of different products.',
                'specs'             => [
                    ['key' => 'Type',   'value' => 'Gas Deck Oven'],
                    ['key' => 'Decks',  'value' => '2 Decks'],
                    ['key' => 'Fuel',   'value' => 'Gas'],
                    ['key' => 'Brand',  'value' => 'Berjaya'],
                ],
                'tags' => ['deck oven', 'baking oven', 'gas oven', 'berjaya', 'bakery equipment'],
                'rating' => 4.5, 'review_count' => 11, 'sales_count' => 20,
            ],
            [
                'name'              => 'Berjaya Display Chiller 2 Door (Upright)',
                'sku'               => 'BRJ-DC-2D',
                'category_slug'     => 'display-chillers-showcase',
                'brand_slug'        => 'berjaya',
                'price'             => 5800.00,
                'thumbnail'         => $img('374151', 'Berjaya+Display+Chiller'),
                'short_description' => 'Berjaya 2-door upright display chiller. Glass doors for retail & convenience stores.',
                'description'       => 'The Berjaya 2-door upright display chiller is ideal for convenience stores, supermarkets, and petrol station forecourts. Double glass doors provide excellent product visibility while maintaining energy efficiency.',
                'specs'             => [
                    ['key' => 'Doors',  'value' => '2 Glass Doors'],
                    ['key' => 'Type',   'value' => 'Upright Display Chiller'],
                    ['key' => 'Brand',  'value' => 'Berjaya'],
                ],
                'tags' => ['display chiller', '2 door', 'glass door', 'berjaya', 'retail chiller'],
                'rating' => 4.6, 'review_count' => 8, 'sales_count' => 14,
            ],

            // ══════════════════════════════════════════════════════════════
            // ROLLER GRILL (France) — Cooking & Food Service Equipment
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Roller Grill Induction Hob (Double)',
                'sku'               => 'RG-INDUCTION-2',
                'category_slug'     => 'induction-cookers',
                'brand_slug'        => 'roller-grill',
                'price'             => 1200.00,
                'is_new'            => true,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Induction'),
                'short_description' => 'Roller Grill double induction hob. Energy-efficient, safe, precise temperature control.',
                'description'       => 'The Roller Grill double induction hob offers precise temperature control, fast heat-up and energy efficiency. Ideal for live cooking stations, buffets and any kitchen where gas is not available. No open flame means enhanced kitchen safety.',
                'specs'             => [
                    ['key' => 'Type',    'value' => 'Double Induction Hob'],
                    ['key' => 'Fuel',    'value' => 'Electric (Induction)'],
                    ['key' => 'Brand',   'value' => 'Roller Grill'],
                    ['key' => 'Origin',  'value' => 'France'],
                ],
                'tags' => ['induction hob', 'induction cooker', 'roller grill', 'france', 'electric cooking'],
                'rating' => 4.5, 'review_count' => 18, 'sales_count' => 35,
            ],
            [
                'name'              => 'Roller Grill Contact Grill Panini Press',
                'sku'               => 'RG-PANINI',
                'category_slug'     => 'commercial-grills-griddles',
                'brand_slug'        => 'roller-grill',
                'price'             => 1800.00,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Panini'),
                'short_description' => 'Roller Grill professional panini contact grill. For cafes, bistros and sandwich shops.',
                'description'       => 'The Roller Grill contact grill/panini press is a professional tool for cafes, coffee shops and delis. Double ridged plates create perfect grill marks while sealing in flavours. Adjustable pressure and temperature for all types of sandwiches and meats.',
                'specs'             => [
                    ['key' => 'Type',    'value' => 'Contact Grill / Panini Press'],
                    ['key' => 'Fuel',    'value' => 'Electric'],
                    ['key' => 'Brand',   'value' => 'Roller Grill'],
                    ['key' => 'Origin',  'value' => 'France'],
                ],
                'tags' => ['panini press', 'contact grill', 'roller grill', 'sandwich', 'cafe equipment'],
                'rating' => 4.6, 'review_count' => 22, 'sales_count' => 45,
            ],
            [
                'name'              => 'Roller Grill Pizza Oven (2 Deck Electric)',
                'sku'               => 'RG-PIZZA-2D',
                'category_slug'     => 'commercial-gas-ranges',
                'brand_slug'        => 'roller-grill',
                'price'             => 3800.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Pizza+Oven'),
                'short_description' => 'Roller Grill 2-deck electric pizza oven. Professional pizza baking for restaurants.',
                'description'       => 'The Roller Grill 2-deck electric pizza oven delivers restaurant-quality pizza with independent deck temperature controls. Each deck operates independently, allowing maximum flexibility for baking different items simultaneously.',
                'specs'             => [
                    ['key' => 'Type',    'value' => 'Electric Pizza Oven'],
                    ['key' => 'Decks',   'value' => '2 Decks'],
                    ['key' => 'Fuel',    'value' => 'Electric'],
                    ['key' => 'Brand',   'value' => 'Roller Grill'],
                    ['key' => 'Origin',  'value' => 'France'],
                ],
                'tags' => ['pizza oven', '2 deck', 'roller grill', 'electric oven', 'france'],
                'rating' => 4.7, 'review_count' => 15, 'sales_count' => 28,
            ],
            [
                'name'              => 'Roller Grill Shawarma Machine (Gas)',
                'sku'               => 'RG-SHAWARMA-GAS',
                'category_slug'     => 'shawarma-rotisserie-machines',
                'brand_slug'        => 'roller-grill',
                'price'             => 2400.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Shawarma'),
                'short_description' => 'Roller Grill gas shawarma machine. Essential for Middle East restaurants and fast food.',
                'description'       => 'The Roller Grill gas shawarma machine is perfectly suited for UAE, Middle East and Mediterranean restaurants. Vertical burners provide even heat distribution for perfectly cooked shawarma, gyros and doner kebab. Available in gas and electric versions.',
                'specs'             => [
                    ['key' => 'Type',   'value' => 'Vertical Shawarma Machine'],
                    ['key' => 'Fuel',   'value' => 'Gas'],
                    ['key' => 'Brand',  'value' => 'Roller Grill'],
                    ['key' => 'Origin', 'value' => 'France'],
                ],
                'tags' => ['shawarma machine', 'shawarma grill', 'roller grill', 'middle east', 'UAE restaurant'],
                'rating' => 4.8, 'review_count' => 31, 'sales_count' => 62,
            ],
            [
                'name'              => 'Roller Grill Double Fryer (14+14L)',
                'sku'               => 'RG-FRYER-14-14',
                'category_slug'     => 'deep-fryers',
                'brand_slug'        => 'roller-grill',
                'price'             => 3200.00,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Fryer'),
                'short_description' => 'Roller Grill electric double fryer 14+14L. High capacity for restaurants & fast food.',
                'description'       => 'The Roller Grill double fryer with 14+14 litre capacity is designed for high-volume restaurants and fast food outlets. Independent temperature control on each tank allows simultaneous frying of different products at different temperatures.',
                'specs'             => [
                    ['key' => 'Type',        'value' => 'Double Electric Fryer'],
                    ['key' => 'Oil Capacity','value' => '14L + 14L'],
                    ['key' => 'Fuel',        'value' => 'Electric'],
                    ['key' => 'Brand',       'value' => 'Roller Grill'],
                    ['key' => 'Origin',      'value' => 'France'],
                ],
                'tags' => ['double fryer', '14L fryer', 'roller grill', 'electric fryer', 'high capacity'],
                'rating' => 4.6, 'review_count' => 14, 'sales_count' => 26,
            ],
            [
                'name'              => 'Roller Grill Waffle Maker (Commercial)',
                'sku'               => 'RG-WAFFLE',
                'category_slug'     => 'commercial-cooking-equipment',
                'brand_slug'        => 'roller-grill',
                'price'             => 1400.00,
                'is_new'            => true,
                'thumbnail'         => $img('1c1917', 'Roller+Grill+Waffle'),
                'short_description' => 'Roller Grill commercial waffle maker. For cafes, hotels & dessert shops.',
                'description'       => 'The Roller Grill commercial waffle maker produces perfect Belgian waffles consistently. Non-stick cast-iron plates ensure easy release and simple cleaning. Ideal for hotel breakfasts, cafe menus and dessert stations.',
                'specs'             => [
                    ['key' => 'Type',   'value' => 'Commercial Waffle Maker'],
                    ['key' => 'Fuel',   'value' => 'Electric'],
                    ['key' => 'Brand',  'value' => 'Roller Grill'],
                    ['key' => 'Origin', 'value' => 'France'],
                ],
                'tags' => ['waffle maker', 'waffle iron', 'roller grill', 'hotel breakfast', 'dessert equipment'],
                'rating' => 4.5, 'review_count' => 19, 'sales_count' => 38,
            ],

            // ══════════════════════════════════════════════════════════════
            // ROBOT-COUPE (France) — Food Processors & Blenders
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Robot Coupe R 301 Ultra Food Processor (3.7L)',
                'sku'               => 'RC-R301-ULTRA',
                'category_slug'     => 'food-processors-cutters',
                'brand_slug'        => 'robot-coupe',
                'price'             => 3200.00,
                'is_featured'       => true,
                'thumbnail'         => $img('16a34a', 'Robot+Coupe+R301'),
                'short_description' => 'Robot-Coupe R 301 Ultra food processor 3.7L, 650W. Made in France since 1961.',
                'description'       => 'The Robot-Coupe R 301 Ultra is the benchmark professional food processor for commercial kitchens. With 3.7L bowl, 650W motor and 1 speed, it handles chopping, mixing, emulsifying and grating with precision. Robot-Coupe has been innovating professional food processing from France since 1961.',
                'specs'             => [
                    ['key' => 'Model',        'value' => 'R 301 Ultra'],
                    ['key' => 'Bowl Capacity','value' => '3.7 Litres'],
                    ['key' => 'Motor',        'value' => '650W – 1 Phase / 1 Speed'],
                    ['key' => 'Origin',       'value' => 'Made in France'],
                    ['key' => 'Brand',        'value' => 'Robot-Coupe'],
                ],
                'tags'         => ['food processor', 'robot coupe', 'R301', 'france', '3.7L', 'commercial food processor'],
                'rating'       => 4.9, 'review_count' => 24, 'sales_count' => 48,
            ],
            [
                'name'              => 'Robot Coupe CL 50 Vegetable Prep Machine',
                'sku'               => 'RC-CL50',
                'category_slug'     => 'vegetable-prep-machines',
                'brand_slug'        => 'robot-coupe',
                'price'             => 6200.00,
                'original_price'    => 7200.00,
                'is_featured'       => true,
                'thumbnail'         => $img('16a34a', 'Robot+Coupe+CL50'),
                'short_description' => 'Robot-Coupe CL 50 vegetable prep machine, 50 discs. Made in France.',
                'description'       => 'The Robot-Coupe CL 50 is the professional vegetable preparation machine trusted by top kitchens worldwide. With 50 disc options covering slicing, julienne, grating and more, it transforms hours of manual prep into minutes. The benchmark for professional vegetable processing in UAE commercial kitchens.',
                'specs'             => [
                    ['key' => 'Model',       'value' => 'CL 50'],
                    ['key' => 'Type',        'value' => 'Vegetable Prep Machine'],
                    ['key' => 'Discs',       'value' => '50 Optional Discs'],
                    ['key' => 'Motor',       'value' => '550W – 1 or 3 Phase / 1 Speed'],
                    ['key' => 'Origin',      'value' => 'Made in France'],
                ],
                'tags'         => ['vegetable prep', 'CL50', 'robot coupe', 'france', 'vegetable cutter', 'slicer'],
                'rating'       => 4.9, 'review_count' => 18, 'sales_count' => 32,
            ],
            [
                'name'              => 'Robot Coupe J 80 Automatic Juice Extractor',
                'sku'               => 'RC-J80',
                'category_slug'     => 'juice-extractors',
                'brand_slug'        => 'robot-coupe',
                'price'             => 2400.00,
                'is_new'            => true,
                'thumbnail'         => $img('16a34a', 'Robot+Coupe+J80'),
                'short_description' => 'Robot-Coupe J 80 automatic juice extractor 120L/h, 700W. For bars, restaurants & hotels.',
                'description'       => 'The Robot-Coupe J 80 is a professional automatic juice extractor producing 120 litres per hour. With 700W motor, 6.5L pulp collector and 1 no-splash spout, it\'s designed for bars, restaurants and hotels. Self-feeding system maximises efficiency without operator attention.',
                'specs'             => [
                    ['key' => 'Model',          'value' => 'J 80'],
                    ['key' => 'Output',         'value' => '120 Litres/hour'],
                    ['key' => 'Motor',          'value' => '700W – Single Phase'],
                    ['key' => 'Pulp Collector', 'value' => '6.5 Litres'],
                    ['key' => 'Spouts',         'value' => '1 No-Splash Spout'],
                    ['key' => 'Origin',         'value' => 'Made in France'],
                ],
                'tags'         => ['juice extractor', 'J80', 'robot coupe', 'france', 'juicer', 'bar equipment'],
                'rating'       => 4.7, 'review_count' => 13, 'sales_count' => 25,
            ],
            [
                'name'              => 'Robot Coupe Blixer 3 (1 Phase, 2.9L)',
                'sku'               => 'RC-BLIXER3',
                'category_slug'     => 'food-processors-cutters',
                'brand_slug'        => 'robot-coupe',
                'price'             => 3600.00,
                'thumbnail'         => $img('16a34a', 'Robot+Coupe+Blixer3'),
                'short_description' => 'Robot-Coupe Blixer 3, 2.9L bowl, 750W. Blends and emulsifies with precision. Made in France.',
                'description'       => 'The Robot-Coupe Blixer 3 combines the functions of a blender and a food processor in one unit. With 2.9L stainless steel bowl and 750W motor, it\'s perfect for soups, sauces, pâtés and smooth purees in professional kitchens.',
                'specs'             => [
                    ['key' => 'Model',  'value' => 'Blixer 3'],
                    ['key' => 'Bowl',   'value' => '2.9 Litres SS'],
                    ['key' => 'Motor',  'value' => '750W – 1 Phase'],
                    ['key' => 'Origin', 'value' => 'Made in France'],
                ],
                'tags'         => ['blixer', 'robot coupe', 'blender', 'food processor', 'france'],
                'rating'       => 4.8, 'review_count' => 9, 'sales_count' => 16,
            ],

            // ══════════════════════════════════════════════════════════════
            // BREMA ICE MAKERS (Italy) — Ice Machines & Dishwashers
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Brema CB184A HC Ice Maker (184kg/24h)',
                'sku'               => 'BREMA-CB184A',
                'category_slug'     => 'ice-machines',
                'brand_slug'        => 'brema-ice-makers',
                'price'             => 4200.00,
                'thumbnail'         => $img('0c4a6e', 'Brema+CB184A'),
                'short_description' => 'Brema CB184A modular ice maker 184kg/day. R290 eco-refrigerant. Made in Italy.',
                'description'       => '"Making ice is our business" – The Brema CB184A produces up to 184kg of ice cubes per 24 hours. Using R290 eco-friendly refrigerant and available in multiple cube sizes (18g, 33g, 13g, 42g). Italian quality and reliability for hotels, restaurants and bars across UAE.',
                'specs'             => [
                    ['key' => 'Model',       'value' => 'CB184A HC'],
                    ['key' => 'Production',  'value' => '184 kg / 24 hours'],
                    ['key' => 'Refrigerant', 'value' => 'R290 (Eco)'],
                    ['key' => 'Ice Sizes',   'value' => 'A-18g, C-33g, D-13g, E-42g'],
                    ['key' => 'Origin',      'value' => 'Made in Italy'],
                ],
                'tags'         => ['ice maker', 'brema', 'italy', '184kg', 'R290', 'modular ice machine'],
                'rating'       => 4.7, 'review_count' => 11, 'sales_count' => 19,
            ],
            [
                'name'              => 'Brema CB640A HC Ice Maker (640kg/24h)',
                'sku'               => 'BREMA-CB640A',
                'category_slug'     => 'ice-machines',
                'brand_slug'        => 'brema-ice-makers',
                'price'             => 7200.00,
                'original_price'    => 8200.00,
                'is_featured'       => true,
                'thumbnail'         => $img('0c4a6e', 'Brema+CB640A'),
                'short_description' => 'Brema CB640A high-capacity ice maker 640kg/day. For hotels, large restaurants & caterers.',
                'description'       => 'The Brema CB640A is a high-capacity ice maker producing 640kg of ice cubes per 24 hours, making it ideal for large hotels, catering companies and industrial users. R290 eco-friendly refrigerant ensures efficiency and sustainability.',
                'specs'             => [
                    ['key' => 'Model',       'value' => 'CB640A HC'],
                    ['key' => 'Production',  'value' => '640 kg / 24 hours'],
                    ['key' => 'Refrigerant', 'value' => 'R290 (Eco)'],
                    ['key' => 'Origin',      'value' => 'Made in Italy'],
                ],
                'tags'         => ['ice maker', 'brema', '640kg', 'high capacity', 'hotel ice machine', 'italy'],
                'rating'       => 4.8, 'review_count' => 6, 'sales_count' => 9,
            ],
            [
                'name'              => 'Brema BLUE 40 Undercounter Dishwasher',
                'sku'               => 'BREMA-BLUE40',
                'category_slug'     => 'commercial-dishwashers',
                'brand_slug'        => 'brema-ice-makers',
                'price'             => 5800.00,
                'thumbnail'         => $img('0c4a6e', 'Brema+Blue40+Dishwasher'),
                'short_description' => 'Brema BLUE 40 undercounter commercial dishwasher. KROMO excellence in dishwashing. Made in Italy.',
                'description'       => 'The Brema BLUE 40 is a compact undercounter dishwasher with KROMO excellence, designed for bars, cafes and small restaurants. Professional cleaning results with short cycle times and easy operation.',
                'specs'             => [
                    ['key' => 'Model',  'value' => 'BLUE 40'],
                    ['key' => 'Type',   'value' => 'Undercounter Dishwasher'],
                    ['key' => 'Origin', 'value' => 'Made in Italy (Kromo)'],
                ],
                'tags'         => ['dishwasher', 'undercounter', 'brema', 'blue 40', 'kromo', 'italy'],
                'rating'       => 4.6, 'review_count' => 8, 'sales_count' => 13,
            ],

            // ══════════════════════════════════════════════════════════════
            // CONVOTHERM (Germany) — Premium Combi Ovens
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Convotherm maxx pro easyTouch 10.10 Combi Oven',
                'sku'               => 'CONV-MAXXPRO-10',
                'category_slug'     => 'combi-ovens',
                'brand_slug'        => 'convotherm',
                'price'             => 38000.00,
                'original_price'    => 43000.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1a1a2e', 'Convotherm+maxx+pro'),
                'short_description' => 'Convotherm maxx pro easyTouch 10.10 combi oven. The premium combi oven, Made in Germany.',
                'description'       => 'The Convotherm maxx pro easyTouch is THE premium combi oven for professional kitchens. Made in Germany with nearly 100 years of engineering excellence, the easyTouch interface makes complex cooking programmes simple. 10.10 model holds 10 x GN 1/1 trays. Used in 5-star hotels and high-end restaurants across UAE.',
                'specs'             => [
                    ['key' => 'Model',        'value' => 'maxx pro easyTouch 10.10'],
                    ['key' => 'Capacity',     'value' => '10 x GN 1/1'],
                    ['key' => 'Control',      'value' => 'easyTouch Interface'],
                    ['key' => 'Modes',        'value' => 'Convection, Steam, Combi, Cook & Hold'],
                    ['key' => 'Origin',       'value' => 'Made in Germany'],
                    ['key' => 'Warranty',     'value' => '2 Years'],
                ],
                'tags'         => ['combi oven', 'convotherm', 'germany', 'maxx pro', 'easyTouch', 'premium oven'],
                'rating'       => 4.9, 'review_count' => 14, 'sales_count' => 16,
                'stock_qty'    => 4,
            ],
            [
                'name'              => 'Convotherm mini pro 6.10 Combi Oven',
                'sku'               => 'CONV-MINIPRO-6',
                'category_slug'     => 'combi-ovens',
                'brand_slug'        => 'convotherm',
                'price'             => 22000.00,
                'original_price'    => 26000.00,
                'is_featured'       => true,
                'thumbnail'         => $img('1a1a2e', 'Convotherm+mini+pro'),
                'short_description' => 'Convotherm mini pro combi oven, 6.10 trays. The King of Compact. Made in Germany.',
                'description'       => 'The Convotherm mini pro is "The King of Compact" – a full-featured combi oven in a space-saving design. Perfect for smaller restaurants, cafes, bakeries and hotel operations where space is limited but performance cannot be compromised. 6 x GN 1/1 capacity.',
                'specs'             => [
                    ['key' => 'Model',    'value' => 'mini pro 6.10'],
                    ['key' => 'Capacity', 'value' => '6 x GN 1/1'],
                    ['key' => 'Type',     'value' => 'Compact Combi Oven'],
                    ['key' => 'Origin',   'value' => 'Made in Germany'],
                    ['key' => 'Warranty', 'value' => '2 Years'],
                ],
                'tags'         => ['combi oven', 'convotherm', 'mini pro', 'compact', 'germany', 'small combi oven'],
                'rating'       => 4.8, 'review_count' => 9, 'sales_count' => 12,
                'stock_qty'    => 6,
            ],

            // ══════════════════════════════════════════════════════════════
            // UNIVERSAL (Turkey) — Supermarket Shelving & Checkout
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Universal Gondola Shelving (White, 1m)',
                'sku'               => 'UNI-GONDOLA-1M-W',
                'category_slug'     => 'gondola-wall-shelving',
                'brand_slug'        => 'universal',
                'price'             => 650.00,
                'thumbnail'         => $img('6b7280', 'Universal+Gondola+Shelving'),
                'short_description' => 'Universal gondola shelving 1m, white. Made in Turkey. For supermarkets & retail stores.',
                'description'       => 'Universal gondola shelving made in Turkey – the most popular retail shelving system for supermarkets and convenience stores. Available in white and off-white. 1m bay with adjustable shelves. Compatible with Universal accessories including end units, canopies and shelf dividers.',
                'specs'             => [
                    ['key' => 'Width',   'value' => '1000 mm (1m)'],
                    ['key' => 'Colour',  'value' => 'White'],
                    ['key' => 'Type',    'value' => 'Double-Sided Gondola Shelving'],
                    ['key' => 'Origin',  'value' => 'Made in Turkey'],
                    ['key' => 'Brand',   'value' => 'Universal'],
                ],
                'tags'         => ['gondola shelving', 'supermarket shelving', 'universal', 'turkey', 'retail shelving'],
                'rating'       => 4.4, 'review_count' => 28, 'sales_count' => 85,
                'stock_qty'    => 100,
            ],
            [
                'name'              => 'Universal Checkout Counter (Standard)',
                'sku'               => 'UNI-CHECKOUT-STD',
                'category_slug'     => 'checkout-counters',
                'brand_slug'        => 'universal',
                'price'             => 2800.00,
                'thumbnail'         => $img('6b7280', 'Universal+Checkout+Counter'),
                'short_description' => 'Universal checkout counter. Professional POS counter for supermarkets. Made in Turkey.',
                'description'       => 'Universal checkout counter – professionally designed for supermarkets and retail stores. Includes conveyor belt area, cashier section and bagging area. Available in multiple configurations and colours to match store design.',
                'specs'             => [
                    ['key' => 'Type',   'value' => 'Standard Checkout Counter'],
                    ['key' => 'Origin', 'value' => 'Made in Turkey'],
                    ['key' => 'Brand',  'value' => 'Universal'],
                ],
                'tags'         => ['checkout counter', 'POS counter', 'supermarket', 'universal', 'turkey', 'retail'],
                'rating'       => 4.5, 'review_count' => 14, 'sales_count' => 22,
            ],

            // ══════════════════════════════════════════════════════════════
            // SANTOS (France) — Juicers & Blenders
            // ══════════════════════════════════════════════════════════════
            [
                'name'              => 'Santos Classic Citrus Juicer Model 11',
                'sku'               => 'SANTOS-11',
                'category_slug'     => 'juice-extractors',
                'brand_slug'        => 'santos',
                'price'             => 1400.00,
                'is_new'            => true,
                'thumbnail'         => $img('16a34a', 'Santos+Citrus+Juicer+11'),
                'short_description' => 'Santos Classic Citrus Juicer Model 11. For bars, restaurants & hotels. Made in France.',
                'description'       => 'The Santos Classic Citrus Juicer Model 11 is the iconic professional citrus juicer trusted by bars, restaurants and hotels worldwide. Durable, efficient and simple to clean. Santos provides food and beverage equipment from France for professional kitchens globally.',
                'specs'             => [
                    ['key' => 'Model',  'value' => 'Classic Citrus Juicer 11'],
                    ['key' => 'Type',   'value' => 'Citrus Juicer'],
                    ['key' => 'Origin', 'value' => 'Made in France'],
                    ['key' => 'Brand',  'value' => 'Santos'],
                ],
                'tags'         => ['citrus juicer', 'santos', 'france', 'orange juicer', 'bar equipment'],
                'rating'       => 4.7, 'review_count' => 21, 'sales_count' => 42,
            ],
            [
                'name'              => 'Santos Bar Blender Model 33',
                'sku'               => 'SANTOS-33',
                'category_slug'     => 'commercial-mixers',
                'brand_slug'        => 'santos',
                'price'             => 1800.00,
                'thumbnail'         => $img('16a34a', 'Santos+Bar+Blender+33'),
                'short_description' => 'Santos professional bar blender Model 33. High-power, quiet operation. Made in France.',
                'description'       => 'The Santos Bar Blender Model 33 is a professional high-powered blender designed for bars, cafes and restaurants. Produces smooth cocktails, smoothies, soups and sauces. Santos bar equipment meets the demanding standards of professional hospitality.',
                'specs'             => [
                    ['key' => 'Model',  'value' => 'Bar Blender 33'],
                    ['key' => 'Type',   'value' => 'Professional Bar Blender'],
                    ['key' => 'Origin', 'value' => 'Made in France'],
                    ['key' => 'Brand',  'value' => 'Santos'],
                ],
                'tags'         => ['bar blender', 'santos', 'france', 'smoothie blender', 'professional blender'],
                'rating'       => 4.6, 'review_count' => 16, 'sales_count' => 31,
            ],
        ];
    }
}

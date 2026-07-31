-- =============================================================
-- B2B Kitchen Equipment Ecommerce — Full PostgreSQL Database
-- PostgreSQL 15 | Generated: 2026-07-31
-- Run: psql -U postgres -d your_database -f ecommerce_full.sql
-- Safe to re-run: all inserts use ON CONFLICT DO UPDATE (upsert)
-- =============================================================

BEGIN;

-- =============================================================
-- SECTION 1 — TABLE DEFINITIONS (CREATE IF NOT EXISTS)
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    password          VARCHAR(255) NOT NULL,
    remember_token    VARCHAR(100),
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email      VARCHAR(255) PRIMARY KEY,
    token      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id            VARCHAR(255) PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    payload       TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx       ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_idx ON sessions (last_activity);

CREATE TABLE IF NOT EXISTS cache (
    key        VARCHAR(255) PRIMARY KEY,
    value      TEXT NOT NULL,
    expiration BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS cache_expiration_idx ON cache (expiration);

CREATE TABLE IF NOT EXISTS cache_locks (
    key        VARCHAR(255) PRIMARY KEY,
    owner      VARCHAR(255) NOT NULL,
    expiration BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
    id           BIGSERIAL PRIMARY KEY,
    queue        VARCHAR(255) NOT NULL,
    payload      TEXT NOT NULL,
    attempts     SMALLINT NOT NULL,
    reserved_at  INTEGER,
    available_at INTEGER NOT NULL,
    created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS jobs_queue_idx ON jobs (queue);

CREATE TABLE IF NOT EXISTS job_batches (
    id             VARCHAR(255) PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    total_jobs     INTEGER NOT NULL,
    pending_jobs   INTEGER NOT NULL,
    failed_jobs    INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options        TEXT,
    cancelled_at   INTEGER,
    created_at     INTEGER NOT NULL,
    finished_at    INTEGER
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id         BIGSERIAL PRIMARY KEY,
    uuid       VARCHAR(255) UNIQUE NOT NULL,
    connection VARCHAR(255) NOT NULL,
    queue      VARCHAR(255) NOT NULL,
    payload    TEXT NOT NULL,
    exception  TEXT NOT NULL,
    failed_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    logo        VARCHAR(255),
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order  SMALLINT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS brands_is_featured_idx ON brands (is_featured);

CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    image       VARCHAR(255),
    icon        VARCHAR(255),
    description TEXT,
    parent_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order  SMALLINT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx  ON categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_is_featured_idx ON categories (is_featured);

CREATE TABLE IF NOT EXISTS products (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) UNIQUE NOT NULL,
    sku               VARCHAR(255) UNIQUE,
    thumbnail         VARCHAR(255) NOT NULL,
    images            JSONB DEFAULT '[]'::jsonb,
    price             DECIMAL(10,2) NOT NULL,
    original_price    DECIMAL(10,2),
    short_description TEXT,
    description       TEXT,
    is_new            BOOLEAN DEFAULT FALSE,
    is_featured       BOOLEAN DEFAULT FALSE,
    in_stock          BOOLEAN DEFAULT TRUE,
    stock_qty         INTEGER DEFAULT 10,
    category_id       BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    brand_id          BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    specs             JSONB,
    tags              JSONB DEFAULT '[]'::jsonb,
    rating            DECIMAL(3,2),
    review_count      INTEGER DEFAULT 0,
    sales_count       INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
CREATE INDEX IF NOT EXISTS products_category_active_idx ON products (category_id, is_active);
CREATE INDEX IF NOT EXISTS products_brand_active_idx    ON products (brand_id, is_active);
CREATE INDEX IF NOT EXISTS products_is_featured_idx     ON products (is_featured);
CREATE INDEX IF NOT EXISTS products_is_new_idx          ON products (is_new);
CREATE INDEX IF NOT EXISTS products_price_idx           ON products (price);
CREATE INDEX IF NOT EXISTS products_sales_count_idx     ON products (sales_count);

CREATE TABLE IF NOT EXISTS carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id          BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    UNIQUE (wishlist_id, product_id)
);

-- Customer enquiry orders (no login required)
CREATE TABLE IF NOT EXISTS orders (
    id               BIGSERIAL PRIMARY KEY,
    order_ref        VARCHAR(20) UNIQUE NOT NULL,
    customer_name    VARCHAR(255) NOT NULL,
    customer_phone   VARCHAR(255) NOT NULL,
    customer_email   VARCHAR(255),
    customer_company VARCHAR(255),
    delivery_address TEXT,
    city             VARCHAR(255) NOT NULL,
    notes            TEXT,
    items            JSONB NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL,
    status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','confirmed','delivered','cancelled')),
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);

CREATE TABLE IF NOT EXISTS pages (
    id         BIGSERIAL PRIMARY KEY,
    slug       VARCHAR(255) UNIQUE NOT NULL,
    title      VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =============================================================
-- SECTION 2 — BRANDS (25 rows)
-- =============================================================

INSERT INTO brands (name, slug, logo, description, is_featured, sort_order, created_at, updated_at)
VALUES
('Rational',                 'rational',                '/assets/brands/rational-logo.png',                'German manufacturer and global leader in combi steam ovens for professional kitchens.',            TRUE,  1,  NOW(), NOW()),
('Hobart',                   'hobart',                  '/assets/brands/hobart-logo.png',                  'American brand synonymous with commercial dishwashers and food preparation equipment.',            TRUE,  2,  NOW(), NOW()),
('Hoshizaki',                'hoshizaki',               '/assets/brands/hoshizaki-logo.png',               'Japanese precision manufacturer of ice machines, refrigerators, and display cases.',               TRUE,  3,  NOW(), NOW()),
('Electrolux Professional',  'electrolux-professional', '/assets/brands/electrolux-professional-logo.png', 'Swedish brand offering the complete range of professional kitchen equipment.',                     TRUE,  4,  NOW(), NOW()),
('Robot Coupe',              'robot-coupe',             '/assets/brands/robot-coupe-logo.png',             'French inventor of the food processor. Industry standard for food preparation machinery.',         TRUE,  5,  NOW(), NOW()),
('Vitamix',                  'vitamix',                 '/assets/brands/vitamix-logo.png',                 'American premium commercial blender manufacturer, trusted by leading chefs worldwide.',            FALSE, 6,  NOW(), NOW()),
('La Marzocco',              'la-marzocco',             '/assets/brands/la-marzocco-logo.png',             'Florentine espresso machine manufacturer. The benchmark for specialty coffee bars.',                TRUE,  7,  NOW(), NOW()),
('Winterhalter',             'winterhalter',            '/assets/brands/winterhalter-logo.png',            'German specialist in warewashing systems for hotels, restaurants, and catering.',                  TRUE,  8,  NOW(), NOW()),
('True Refrigeration',       'true-refrigeration',      '/assets/brands/true-refrigeration-logo.png',      'American manufacturer of commercial refrigerators and freezers built to last.',                    FALSE, 9,  NOW(), NOW()),
('Vulcan',                   'vulcan',                  '/assets/brands/vulcan-logo.png',                  'American heavy-duty commercial cooking equipment manufacturer.',                                    FALSE, 10, NOW(), NOW()),
('Garland',                  'garland',                 '/assets/brands/garland-logo.png',                 'North American manufacturer of professional cooking ranges and ovens.',                            FALSE, 11, NOW(), NOW()),
('Alto-Shaam',               'alto-shaam',              '/assets/brands/alto-shaam-logo.png',              'American pioneer of Halo Heat cook-and-hold technology and Combitherm combi ovens.',              TRUE,  12, NOW(), NOW()),
('Turbochef',                'turbochef',               '/assets/brands/turbochef-logo.png',               'Rapid cook oven pioneer combining impingement, microwave, and convection technologies.',            FALSE, 13, NOW(), NOW()),
('Manitowoc',                'manitowoc',               '/assets/brands/manitowoc-logo.png',               'American manufacturer of commercial ice machines and foodservice equipment.',                      FALSE, 14, NOW(), NOW()),
('Atosa',                    'atosa',                   '/assets/brands/atosa-logo.png',                   'Value-oriented commercial refrigeration brand with strong presence in the GCC market.',            FALSE, 15, NOW(), NOW()),
('Cambro',                   'cambro',                  '/assets/brands/cambro-logo.png',                  'American manufacturer of professional food storage, transport, and display products.',              FALSE, 16, NOW(), NOW()),
('Franke Coffee Systems',    'franke-coffee-systems',   '/assets/brands/franke-coffee-systems-logo.png',   'Swiss manufacturer of automatic and bean-to-cup professional coffee machines.',                    FALSE, 17, NOW(), NOW()),
('Comenda',                  'comenda',                 '/assets/brands/comenda-logo.png',                 'Italian manufacturer of professional warewashing equipment for hotels and restaurants.',            FALSE, 18, NOW(), NOW()),
('Faema',                    'faema',                   '/assets/brands/faema-logo.png',                   'Italian heritage espresso machine brand, part of Cimbali Group.',                                  FALSE, 19, NOW(), NOW()),
('Blodgett',                 'blodgett',                '/assets/brands/blodgett-logo.png',                'American manufacturer of commercial ovens and ranges, trusted by bakers worldwide.',               FALSE, 20, NOW(), NOW()),
('Middleby Marshall',        'middleby-marshall',       '/assets/brands/middleby-marshall-logo.png',       'Pioneer in conveyor pizza ovens and commercial cooking innovation.',                               FALSE, 21, NOW(), NOW()),
('Cleveland Range',          'cleveland-range',         '/assets/brands/cleveland-range-logo.png',         'American manufacturer of steam cooking equipment for institutional kitchens.',                     FALSE, 22, NOW(), NOW()),
('Welbilt',                  'welbilt',                 '/assets/brands/welbilt-logo.png',                 'Global foodservice equipment company, home of Merco, Manitowoc, and Convotherm brands.',          FALSE, 23, NOW(), NOW()),
('Meiko',                    'meiko',                   '/assets/brands/meiko-logo.png',                   'German manufacturer of commercial dishwashers with integrated heat pump technology.',              FALSE, 24, NOW(), NOW()),
('Carpigiani',               'carpigiani',              '/assets/brands/carpigiani-logo.png',              'Italian world leader in gelato batch freezers and soft-serve equipment.',                         TRUE,  25, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name        = EXCLUDED.name,
    logo        = EXCLUDED.logo,
    description = EXCLUDED.description,
    is_featured = EXCLUDED.is_featured,
    sort_order  = EXCLUDED.sort_order,
    updated_at  = NOW();

-- =============================================================
-- SECTION 3 — CATEGORIES (14 roots + 68 children = 82 total)
-- =============================================================

-- ── Root categories ──────────────────────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
VALUES
('Commercial Cooking Equipment', 'commercial-cooking-equipment', '/assets/categories/commercial-cooking-equipment.jpg', 'Premium commercial cooking equipment for UAE hospitality and foodservice.',  NULL, TRUE,  1,  NOW(), NOW()),
('Commercial Refrigeration',     'commercial-refrigeration',     '/assets/categories/commercial-refrigeration.jpg',     'Commercial refrigeration solutions for UAE restaurants and hotels.',        NULL, TRUE,  2,  NOW(), NOW()),
('Food Preparation Equipment',   'food-preparation-equipment',   '/assets/categories/food-preparation-equipment.jpg',   'Professional food preparation equipment for high-volume kitchens.',          NULL, TRUE,  3,  NOW(), NOW()),
('Warewashing Equipment',        'warewashing-equipment',        '/assets/categories/warewashing-equipment.jpg',        'Commercial warewashing systems for hotels and restaurants.',                 NULL, FALSE, 4,  NOW(), NOW()),
('Food Display & Serving',       'food-display-serving',         '/assets/categories/food-display-serving.jpg',         'Hot and cold food display and serving equipment for foodservice.',           NULL, TRUE,  5,  NOW(), NOW()),
('Beverage Equipment',           'beverage-equipment',           '/assets/categories/beverage-equipment.jpg',           'Commercial beverage equipment for cafes, hotels, and restaurants.',          NULL, TRUE,  6,  NOW(), NOW()),
('Bakery Equipment',             'bakery-equipment',             '/assets/categories/bakery-equipment.jpg',             'Professional bakery and pastry equipment for commercial operations.',         NULL, FALSE, 7,  NOW(), NOW()),
('Kitchen Ventilation',          'kitchen-ventilation',          '/assets/categories/kitchen-ventilation.jpg',          'Commercial kitchen ventilation hoods and exhaust systems.',                  NULL, FALSE, 8,  NOW(), NOW()),
('Catering & Buffet',            'catering-buffet',              '/assets/categories/catering-buffet.jpg',              'Catering and buffet service equipment for events and hotels.',               NULL, TRUE,  9,  NOW(), NOW()),
('Kitchen Smallwares',           'kitchen-smallwares',           '/assets/categories/kitchen-smallwares.jpg',           'Professional kitchen smallwares, pots, pans, and utensils.',                 NULL, FALSE, 10, NOW(), NOW()),
('Storage & Shelving',           'storage-shelving',             '/assets/categories/storage-shelving.jpg',             'Commercial storage and shelving solutions for professional kitchens.',       NULL, FALSE, 11, NOW(), NOW()),
('Bar Equipment',                'bar-equipment',                '/assets/categories/bar-equipment.jpg',                'Professional bar equipment for hotels, restaurants, and nightlife venues.',  NULL, FALSE, 12, NOW(), NOW()),
('Outdoor Grills & BBQ',         'outdoor-grills-bbq',           '/assets/categories/outdoor-grills-bbq.jpg',           'Commercial outdoor grills and BBQ equipment for UAE climate.',              NULL, FALSE, 13, NOW(), NOW()),
('Hotel & Hospitality Supplies', 'hotel-hospitality-supplies',   '/assets/categories/hotel-hospitality-supplies.jpg',  'Hospitality supplies for UAE hotels, resorts, and banquet facilities.',     NULL, TRUE,  14, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, image = EXCLUDED.image, description = EXCLUDED.description,
    is_featured = EXCLUDED.is_featured, sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- ── Children of: Commercial Cooking Equipment ────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Gas Ranges',      'commercial-gas-ranges',      '/assets/categories/commercial-gas-ranges.jpg',      'Commercial gas ranges for professional kitchens in the UAE.',      1),
  ('Commercial Electric Ovens',  'commercial-electric-ovens',  '/assets/categories/commercial-electric-ovens.jpg',  'Commercial electric ovens for professional kitchens in the UAE.',  2),
  ('Combi Ovens',                'combi-ovens',                '/assets/categories/combi-ovens.jpg',                'Combi ovens for commercial kitchens in the UAE.',                  3),
  ('Commercial Grills & Griddles','commercial-grills-griddles','/assets/categories/commercial-grills-griddles.jpg', 'Commercial grills & griddles for professional kitchens.',          4),
  ('Deep Fryers',                'deep-fryers',                '/assets/categories/deep-fryers.jpg',                'Deep fryers for commercial kitchens in the UAE.',                  5),
  ('Salamanders & Broilers',     'salamanders-broilers',       '/assets/categories/salamanders-broilers.jpg',       'Salamanders & broilers for professional kitchens.',                6),
  ('Induction Cookers',          'induction-cookers',          '/assets/categories/induction-cookers.jpg',          'Induction cookers for commercial kitchens in the UAE.',            7)
) AS v(n, s, img, d, so)
WHERE p.slug = 'commercial-cooking-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Commercial Refrigeration ────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Upright Refrigerators', 'commercial-upright-refrigerators', '/assets/categories/commercial-upright-refrigerators.jpg', 'Upright commercial refrigerators for kitchens.',  1),
  ('Commercial Freezers',              'commercial-freezers',              '/assets/categories/commercial-freezers.jpg',              'Commercial freezers for professional kitchens.',  2),
  ('Display Chillers & Showcase',      'display-chillers-showcase',        '/assets/categories/display-chillers-showcase.jpg',        'Display chillers and showcase refrigerators.',    3),
  ('Ice Machines',                     'ice-machines',                     '/assets/categories/ice-machines.jpg',                     'Commercial ice machines for bars and hotels.',    4),
  ('Under-Counter Refrigerators',      'under-counter-refrigerators',      '/assets/categories/under-counter-refrigerators.jpg',      'Under-counter refrigerators for prep stations.', 5),
  ('Cold Rooms',                       'cold-rooms',                       '/assets/categories/cold-rooms.jpg',                       'Walk-in cold rooms for large operations.',        6)
) AS v(n, s, img, d, so)
WHERE p.slug = 'commercial-refrigeration'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Food Preparation Equipment ──────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Mixers',          'commercial-mixers',          '/assets/categories/commercial-mixers.jpg',          'Planetary and spiral mixers for bakeries and kitchens.', 1),
  ('Food Processors & Cutters',  'food-processors-cutters',    '/assets/categories/food-processors-cutters.jpg',    'Food processors and bowl cutters for prep kitchens.',    2),
  ('Vegetable Prep Machines',    'vegetable-prep-machines',    '/assets/categories/vegetable-prep-machines.jpg',    'Continuous feed vegetable preparation machines.',        3),
  ('Meat Grinders & Mincers',    'meat-grinders-mincers',      '/assets/categories/meat-grinders-mincers.jpg',      'Commercial meat grinders and mincers.',                  4),
  ('Slicers',                    'slicers',                    '/assets/categories/slicers.jpg',                    'Commercial deli and meat slicers.',                      5),
  ('Peelers',                    'peelers',                    '/assets/categories/peelers.jpg',                    'Commercial vegetable and potato peelers.',               6)
) AS v(n, s, img, d, so)
WHERE p.slug = 'food-preparation-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Warewashing Equipment ───────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Dishwashers',      'commercial-dishwashers',      '/assets/categories/commercial-dishwashers.jpg',      'Hood and rack commercial dishwashers.',             1),
  ('Glass Washers',               'glass-washers',               '/assets/categories/glass-washers.jpg',               'Undercounter glass washing machines for bars.',     2),
  ('Pot Washers',                 'pot-washers',                 '/assets/categories/pot-washers.jpg',                 'Heavy-duty pot and utensil washers.',               3),
  ('Rack Conveyor Dishwashers',   'rack-conveyor-dishwashers',   '/assets/categories/rack-conveyor-dishwashers.jpg',   'High-volume rack conveyor warewashing systems.',    4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'warewashing-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Food Display & Serving ──────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Hot Display Cases',        'hot-display-cases',        '/assets/categories/hot-display-cases.jpg',        'Heated display cases for hot food service.',           1),
  ('Cold Display Cases',       'cold-display-cases',       '/assets/categories/cold-display-cases.jpg',       'Refrigerated display cases for cold food.',             2),
  ('Buffet Counters',          'buffet-counters',          '/assets/categories/buffet-counters.jpg',          'Buffet service counters for hotels and catering.',      3),
  ('Heated Display Cabinets',  'heated-display-cabinets',  '/assets/categories/heated-display-cabinets.jpg',  'Freestanding heated food display cabinets.',            4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'food-display-serving'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Beverage Equipment ──────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Coffee Machines',   'commercial-coffee-machines',  '/assets/categories/commercial-coffee-machines.jpg',  'Espresso machines and coffee systems for cafes and hotels.', 1),
  ('Juice Extractors',             'juice-extractors',            '/assets/categories/juice-extractors.jpg',            'Commercial juice extractors and citrus squeezers.',         2),
  ('Water Dispensers & Coolers',   'water-dispensers-coolers',    '/assets/categories/water-dispensers-coolers.jpg',    'Commercial water dispensers and bottle coolers.',           3),
  ('Commercial Blenders',          'commercial-blenders',         '/assets/categories/commercial-blenders.jpg',         'High-performance commercial blenders for kitchens.',        4),
  ('Soft Drink Dispensers',        'soft-drink-dispensers',       '/assets/categories/soft-drink-dispensers.jpg',       'Post-mix and pre-mix soft drink dispensing systems.',       5),
  ('Tea Brewers',                  'tea-brewers',                 '/assets/categories/tea-brewers.jpg',                 'Commercial tea brewing and dispensing equipment.',          6)
) AS v(n, s, img, d, so)
WHERE p.slug = 'beverage-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Bakery Equipment ────────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Deck Ovens',          'deck-ovens',          '/assets/categories/deck-ovens.jpg',          'Stone deck ovens for artisan bread and pizza.',             1),
  ('Convection Ovens',    'convection-ovens',     '/assets/categories/convection-ovens.jpg',    'Full and half-size commercial convection ovens.',           2),
  ('Dough Mixers',        'dough-mixers',         '/assets/categories/dough-mixers.jpg',        'Spiral and fork dough mixers for bakeries.',                3),
  ('Bread Slicers',       'bread-slicers',        '/assets/categories/bread-slicers.jpg',       'Commercial automatic bread slicing machines.',              4),
  ('Proofing Cabinets',   'proofing-cabinets',    '/assets/categories/proofing-cabinets.jpg',   'Retarder proofers and proving cabinets for bakeries.',      5),
  ('Dough Sheeters',      'dough-sheeters',       '/assets/categories/dough-sheeters.jpg',      'Reversible and floor-standing dough sheeting machines.',    6)
) AS v(n, s, img, d, so)
WHERE p.slug = 'bakery-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Kitchen Ventilation ─────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Exhaust Hoods',       'exhaust-hoods',       '/assets/categories/exhaust-hoods.jpg',       'Wall and island exhaust hoods for commercial kitchens.',     1),
  ('Make-Up Air Units',   'make-up-air-units',   '/assets/categories/make-up-air-units.jpg',   'Fresh air supply units for kitchen ventilation balance.',   2),
  ('Grease Filters',      'grease-filters',      '/assets/categories/grease-filters.jpg',      'Replacement grease filters for kitchen exhaust hoods.',     3),
  ('Ventilation Fans',    'ventilation-fans',    '/assets/categories/ventilation-fans.jpg',    'Commercial ventilation fans and blowers.',                  4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'kitchen-ventilation'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Catering & Buffet ───────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Chafing Dishes',     'chafing-dishes',     '/assets/categories/chafing-dishes.jpg',     'Stainless steel chafing dishes for buffet service.',        1),
  ('Bain Marie',         'bain-marie',         '/assets/categories/bain-marie.jpg',         'Counter-top and drop-in bain marie units.',                 2),
  ('Service Trolleys',   'service-trolleys',   '/assets/categories/service-trolleys.jpg',   'Stainless steel service and transport trolleys.',           3),
  ('Food Warmers',       'food-warmers',       '/assets/categories/food-warmers.jpg',        'Heat lamps and food warmers for buffet lines.',             4),
  ('Carving Stations',   'carving-stations',   '/assets/categories/carving-stations.jpg',   'Heated carving stations for hotel buffet operations.',      5)
) AS v(n, s, img, d, so)
WHERE p.slug = 'catering-buffet'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Kitchen Smallwares ──────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Commercial Pots & Pans',  'commercial-pots-pans',  '/assets/categories/commercial-pots-pans.jpg',  'Heavy-duty stainless steel pots and pans.',             1),
  ('Professional Knives',     'professional-knives',    '/assets/categories/professional-knives.jpg',   'Chef and professional kitchen knives.',                 2),
  ('Kitchen Utensils',        'kitchen-utensils',       '/assets/categories/kitchen-utensils.jpg',      'Ladles, spatulas, tongs, and kitchen tools.',           3),
  ('Bakeware & Molds',        'bakeware-molds',         '/assets/categories/bakeware-molds.jpg',        'Baking trays, molds, and pastry tools.',                4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'kitchen-smallwares'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Storage & Shelving ──────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Wire Shelving Units',   'wire-shelving-units',  '/assets/categories/wire-shelving-units.jpg',  'NSF wire shelving for walk-in coolers and storerooms.',  1),
  ('Solid Shelving',        'solid-shelving',        '/assets/categories/solid-shelving.jpg',       'Solid stainless and polymer shelving for dry storage.',  2),
  ('Storage Containers',    'storage-containers',    '/assets/categories/storage-containers.jpg',   'Polycarbonate and polyethylene food storage containers.',3),
  ('Mobile Storage Racks',  'mobile-storage-racks',  '/assets/categories/mobile-storage-racks.jpg', 'Sheet pan racks and mobile storage rack systems.',       4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'storage-shelving'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Bar Equipment ───────────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Bar Refrigerators',    'bar-refrigerators',   '/assets/categories/bar-refrigerators.jpg',   'Back-bar and under-counter bar refrigerators.',             1),
  ('Ice Bins & Crushers',  'ice-bins-crushers',   '/assets/categories/ice-bins-crushers.jpg',   'Bar ice bins, ice crushers, and ice dispensers.',           2),
  ('Draft Beer Systems',   'draft-beer-systems',  '/assets/categories/draft-beer-systems.jpg',  'Complete draft beer and beverage dispensing systems.',      3),
  ('Bar Blenders',         'bar-blenders',        '/assets/categories/bar-blenders.jpg',        'Heavy-duty bar blenders for cocktails and smoothies.',      4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'bar-equipment'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Outdoor Grills & BBQ ────────────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Charcoal BBQ Grills',          'charcoal-bbq-grills',          '/assets/categories/charcoal-bbq-grills.jpg',          'Commercial charcoal grills for outdoor cooking.',          1),
  ('Gas BBQ Grills',               'gas-bbq-grills',               '/assets/categories/gas-bbq-grills.jpg',               'Commercial gas grills for outdoor operations.',            2),
  ('Tandoor Ovens',                'tandoor-ovens',                '/assets/categories/tandoor-ovens.jpg',                'Traditional clay tandoor ovens for Middle Eastern cuisine.',3),
  ('Outdoor Cooking Accessories',  'outdoor-cooking-accessories',  '/assets/categories/outdoor-cooking-accessories.jpg',  'Accessories for outdoor commercial cooking.',              4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'outdoor-grills-bbq'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- ── Children of: Hotel & Hospitality Supplies ────────────────
INSERT INTO categories (name, slug, image, description, parent_id, is_featured, sort_order, created_at, updated_at)
SELECT v.n, v.s, v.img, v.d, p.id, FALSE, v.so, NOW(), NOW()
FROM categories p,
(VALUES
  ('Room Service Trolleys',  'room-service-trolleys',  '/assets/categories/room-service-trolleys.jpg',  'Hotel room service and breakfast trolleys.',              1),
  ('Banquet Equipment',      'banquet-equipment',      '/assets/categories/banquet-equipment.jpg',      'Banquet trolleys, staging, and event equipment.',         2),
  ('Housekeeping Trolleys',  'housekeeping-trolleys',  '/assets/categories/housekeeping-trolleys.jpg',  'Hotel housekeeping and linen service trolleys.',          3),
  ('Amenity Dispensers',     'amenity-dispensers',     '/assets/categories/amenity-dispensers.jpg',     'In-room amenity dispensers for hotels and resorts.',      4)
) AS v(n, s, img, d, so)
WHERE p.slug = 'hotel-hospitality-supplies'
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, image = EXCLUDED.image, updated_at = NOW();

-- =============================================================
-- SECTION 4 — PRODUCTS (33 rows)
-- Each product uses subqueries for category_id and brand_id
-- thumbnail  = /assets/products/{slug}.jpg
-- images     = array of 3 views per product
-- =============================================================

-- ── BEST SELLERS (10 products) ───────────────────────────────

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Rational SCC WE 6-1/1 Combi Oven',
  'rational-scc-we-6-1-1-combi-oven',
  'RAT-SCC-61',
  '/assets/products/rational-scc-we-6-1-1-combi-oven.jpg',
  '["/assets/products/rational-scc-we-6-1-1-combi-oven.jpg","/assets/products/rational-scc-we-6-1-1-combi-oven-2.jpg","/assets/products/rational-scc-we-6-1-1-combi-oven-3.jpg"]'::jsonb,
  28500.00, 33000.00,
  '6 x 1/1 GN combi oven with WiFi connectivity. Ideal for restaurants and hotels.',
  'The Rational SCC WE combi oven combines steam, convection and combination cooking in one unit. Features 6 x 1/1 GN capacity, WiFi-based ConnectedCooking, and Efficient CareControl automatic cleaning.',
  FALSE, TRUE, TRUE, 5,
  (SELECT id FROM categories WHERE slug = 'combi-ovens'),
  (SELECT id FROM brands WHERE slug = 'rational'),
  '{"Capacity":"6 x 1/1 GN","Power Supply":"400V / 3N~","Connected Load":"10.5 kW","Dimensions (mm)":"847 x 771 x 748","Weight":"85 kg"}'::jsonb,
  '["combi oven","rational","restaurant","hotel"]'::jsonb,
  4.90, 187, 1240, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Hobart ECOMAX 504 Hood Dishwasher',
  'hobart-ecomax-504-hood-dishwasher',
  'HOB-ECO-504',
  '/assets/products/hobart-ecomax-504-hood-dishwasher.jpg',
  '["/assets/products/hobart-ecomax-504-hood-dishwasher.jpg","/assets/products/hobart-ecomax-504-hood-dishwasher-2.jpg","/assets/products/hobart-ecomax-504-hood-dishwasher-3.jpg"]'::jsonb,
  15200.00, 18500.00,
  'High-performance hood dishwasher, 540 racks/hour, heat recovery system.',
  'The Hobart ECOMAX 504 hood-type dishwasher delivers exceptional cleaning at up to 540 racks per hour. Features integrated heat recovery reducing energy by up to 25%, dual-rinse system, and automatic soil-level detection.',
  FALSE, TRUE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'commercial-dishwashers'),
  (SELECT id FROM brands WHERE slug = 'hobart'),
  '{"Capacity":"540 racks/hr","Wash Temp":"60°C","Rinse Temp":"85°C","Power":"400V / 3N~","Tank Volume":"25 L"}'::jsonb,
  '["dishwasher","hobart","warewashing"]'::jsonb,
  4.75, 143, 980, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Hoshizaki IM-130NE-HC Ice Machine',
  'hoshizaki-im-130ne-hc-ice-machine',
  'HSK-IM130',
  '/assets/products/hoshizaki-im-130ne-hc-ice-machine.jpg',
  '["/assets/products/hoshizaki-im-130ne-hc-ice-machine.jpg","/assets/products/hoshizaki-im-130ne-hc-ice-machine-2.jpg","/assets/products/hoshizaki-im-130ne-hc-ice-machine-3.jpg"]'::jsonb,
  8750.00, 10200.00,
  '130 kg/24h crescent cube ice maker with 50 L storage bin. R-404A refrigerant.',
  'The Hoshizaki IM-130NE-HC produces clear, slow-melting crescent cubes at up to 130 kg per 24 hours. Stainless steel evaporator, anti-microbial EvaporatorGuard, and easy front-access cleaning.',
  FALSE, TRUE, TRUE, 6,
  (SELECT id FROM categories WHERE slug = 'ice-machines'),
  (SELECT id FROM brands WHERE slug = 'hoshizaki'),
  '{"Ice Production":"130 kg / 24h","Storage Bin":"50 L","Refrigerant":"R-404A","Dimensions (mm)":"640 x 620 x 965","Weight":"78 kg"}'::jsonb,
  '["ice machine","hoshizaki","bar","hotel"]'::jsonb,
  4.80, 132, 875, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Robot Coupe R401 Food Processor',
  'robot-coupe-r401-food-processor',
  'RC-R401',
  '/assets/products/robot-coupe-r401-food-processor.jpg',
  '["/assets/products/robot-coupe-r401-food-processor.jpg","/assets/products/robot-coupe-r401-food-processor-2.jpg","/assets/products/robot-coupe-r401-food-processor-3.jpg"]'::jsonb,
  4200.00, 5000.00,
  '4.5 L food processor with two-speed motor. Includes stainless steel s-blade and disc.',
  'The Robot Coupe R401 is the professional kitchen workhorse. Equipped with a 2-speed 1.5 kW motor, 4.5 L stainless bowl, and an extensive range of discs and blades. Perfect for chopping, slicing, grating, and mixing.',
  FALSE, TRUE, TRUE, 8,
  (SELECT id FROM categories WHERE slug = 'food-processors-cutters'),
  (SELECT id FROM brands WHERE slug = 'robot-coupe'),
  '{"Bowl Capacity":"4.5 L","Motor":"1.5 kW","Speeds":"2 (350 / 1500 rpm)","Power Supply":"230V / 50Hz","Weight":"9.2 kg"}'::jsonb,
  '["food processor","robot coupe","preparation"]'::jsonb,
  4.85, 98, 740, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Vitamix 5200 Commercial Blender',
  'vitamix-5200-commercial-blender',
  'VTX-5200',
  '/assets/products/vitamix-5200-commercial-blender.jpg',
  '["/assets/products/vitamix-5200-commercial-blender.jpg","/assets/products/vitamix-5200-commercial-blender-2.jpg","/assets/products/vitamix-5200-commercial-blender-3.jpg"]'::jsonb,
  2850.00, 3400.00,
  'Variable speed commercial blender. 2-peak HP motor, 1.4 L container.',
  'The Vitamix 5200 delivers consistent, commercial-grade blending performance. Its 2-peak HP motor and laser-cut stainless steel blades handle hot soups, frozen desserts, and smoothies effortlessly.',
  FALSE, FALSE, TRUE, 10,
  (SELECT id FROM categories WHERE slug = 'commercial-blenders'),
  (SELECT id FROM brands WHERE slug = 'vitamix'),
  '{"Motor":"2 HP peak","Container":"1.4 L","Speed Settings":"10 variable","Dimensions":"18 x 18 x 46 cm","Weight":"5.2 kg"}'::jsonb,
  '["blender","vitamix","bar","restaurant"]'::jsonb,
  4.90, 215, 680, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Garland G60-6CS 6-Burner Gas Range',
  'garland-g60-6cs-6-burner-gas-range',
  'GAR-G60-6CS',
  '/assets/products/garland-g60-6cs-6-burner-gas-range.jpg',
  '["/assets/products/garland-g60-6cs-6-burner-gas-range.jpg","/assets/products/garland-g60-6cs-6-burner-gas-range-2.jpg","/assets/products/garland-g60-6cs-6-burner-gas-range-3.jpg"]'::jsonb,
  9800.00, 13500.00,
  '6-burner commercial gas range with 26 L oven. Heavy-duty cast iron grates.',
  'The Garland G60-6CS is a heavy-duty 6-burner gas range designed for commercial kitchens. Features 33,000 BTU open burners, a 26 L oven with 25,000 BTU burner, cast-iron grates, and stainless steel construction throughout.',
  FALSE, TRUE, TRUE, 3,
  (SELECT id FROM categories WHERE slug = 'commercial-gas-ranges'),
  (SELECT id FROM brands WHERE slug = 'garland'),
  '{"Burners":"6 x 33,000 BTU","Oven Capacity":"26 L","Oven Burner":"25,000 BTU","Width":"1524 mm","Weight":"218 kg"}'::jsonb,
  '["gas range","garland","restaurant","cooking"]'::jsonb,
  4.70, 76, 590, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'True T-49 Reach-In Refrigerator',
  'true-t-49-reach-in-refrigerator',
  'TRUE-T49',
  '/assets/products/true-t-49-reach-in-refrigerator.jpg',
  '["/assets/products/true-t-49-reach-in-refrigerator.jpg","/assets/products/true-t-49-reach-in-refrigerator-2.jpg","/assets/products/true-t-49-reach-in-refrigerator-3.jpg"]'::jsonb,
  7200.00, 8800.00,
  '2-door 49 cu. ft. reach-in refrigerator. LED interior, self-contained refrigeration.',
  'The True T-49 two-door reach-in refrigerator offers 49 cu. ft. of storage with LED lighting, self-contained refrigeration, and CFC-free insulation. Stainless steel interior and exterior with 4 adjustable PVC coated shelves per section.',
  FALSE, FALSE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'commercial-upright-refrigerators'),
  (SELECT id FROM brands WHERE slug = 'true-refrigeration'),
  '{"Capacity":"49 cu. ft.","Doors":"2","Temperature Range":"-1°C to +7°C","Refrigerant":"R-290","Width":"1369 mm"}'::jsonb,
  '["refrigerator","true","cold storage"]'::jsonb,
  4.65, 63, 540, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Cambro 18263CW Gastronorm Containers Set',
  'cambro-18263cw-gastronorm-containers-set',
  'CAM-18263CW',
  '/assets/products/cambro-18263cw-gastronorm-containers-set.jpg',
  '["/assets/products/cambro-18263cw-gastronorm-containers-set.jpg","/assets/products/cambro-18263cw-gastronorm-containers-set-2.jpg","/assets/products/cambro-18263cw-gastronorm-containers-set-3.jpg"]'::jsonb,
  380.00, 480.00,
  'Set of 6 polycarbonate food storage containers with lids. 1/6 GN, clear.',
  'Cambro polycarbonate gastronorm containers are the industry standard for food storage, prep, and display. BPA-free, temperature range -40°C to +99°C, dishwasher safe. Set includes 6 containers with matching lids.',
  FALSE, FALSE, TRUE, 30,
  (SELECT id FROM categories WHERE slug = 'storage-containers'),
  (SELECT id FROM brands WHERE slug = 'cambro'),
  '{"Size":"1/6 GN","Material":"Polycarbonate","Temp Range":"-40°C to +99°C","Set Contents":"6 containers + 6 lids"}'::jsonb,
  '["storage","cambro","gastronorm"]'::jsonb,
  4.60, 310, 1650, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Vulcan V2SG-1 2-Burner Gas Hotplate',
  'vulcan-v2sg-1-2-burner-gas-hotplate',
  'VUL-V2SG-1',
  '/assets/products/vulcan-v2sg-1-2-burner-gas-hotplate.jpg',
  '["/assets/products/vulcan-v2sg-1-2-burner-gas-hotplate.jpg","/assets/products/vulcan-v2sg-1-2-burner-gas-hotplate-2.jpg","/assets/products/vulcan-v2sg-1-2-burner-gas-hotplate-3.jpg"]'::jsonb,
  5200.00, 7500.00,
  '2-burner gas hotplate, 30,000 BTU per burner. Stainless front and sides.',
  'The Vulcan V2SG-1 two-burner gas hotplate offers powerful 30,000 BTU open burners on a compact frame. Heavy cast iron grates, standing pilot ignition, and full stainless exterior.',
  FALSE, FALSE, TRUE, 6,
  (SELECT id FROM categories WHERE slug = 'commercial-gas-ranges'),
  (SELECT id FROM brands WHERE slug = 'vulcan'),
  '{"Burners":"2 x 30,000 BTU","Width":"610 mm","Gas Type":"Natural Gas / LPG","Weight":"45 kg"}'::jsonb,
  '["hotplate","vulcan","cooking"]'::jsonb,
  4.55, 54, 460, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Winterhalter PT-M Pass-Through Dishwasher',
  'winterhalter-pt-m-pass-through-dishwasher',
  'WTH-PTM',
  '/assets/products/winterhalter-pt-m-pass-through-dishwasher.jpg',
  '["/assets/products/winterhalter-pt-m-pass-through-dishwasher.jpg","/assets/products/winterhalter-pt-m-pass-through-dishwasher-2.jpg","/assets/products/winterhalter-pt-m-pass-through-dishwasher-3.jpg"]'::jsonb,
  32000.00, 38000.00,
  'Pass-through dishwasher with heat recovery. 720 racks/hr, touchscreen control.',
  'The Winterhalter PT-M delivers flawless results at 720 racks per hour. Advanced heat recovery system, intelligent dosing systems integration, and intuitive TouchControl. Built for high-volume hotel and catering operations.',
  FALSE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'commercial-dishwashers'),
  (SELECT id FROM brands WHERE slug = 'winterhalter'),
  '{"Capacity":"720 racks/hr","Wash Temp":"55-65°C","Rinse Temp":"82-90°C","Power":"400V / 3N~","Heat Recovery":"Yes"}'::jsonb,
  '["dishwasher","winterhalter","hotel"]'::jsonb,
  4.95, 89, 420, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

-- ── NEW ARRIVALS (6 products) ─────────────────────────────────

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Rational iCombi Pro 6-1/1 Combi Oven',
  'rational-icombi-pro-6-1-1-combi-oven',
  'RAT-ICPRO-61',
  '/assets/products/rational-icombi-pro-6-1-1-combi-oven.jpg',
  '["/assets/products/rational-icombi-pro-6-1-1-combi-oven.jpg","/assets/products/rational-icombi-pro-6-1-1-combi-oven-2.jpg","/assets/products/rational-icombi-pro-6-1-1-combi-oven-3.jpg"]'::jsonb,
  45000.00, NULL,
  'Next-generation iCombi Pro with iProductionManager. 12 intelligent cooking modes.',
  'The Rational iCombi Pro sets new standards. Featuring iProductionManager for fully automatic multi-item cooking, iCookingSuite with 12 intelligent cooking modes, and automatic cleaning with iCareSystem. 6 x 1/1 GN capacity.',
  TRUE, TRUE, TRUE, 3,
  (SELECT id FROM categories WHERE slug = 'combi-ovens'),
  (SELECT id FROM brands WHERE slug = 'rational'),
  '{"Capacity":"6 x 1/1 GN","Cooking Modes":"12","Power":"400V / 3N~","Connected Load":"11.0 kW","Width":"847 mm"}'::jsonb,
  '["combi oven","rational","new","restaurant"]'::jsonb,
  5.00, 12, 85, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'La Marzocco Linea Classic S Espresso Machine',
  'la-marzocco-linea-classic-s-espresso-machine',
  'LM-LINEAS-2G',
  '/assets/products/la-marzocco-linea-classic-s-espresso-machine.jpg',
  '["/assets/products/la-marzocco-linea-classic-s-espresso-machine.jpg","/assets/products/la-marzocco-linea-classic-s-espresso-machine-2.jpg","/assets/products/la-marzocco-linea-classic-s-espresso-machine-3.jpg"]'::jsonb,
  22000.00, NULL,
  '2-group commercial espresso machine. Dual boiler, Saturated groups, USB connectivity.',
  'The La Marzocco Linea Classic S brings iconic Italian espresso technology with modern connectivity. Dual boiler system, saturated groups for thermal stability, PID temperature control, and USB port for software updates.',
  TRUE, TRUE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'commercial-coffee-machines'),
  (SELECT id FROM brands WHERE slug = 'la-marzocco'),
  '{"Groups":"2","Boiler System":"Dual boiler","Boiler Capacity":"7 L + 2 x 0.4 L","Power":"220-240V","Weight":"42 kg"}'::jsonb,
  '["espresso","coffee","la marzocco","new"]'::jsonb,
  4.95, 28, 62, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Hoshizaki DC-170 Display Chiller',
  'hoshizaki-dc-170-display-chiller',
  'HSK-DC170',
  '/assets/products/hoshizaki-dc-170-display-chiller.jpg',
  '["/assets/products/hoshizaki-dc-170-display-chiller.jpg","/assets/products/hoshizaki-dc-170-display-chiller-2.jpg","/assets/products/hoshizaki-dc-170-display-chiller-3.jpg"]'::jsonb,
  12500.00, NULL,
  '170 L upright display chiller with LED lighting. 0°C to +10°C. Curved glass door.',
  'The Hoshizaki DC-170 upright display chiller is ideal for showcasing beverages, desserts, and fresh produce. Curved glass door, white LED internal lighting, digital temperature control, and R-290 refrigerant.',
  TRUE, FALSE, TRUE, 5,
  (SELECT id FROM categories WHERE slug = 'display-chillers-showcase'),
  (SELECT id FROM brands WHERE slug = 'hoshizaki'),
  '{"Capacity":"170 L","Temp Range":"0°C to +10°C","Refrigerant":"R-290","Lighting":"LED","Width":"600 mm"}'::jsonb,
  '["display chiller","hoshizaki","new"]'::jsonb,
  4.70, 9, 38, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Electrolux Professional Air-O-Steam Touchline 10-1/1',
  'electrolux-professional-air-o-steam-touchline-10-1-1',
  'ELP-AOS-101',
  '/assets/products/electrolux-professional-air-o-steam-touchline-10-1-1.jpg',
  '["/assets/products/electrolux-professional-air-o-steam-touchline-10-1-1.jpg","/assets/products/electrolux-professional-air-o-steam-touchline-10-1-1-2.jpg","/assets/products/electrolux-professional-air-o-steam-touchline-10-1-1-3.jpg"]'::jsonb,
  38500.00, NULL,
  '10 x 1/1 GN combi oven with Touchline interface. SkyDoor opening system.',
  'The Electrolux Professional air-o-steam Touchline features the intuitive SkyDoor opening system, 7-inch touchscreen, Automatic Cooking Control (ACC), and EcoDelta cooking for precise temperature management. 10 x 1/1 GN capacity.',
  TRUE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'combi-ovens'),
  (SELECT id FROM brands WHERE slug = 'electrolux-professional'),
  '{"Capacity":"10 x 1/1 GN","Interface":"7-inch Touchline","Door":"SkyDoor","Power":"400V / 3N~","Connected Load":"16.1 kW"}'::jsonb,
  '["combi oven","electrolux","new"]'::jsonb,
  4.85, 17, 44, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Franke A600 FM Bean-to-Cup Coffee Machine',
  'franke-a600-fm-bean-to-cup-coffee-machine',
  'FRK-A600FM',
  '/assets/products/franke-a600-fm-bean-to-cup-coffee-machine.jpg',
  '["/assets/products/franke-a600-fm-bean-to-cup-coffee-machine.jpg","/assets/products/franke-a600-fm-bean-to-cup-coffee-machine-2.jpg","/assets/products/franke-a600-fm-bean-to-cup-coffee-machine-3.jpg"]'::jsonb,
  18900.00, NULL,
  'Automatic bean-to-cup with milk system. 250 cups/day. 10-inch HD touchscreen.',
  'The Franke A600 FM delivers consistently excellent coffee at up to 250 cups per day. 10-inch HD touchscreen, integrated FoamMaster milk system, 2 coffee bean hoppers, and automatic cleaning cycles.',
  TRUE, FALSE, TRUE, 5,
  (SELECT id FROM categories WHERE slug = 'commercial-coffee-machines'),
  (SELECT id FROM brands WHERE slug = 'franke-coffee-systems'),
  '{"Capacity":"250 cups/day","Screen":"10-inch HD touchscreen","Bean Hoppers":"2","Power":"230V / 50Hz","Weight":"26 kg"}'::jsonb,
  '["coffee machine","franke","bean to cup","new"]'::jsonb,
  4.80, 21, 55, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Atosa MGF8401GR Under-Counter Freezer',
  'atosa-mgf8401gr-under-counter-freezer',
  'ATO-MGF8401',
  '/assets/products/atosa-mgf8401gr-under-counter-freezer.jpg',
  '["/assets/products/atosa-mgf8401gr-under-counter-freezer.jpg","/assets/products/atosa-mgf8401gr-under-counter-freezer-2.jpg","/assets/products/atosa-mgf8401gr-under-counter-freezer-3.jpg"]'::jsonb,
  4200.00, NULL,
  '115 L under-counter freezer. -23°C to -13°C. 2 GN shelves included.',
  'The Atosa MGF8401GR under-counter freezer fits seamlessly under standard prep tables. 115 L capacity, digital temperature controller, auto-defrost, and 2 GN-compatible shelves. Ideal for prep kitchens and pastry sections.',
  TRUE, FALSE, TRUE, 8,
  (SELECT id FROM categories WHERE slug = 'commercial-freezers'),
  (SELECT id FROM brands WHERE slug = 'atosa'),
  '{"Capacity":"115 L","Temp Range":"-23°C to -13°C","Defrost":"Auto","Refrigerant":"R-290","Width":"700 mm"}'::jsonb,
  '["freezer","atosa","under-counter","new"]'::jsonb,
  4.55, 18, 72, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

-- ── TOP DEALS (6 discounted products) ────────────────────────

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Alto-Shaam 750-TH/III Cook & Hold Oven',
  'alto-shaam-750-th-iii-cook-hold-oven',
  'ALS-750TH',
  '/assets/products/alto-shaam-750-th-iii-cook-hold-oven.jpg',
  '["/assets/products/alto-shaam-750-th-iii-cook-hold-oven.jpg","/assets/products/alto-shaam-750-th-iii-cook-hold-oven-2.jpg","/assets/products/alto-shaam-750-th-iii-cook-hold-oven-3.jpg"]'::jsonb,
  7400.00, 10800.00,
  'Cook & Hold oven with Halo Heat technology. 12 x 1/1 GN. Save AED 3,400.',
  'Alto-Shaam Halo Heat surrounds food with gentle, even radiant heat, eliminating hot spots and preserving moisture. Holds at precise temperatures for hours without quality loss. 12 x 1/1 GN capacity, programmable cook and hold cycles.',
  FALSE, FALSE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'commercial-electric-ovens'),
  (SELECT id FROM brands WHERE slug = 'alto-shaam'),
  '{"Capacity":"12 x 1/1 GN","Technology":"Halo Heat","Temp Range":"60°C-200°C","Power":"208-240V","Weight":"95 kg"}'::jsonb,
  '["cook hold","alto shaam","deal"]'::jsonb,
  4.75, 56, 310, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Blodgett DFG-100 Full-Size Gas Convection Oven',
  'blodgett-dfg-100-full-size-gas-convection-oven',
  'BLO-DFG100',
  '/assets/products/blodgett-dfg-100-full-size-gas-convection-oven.jpg',
  '["/assets/products/blodgett-dfg-100-full-size-gas-convection-oven.jpg","/assets/products/blodgett-dfg-100-full-size-gas-convection-oven-2.jpg","/assets/products/blodgett-dfg-100-full-size-gas-convection-oven-3.jpg"]'::jsonb,
  6800.00, 9500.00,
  'Full-size gas convection oven. 5 rack capacity, 60,000 BTU. Porcelain interior.',
  'The Blodgett DFG-100 delivers consistent baking and roasting results with its 60,000 BTU burner and dual blower convection system. Porcelain interior for easy cleaning, 5 stainless steel racks, and single door with cool-touch handle.',
  FALSE, FALSE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'convection-ovens'),
  (SELECT id FROM brands WHERE slug = 'blodgett'),
  '{"Burner":"60,000 BTU","Rack Capacity":"5","Interior":"Porcelain","Oven Temp":"Up to 260°C","Width":"1067 mm"}'::jsonb,
  '["convection oven","blodgett","bakery","deal"]'::jsonb,
  4.60, 44, 290, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Manitowoc ID-0502A Indigo NXT Ice Machine',
  'manitowoc-id-0502a-indigo-nxt-ice-machine',
  'MAN-ID0502A',
  '/assets/products/manitowoc-id-0502a-indigo-nxt-ice-machine.jpg',
  '["/assets/products/manitowoc-id-0502a-indigo-nxt-ice-machine.jpg","/assets/products/manitowoc-id-0502a-indigo-nxt-ice-machine-2.jpg","/assets/products/manitowoc-id-0502a-indigo-nxt-ice-machine-3.jpg"]'::jsonb,
  5900.00, 7800.00,
  '230 kg/24h Indigo NXT cube ice maker. Air-cooled. Built-in LuminIce II hygiene.',
  'The Manitowoc Indigo NXT ID-0502A produces up to 230 kg of half-dice cube ice per 24 hours. LuminIce II built-in antimicrobial treatment, NXT IntelliCheck diagnostics, and integrated top-mount evaporator design.',
  FALSE, FALSE, TRUE, 5,
  (SELECT id FROM categories WHERE slug = 'ice-machines'),
  (SELECT id FROM brands WHERE slug = 'manitowoc'),
  '{"Ice Production":"230 kg / 24h","Cube Type":"Half Dice","Cooling":"Air-cooled","Refrigerant":"R-404A","Width":"762 mm"}'::jsonb,
  '["ice machine","manitowoc","deal"]'::jsonb,
  4.65, 72, 350, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Middleby Marshall PS360 WB Pizza Oven',
  'middleby-marshall-ps360-wb-pizza-oven',
  'MM-PS360WB',
  '/assets/products/middleby-marshall-ps360-wb-pizza-oven.jpg',
  '["/assets/products/middleby-marshall-ps360-wb-pizza-oven.jpg","/assets/products/middleby-marshall-ps360-wb-pizza-oven-2.jpg","/assets/products/middleby-marshall-ps360-wb-pizza-oven-3.jpg"]'::jsonb,
  14500.00, 19000.00,
  'Conveyor pizza oven, 12-inch belt, digital controls. Up to 120 pizzas/hour.',
  'The Middleby Marshall PS360 WB conveyor oven delivers consistent, high-volume pizza production at up to 120 pizzas per hour. 12-inch wide belt, Windata digital controls, variable speed, and patented air impingement technology.',
  FALSE, FALSE, TRUE, 3,
  (SELECT id FROM categories WHERE slug = 'commercial-electric-ovens'),
  (SELECT id FROM brands WHERE slug = 'middleby-marshall'),
  '{"Belt Width":"305 mm","Conveyor Type":"Variable speed","Capacity":"Up to 120 pizzas/hr","Power":"208-240V / 3-phase","Width":"1626 mm"}'::jsonb,
  '["pizza oven","middleby","conveyor","deal"]'::jsonb,
  4.80, 48, 240, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Hobart A200 20-Quart Planetary Mixer',
  'hobart-a200-20-quart-planetary-mixer',
  'HOB-A200',
  '/assets/products/hobart-a200-20-quart-planetary-mixer.jpg',
  '["/assets/products/hobart-a200-20-quart-planetary-mixer.jpg","/assets/products/hobart-a200-20-quart-planetary-mixer-2.jpg","/assets/products/hobart-a200-20-quart-planetary-mixer-3.jpg"]'::jsonb,
  8200.00, 10500.00,
  '20-quart planetary mixer. 3 speeds, 1/3 HP motor. Bowl guard included.',
  'The Hobart A200 is the bakery and pastry standard. 19 L stainless bowl, 1/3 HP motor with 3-speed transmission, and includes wire whisk, flat beater, and dough hook. Full range of optional accessories available.',
  FALSE, FALSE, TRUE, 5,
  (SELECT id FROM categories WHERE slug = 'commercial-mixers'),
  (SELECT id FROM brands WHERE slug = 'hobart'),
  '{"Bowl Capacity":"19 L (20 qt)","Motor":"1/3 HP","Speeds":"3","Power":"230V / 50Hz","Weight":"64 kg"}'::jsonb,
  '["mixer","hobart","bakery","deal"]'::jsonb,
  4.85, 93, 470, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Electrolux Professional 600 Induction Range',
  'electrolux-professional-600-induction-range',
  'ELP-600IR-4',
  '/assets/products/electrolux-professional-600-induction-range.jpg',
  '["/assets/products/electrolux-professional-600-induction-range.jpg","/assets/products/electrolux-professional-600-induction-range-2.jpg","/assets/products/electrolux-professional-600-induction-range-3.jpg"]'::jsonb,
  11500.00, 15000.00,
  '4-zone induction range, 600 mm. 3.5 kW per zone. AISI 316 stainless worktop.',
  'The Electrolux Professional 600 4-zone induction range delivers precise power from 200 W to 3.5 kW per zone, 99-level settings, and AISI 316 stainless steel worktop for maximum hygiene. Silent operation, no open flame.',
  FALSE, TRUE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'induction-cookers'),
  (SELECT id FROM brands WHERE slug = 'electrolux-professional'),
  '{"Zones":"4","Power per Zone":"3.5 kW","Total Power":"14.0 kW","Worktop":"AISI 316","Width":"600 mm"}'::jsonb,
  '["induction","electrolux","deal"]'::jsonb,
  4.75, 55, 320, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

-- ── FEATURED (11 products) ────────────────────────────────────

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Turbochef Tornado 2 High-Speed Oven',
  'turbochef-tornado-2-high-speed-oven',
  'TBC-TORN2',
  '/assets/products/turbochef-tornado-2-high-speed-oven.jpg',
  '["/assets/products/turbochef-tornado-2-high-speed-oven.jpg","/assets/products/turbochef-tornado-2-high-speed-oven-2.jpg","/assets/products/turbochef-tornado-2-high-speed-oven-3.jpg"]'::jsonb,
  24000.00, 28500.00,
  'High-speed oven cooks up to 15x faster. Countertop, no ventilation required.',
  'The Turbochef Tornado 2 uses Impingement, microwave, and convection to cook up to 15 times faster than conventional ovens. Vent-free operation with catalytic converter, perfect for cafes, hotels, and quick-service restaurants.',
  FALSE, TRUE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'combi-ovens'),
  (SELECT id FROM brands WHERE slug = 'turbochef'),
  '{"Cook Speed":"Up to 15x faster","Oven Temp":"Up to 232°C","Ventilation":"Catalytic converter, no hood needed","Power":"230V / 50Hz","Width":"597 mm"}'::jsonb,
  '["high speed oven","turbochef","quick service"]'::jsonb,
  4.85, 34, 180, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Cleveland 24CEM8 Electric Tilt Skillet',
  'cleveland-24cem8-electric-tilt-skillet',
  'CLV-24CEM8',
  '/assets/products/cleveland-24cem8-electric-tilt-skillet.jpg',
  '["/assets/products/cleveland-24cem8-electric-tilt-skillet.jpg","/assets/products/cleveland-24cem8-electric-tilt-skillet-2.jpg","/assets/products/cleveland-24cem8-electric-tilt-skillet-3.jpg"]'::jsonb,
  18000.00, NULL,
  '95 L electric tilt skillet, manual tilt, 16 kW. Stainless cover included.',
  'The Cleveland 24CEM8 tilt skillet handles braising, frying, simmering, and steaming in one unit. 95 L capacity, 16 kW heating element, manual gear-driven tilt with draw-off spigot, and stainless steel hinged cover.',
  FALSE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'commercial-electric-ovens'),
  (SELECT id FROM brands WHERE slug = 'cleveland-range'),
  '{"Capacity":"95 L","Heating Element":"16 kW","Tilt":"Manual gear-driven","Power":"400V / 3N~","Width":"1067 mm"}'::jsonb,
  '["tilt skillet","cleveland","catering"]'::jsonb,
  4.70, 27, 145, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_featured=EXCLUDED.is_featured, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Faema E71 E Imperial 2-Group Espresso Machine',
  'faema-e71-e-imperial-2-group-espresso-machine',
  'FAE-E71E-2G',
  '/assets/products/faema-e71-e-imperial-2-group-espresso-machine.jpg',
  '["/assets/products/faema-e71-e-imperial-2-group-espresso-machine.jpg","/assets/products/faema-e71-e-imperial-2-group-espresso-machine-2.jpg","/assets/products/faema-e71-e-imperial-2-group-espresso-machine-3.jpg"]'::jsonb,
  16500.00, 19800.00,
  '2-group espresso machine with E-WORK boiler management. Precise temperature stability.',
  'The Faema E71 E Imperial features the E-WORK multi-boiler system for precise group temperature stability, T3 technology, and digital pressure profiling. Designed for specialty coffee bars and boutique hotels.',
  FALSE, TRUE, TRUE, 3,
  (SELECT id FROM categories WHERE slug = 'commercial-coffee-machines'),
  (SELECT id FROM brands WHERE slug = 'faema'),
  '{"Groups":"2","Technology":"E-WORK Multi-boiler + T3","Boiler":"11 L main + 2 x 0.35 L","Power":"230V / 50Hz","Weight":"56 kg"}'::jsonb,
  '["espresso","faema","coffee","hotel"]'::jsonb,
  4.80, 42, 195, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Welbilt MercoMax Heated Display Cabinet',
  'welbilt-mercomax-heated-display-cabinet',
  'WLB-MMAX-3',
  '/assets/products/welbilt-mercomax-heated-display-cabinet.jpg',
  '["/assets/products/welbilt-mercomax-heated-display-cabinet.jpg","/assets/products/welbilt-mercomax-heated-display-cabinet-2.jpg","/assets/products/welbilt-mercomax-heated-display-cabinet-3.jpg"]'::jsonb,
  5800.00, 7200.00,
  '3-shelf heated display case, 950 W. Curved glass, interior LED lighting.',
  'The Welbilt MercoMax heated display cabinet keeps food at safe holding temperatures while showcasing it attractively. 3 adjustable stainless shelves, curved tempered glass, rear access, LED interior, and programmable digital temperature.',
  FALSE, TRUE, TRUE, 6,
  (SELECT id FROM categories WHERE slug = 'heated-display-cabinets'),
  (SELECT id FROM brands WHERE slug = 'welbilt'),
  '{"Shelves":"3 adjustable","Power":"950 W","Temperature":"65°C-90°C","Glass":"Curved tempered","Width":"750 mm"}'::jsonb,
  '["heated display","welbilt","display"]'::jsonb,
  4.60, 38, 260, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Meiko M-iQ Pass-Through Dishwasher',
  'meiko-m-iq-pass-through-dishwasher',
  'MEI-MIQ-PT',
  '/assets/products/meiko-m-iq-pass-through-dishwasher.jpg',
  '["/assets/products/meiko-m-iq-pass-through-dishwasher.jpg","/assets/products/meiko-m-iq-pass-through-dishwasher-2.jpg","/assets/products/meiko-m-iq-pass-through-dishwasher-3.jpg"]'::jsonb,
  28000.00, 34000.00,
  'M-iQ intelligent dishwasher, 900 racks/hr. Heat pump, near-zero steam emissions.',
  'The Meiko M-iQ is the world''s first dishwasher with an integrated heat pump. Rinse water heat is recovered with near-zero steam emission, reducing energy costs by up to 50%. Intelligent sensors automatically adjust cycle parameters.',
  FALSE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'commercial-dishwashers'),
  (SELECT id FROM brands WHERE slug = 'meiko'),
  '{"Capacity":"900 racks/hr","Technology":"Heat pump","Steam Emission":"Near-zero","Power":"400V / 3N~","Width":"1010 mm"}'::jsonb,
  '["dishwasher","meiko","hotel","energy saving"]'::jsonb,
  4.90, 61, 175, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Carpigiani LB-502G Gelato Batch Freezer',
  'carpigiani-lb-502g-gelato-batch-freezer',
  'CAR-LB502G',
  '/assets/products/carpigiani-lb-502g-gelato-batch-freezer.jpg',
  '["/assets/products/carpigiani-lb-502g-gelato-batch-freezer.jpg","/assets/products/carpigiani-lb-502g-gelato-batch-freezer-2.jpg","/assets/products/carpigiani-lb-502g-gelato-batch-freezer-3.jpg"]'::jsonb,
  35000.00, NULL,
  '5 L gravity-fed gelato batch freezer. Stainless steel cylinder. 15 min cycle.',
  'The Carpigiani LB-502G produces up to 12 kg/hour of artisan gelato, sorbet, and frozen desserts. Gravity-fed system, 5 L stainless steel cylinder, refrigerated hopper, and automatic extraction.',
  TRUE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'commercial-freezers'),
  (SELECT id FROM brands WHERE slug = 'carpigiani'),
  '{"Cylinder":"5 L","Hopper":"Refrigerated 5 L","Output":"Up to 12 kg/hr","Cycle Time":"~15 min","Width":"530 mm"}'::jsonb,
  '["gelato","carpigiani","ice cream","new"]'::jsonb,
  4.95, 14, 68, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Robot Coupe CL50D Vegetable Preparation Machine',
  'robot-coupe-cl50d-vegetable-preparation-machine',
  'RC-CL50D',
  '/assets/products/robot-coupe-cl50d-vegetable-preparation-machine.jpg',
  '["/assets/products/robot-coupe-cl50d-vegetable-preparation-machine.jpg","/assets/products/robot-coupe-cl50d-vegetable-preparation-machine-2.jpg","/assets/products/robot-coupe-cl50d-vegetable-preparation-machine-3.jpg"]'::jsonb,
  7600.00, 9200.00,
  'Continuous-feed vegetable cutter with 5 discs. 550 kg/hr throughput.',
  'The Robot Coupe CL50D is the standard for high-volume vegetable preparation. 0.75 kW motor, 5 double-sided discs (slice, grate, julienne, ripple, dice), continuous feed hopper, and 550 kg/hr throughput.',
  FALSE, FALSE, TRUE, 6,
  (SELECT id FROM categories WHERE slug = 'vegetable-prep-machines'),
  (SELECT id FROM brands WHERE slug = 'robot-coupe'),
  '{"Motor":"0.75 kW","Throughput":"Up to 550 kg/hr","Discs Included":"5","Power":"230V / 50Hz","Weight":"13 kg"}'::jsonb,
  '["vegetable cutter","robot coupe","preparation"]'::jsonb,
  4.80, 66, 385, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Comenda AC2 Hood Dishwasher',
  'comenda-ac2-hood-dishwasher',
  'COM-AC2',
  '/assets/products/comenda-ac2-hood-dishwasher.jpg',
  '["/assets/products/comenda-ac2-hood-dishwasher.jpg","/assets/products/comenda-ac2-hood-dishwasher-2.jpg","/assets/products/comenda-ac2-hood-dishwasher-3.jpg"]'::jsonb,
  12800.00, 15500.00,
  'Hood-type dishwasher, 480 racks/hr. Self-cleaning, rinse booster pump.',
  'The Comenda AC2 hood dishwasher features a powerful rinse booster pump, auto-clean cycle, and 480 racks/hr capacity. Stainless steel wash and rinse arms, electronic controls, and built-in rinse aid and detergent dispenser.',
  FALSE, FALSE, TRUE, 4,
  (SELECT id FROM categories WHERE slug = 'commercial-dishwashers'),
  (SELECT id FROM brands WHERE slug = 'comenda'),
  '{"Capacity":"480 racks/hr","Wash Temp":"55°C","Rinse Temp":"85°C","Booster Pump":"Yes","Width":"660 mm"}'::jsonb,
  '["dishwasher","comenda","warewashing"]'::jsonb,
  4.65, 47, 280, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Alto-Shaam CTP7-20H Combitherm CT PROformance',
  'alto-shaam-ctp7-20h-combitherm-ct-proformance',
  'ALS-CTP720H',
  '/assets/products/alto-shaam-ctp7-20h-combitherm-ct-proformance.jpg',
  '["/assets/products/alto-shaam-ctp7-20h-combitherm-ct-proformance.jpg","/assets/products/alto-shaam-ctp7-20h-combitherm-ct-proformance-2.jpg","/assets/products/alto-shaam-ctp7-20h-combitherm-ct-proformance-3.jpg"]'::jsonb,
  42000.00, NULL,
  '7 x 2/1 GN Combitherm combi oven. ChefLinc remote monitoring, Structured Steam.',
  'The Alto-Shaam Combitherm CT PROformance features patented Structured Steam and Combitherm Pure technology for superior moisture and cooking results. 7 x 2/1 GN, ChefLinc cloud monitoring, and Vector H technology for multi-zone cooking.',
  TRUE, TRUE, TRUE, 2,
  (SELECT id FROM categories WHERE slug = 'combi-ovens'),
  (SELECT id FROM brands WHERE slug = 'alto-shaam'),
  '{"Capacity":"7 x 2/1 GN","Technology":"Structured Steam + Vector H","Monitoring":"ChefLinc cloud","Power":"400V / 3N~","Width":"1076 mm"}'::jsonb,
  '["combi oven","alto shaam","hotel","new"]'::jsonb,
  4.90, 11, 55, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, is_new=EXCLUDED.is_new, is_featured=EXCLUDED.is_featured,
  thumbnail=EXCLUDED.thumbnail, images=EXCLUDED.images, specs=EXCLUDED.specs,
  rating=EXCLUDED.rating, review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'True T-23 Undercounter Refrigerator',
  'true-t-23-undercounter-refrigerator',
  'TRUE-T23UC',
  '/assets/products/true-t-23-undercounter-refrigerator.jpg',
  '["/assets/products/true-t-23-undercounter-refrigerator.jpg","/assets/products/true-t-23-undercounter-refrigerator-2.jpg","/assets/products/true-t-23-undercounter-refrigerator-3.jpg"]'::jsonb,
  6500.00, 8200.00,
  '23 cu. ft. undercounter refrigerator. R-290 refrigerant, LED interior.',
  'The True T-23 undercounter refrigerator fits standard 870 mm work table height. 23 cu. ft. capacity, 2 adjustable PVC shelves, LED interior, and R-290 eco-friendly refrigerant. Stainless steel exterior and interior.',
  FALSE, FALSE, TRUE, 6,
  (SELECT id FROM categories WHERE slug = 'under-counter-refrigerators'),
  (SELECT id FROM brands WHERE slug = 'true-refrigeration'),
  '{"Capacity":"23 cu. ft.","Temp Range":"0°C to +7°C","Refrigerant":"R-290","Shelves":"2 adjustable","Width":"1219 mm"}'::jsonb,
  '["undercounter fridge","true","deal"]'::jsonb,
  4.70, 81, 490, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

INSERT INTO products (name, slug, sku, thumbnail, images, price, original_price, short_description, description,
    is_new, is_featured, in_stock, stock_qty, category_id, brand_id, specs, tags,
    rating, review_count, sales_count, is_active, created_at, updated_at)
SELECT
  'Cambro CBP1826V148 Full-Size Sheet Pan Rack',
  'cambro-cbp1826v148-full-size-sheet-pan-rack',
  'CAM-CBP1826',
  '/assets/products/cambro-cbp1826v148-full-size-sheet-pan-rack.jpg',
  '["/assets/products/cambro-cbp1826v148-full-size-sheet-pan-rack.jpg","/assets/products/cambro-cbp1826v148-full-size-sheet-pan-rack-2.jpg","/assets/products/cambro-cbp1826v148-full-size-sheet-pan-rack-3.jpg"]'::jsonb,
  950.00, 1200.00,
  'Full-size 20-shelf pan rack with cover. NSF, polypropylene, 4 swivel casters.',
  'The Cambro full-size sheet pan rack holds up to 20 full-size sheet pans or 40 half-size pans. All-polypropylene construction resists corrosion, 4 swivel casters (2 with brakes), and available cover.',
  FALSE, FALSE, TRUE, 15,
  (SELECT id FROM categories WHERE slug = 'mobile-storage-racks'),
  (SELECT id FROM brands WHERE slug = 'cambro'),
  '{"Capacity":"20 full-size pans","Material":"Polypropylene","Casters":"4 swivel (2 braked)","Height":"1753 mm","Weight":"11.8 kg"}'::jsonb,
  '["pan rack","cambro","storage"]'::jsonb,
  4.50, 190, 820, TRUE, NOW(), NOW()
ON CONFLICT (slug) DO UPDATE SET
  price=EXCLUDED.price, original_price=EXCLUDED.original_price, thumbnail=EXCLUDED.thumbnail,
  images=EXCLUDED.images, specs=EXCLUDED.specs, rating=EXCLUDED.rating,
  review_count=EXCLUDED.review_count, sales_count=EXCLUDED.sales_count, updated_at=NOW();

-- =============================================================
-- SECTION 5 — ORDERS (customer enquiries table)
-- Format: {CC}{YYMMDD}{HHmmss}{ms3}  e.g. DU260731143052847
-- Sample rows demonstrate the customer details structure.
-- ON CONFLICT (order_ref) DO UPDATE allows safe re-runs.
-- =============================================================

INSERT INTO orders (order_ref, customer_name, customer_phone, customer_email, customer_company,
    delivery_address, city, notes, items, subtotal, status, created_at, updated_at)
VALUES
(
  'DU260731143052847',
  'Ahmed Al Mansouri',
  '+971 50 123 4567',
  'ahmed@albasha-restaurant.ae',
  'Al Basha Restaurant LLC',
  'Shop 12, Ground Floor, Jumeirah Beach Road, Near Mercato Mall',
  'Dubai',
  'Please include installation service quote. Need delivery within 2 weeks.',
  '[{"name":"Rational SCC WE 6-1/1 Combi Oven","sku":"RAT-SCC-61","quantity":1,"price":28500.00},{"name":"Hobart ECOMAX 504 Hood Dishwasher","sku":"HOB-ECO-504","quantity":1,"price":15200.00}]'::jsonb,
  43700.00,
  'confirmed',
  NOW(), NOW()
),
(
  'AD260731153210321',
  'Mohammed Al Hamadi',
  '+971 55 987 6543',
  NULL,
  'Grand Palace Hotel',
  'Corniche Road, Al Bateen District',
  'Abu Dhabi',
  'Bulk order for new hotel kitchen. Request site visit before final confirmation.',
  '[{"name":"Winterhalter PT-M Pass-Through Dishwasher","sku":"WTH-PTM","quantity":2,"price":32000.00},{"name":"Rational iCombi Pro 6-1/1 Combi Oven","sku":"RAT-ICPRO-61","quantity":3,"price":45000.00},{"name":"True T-49 Reach-In Refrigerator","sku":"TRUE-T49","quantity":4,"price":7200.00}]'::jsonb,
  228800.00,
  'processing',
  NOW(), NOW()
),
(
  'SH260731091844562',
  'Sara Al Qasimi',
  '+971 56 222 3344',
  'sara@goldenpalm-catering.com',
  'Golden Palm Catering Services',
  'Industrial Area 7, Warehouse 45',
  'Sharjah',
  'Flexible on delivery date. Please confirm stock availability for all items.',
  '[{"name":"Robot Coupe R401 Food Processor","sku":"RC-R401","quantity":2,"price":4200.00},{"name":"Hobart A200 20-Quart Planetary Mixer","sku":"HOB-A200","quantity":1,"price":8200.00},{"name":"Cambro 18263CW Gastronorm Containers Set","sku":"CAM-18263CW","quantity":10,"price":380.00}]'::jsonb,
  20000.00,
  'pending',
  NOW(), NOW()
)
ON CONFLICT (order_ref) DO UPDATE SET
    status     = EXCLUDED.status,
    notes      = EXCLUDED.notes,
    updated_at = NOW();

-- =============================================================
-- SECTION 6 — STATIC PAGES
-- =============================================================

INSERT INTO pages (slug, title, content, created_at, updated_at)
VALUES
('about-us',
 'About Us',
 '<h2>Your Trusted Partner for Commercial Kitchen Equipment in the UAE</h2><p>We supply premium commercial kitchen equipment to restaurants, hotels, catering companies, and foodservice businesses across the UAE. With over 15 years of experience, we partner with the world''s leading brands including Rational, Hobart, Hoshizaki, and La Marzocco.</p><p>Our team of kitchen equipment specialists is available to help you select the right equipment for your operation, from single-unit purchases to complete kitchen fitouts.</p><h3>Why Choose Us?</h3><ul><li>Authorised dealer for 25+ global brands</li><li>AED-priced inventory — no hidden import costs</li><li>Expert advice from certified kitchen equipment specialists</li><li>UAE-wide delivery and installation</li><li>After-sales service and spare parts support</li></ul>',
 NOW(), NOW()),
('contact',
 'Contact Us',
 '<h2>Get in Touch</h2><p>Our sales team is available Saturday–Thursday, 8:00 AM – 6:00 PM GST.</p><ul><li><strong>WhatsApp:</strong> +971 52 990 3885</li><li><strong>Email:</strong> sales@kitchenequip.ae</li><li><strong>Showroom:</strong> Al Quoz Industrial Area 3, Dubai, UAE</li></ul><p>For urgent enquiries, WhatsApp is the fastest way to reach us.</p>',
 NOW(), NOW()),
('terms-and-conditions',
 'Terms & Conditions',
 '<h2>Terms and Conditions</h2><p>All prices are quoted in UAE Dirhams (AED) and are subject to change without notice. Prices are exclusive of VAT (5%) unless otherwise stated.</p><p>Orders are confirmed upon receipt of a signed purchase order or a 50% advance payment. Delivery timelines are estimates and may vary based on stock availability and logistics.</p><p>All equipment comes with the manufacturer''s standard warranty. Installation services are available at additional cost.</p>',
 NOW(), NOW()),
('privacy-policy',
 'Privacy Policy',
 '<h2>Privacy Policy</h2><p>We collect only the information necessary to process your enquiry: your name, phone number, email address, company name, and delivery address. This information is used solely for responding to your enquiry and processing your order.</p><p>We do not sell, share, or distribute your personal information to third parties without your consent. Your data is stored securely and retained only as long as necessary.</p>',
 NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    title      = EXCLUDED.title,
    content    = EXCLUDED.content,
    updated_at = NOW();

-- =============================================================
-- SECTION 7 — RESET SEQUENCES
-- Ensures next auto-insert gets the correct next ID
-- =============================================================

SELECT setval(pg_get_serial_sequence('brands',     'id'), COALESCE((SELECT MAX(id) FROM brands),     1), true);
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);
SELECT setval(pg_get_serial_sequence('products',   'id'), COALESCE((SELECT MAX(id) FROM products),   1), true);
SELECT setval(pg_get_serial_sequence('orders',     'id'), COALESCE((SELECT MAX(id) FROM orders),     1), true);
SELECT setval(pg_get_serial_sequence('pages',      'id'), COALESCE((SELECT MAX(id) FROM pages),      1), true);

COMMIT;

-- =============================================================
-- QUICK VERIFICATION QUERIES (run after import to check counts)
-- =============================================================
-- SELECT 'brands'     AS tbl, COUNT(*) FROM brands;       -- expect 25
-- SELECT 'categories' AS tbl, COUNT(*) FROM categories;   -- expect 82
-- SELECT 'products'   AS tbl, COUNT(*) FROM products;     -- expect 33
-- SELECT 'orders'     AS tbl, COUNT(*) FROM orders;       -- expect 3
-- SELECT 'pages'      AS tbl, COUNT(*) FROM pages;        -- expect 4
--
-- Product image names follow the pattern:
--   /assets/products/{slug}.jpg
--   /assets/products/{slug}-2.jpg
--   /assets/products/{slug}-3.jpg
-- Place matching .jpg files in: api/public/assets/products/
--
-- Brand logo names follow the pattern:
--   /assets/brands/{slug}-logo.png
-- Place matching .png files in: api/public/assets/brands/
--
-- Category images follow the pattern:
--   /assets/categories/{slug}.jpg
-- Place matching .jpg files in: api/public/assets/categories/
-- =============================================================

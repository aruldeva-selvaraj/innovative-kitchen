<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ContactController;

// ── Auth ──────────────────────────────────────────────────────────────────────
// OWASP A07 — throttle:auth = 5 req/min per IP to prevent brute-force
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',     [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']); // revoke all devices
        Route::get('me',          [AuthController::class, 'me']);
    });
});

// ── Products ──────────────────────────────────────────────────────────────────
// OWASP A04 — throttle:public-api = 120 req/min per IP (anti-scraping)
Route::prefix('products')->middleware('throttle:public-api')->group(function () {
    Route::get('/',            [ProductController::class, 'index']);
    Route::get('featured',     [ProductController::class, 'featured']);
    Route::get('best-sellers', [ProductController::class, 'bestSellers']);
    Route::get('new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('top-deals',    [ProductController::class, 'topDeals']);
    Route::get('search',       [SearchController::class, 'search']);
    Route::get('{slug}',       [ProductController::class, 'show']);
    Route::get('{id}/related', [ProductController::class, 'related']);
});

// ── Categories ────────────────────────────────────────────────────────────────
Route::prefix('categories')->middleware('throttle:public-api')->group(function () {
    Route::get('/',               [CategoryController::class, 'index']);
    Route::get('top',             [CategoryController::class, 'top']);
    Route::get('tree',            [CategoryController::class, 'tree']);
    Route::get('{slug}',          [CategoryController::class, 'show']);
    Route::get('{slug}/products', [ProductController::class, 'byCategory']);
});

// ── Brands ────────────────────────────────────────────────────────────────────
Route::prefix('brands')->middleware('throttle:public-api')->group(function () {
    Route::get('/',        [BrandController::class, 'index']);
    Route::get('featured', [BrandController::class, 'featured']);
    Route::get('{slug}',   [BrandController::class, 'show']);
});

// ── Static pages & contact ────────────────────────────────────────────────────
Route::get('pages/{page}', [PageController::class, 'show'])
    ->middleware('throttle:public-api');

// OWASP A04 — contact = 3 req/min per IP to prevent email spam
Route::post('contact', [ContactController::class, 'send'])
    ->middleware('throttle:contact');

// ── Orders — public ───────────────────────────────────────────────────────────
// OWASP A04 — orders = 10 req/min + 50/day per IP to prevent order flooding
// OWASP A08 — OrderController looks up prices from DB, not from request
Route::post('orders', [OrderController::class, 'store'])
    ->middleware('throttle:orders');

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Cart (server-side sync for logged-in users)
    // OWASP A01 — CartController verifies item ownership before update/delete
    Route::prefix('cart')->group(function () {
        Route::get('/',       [CartController::class, 'index']);
        Route::post('/',      [CartController::class, 'store']);
        Route::put('{id}',    [CartController::class, 'update']);
        Route::delete('{id}', [CartController::class, 'destroy']);
        Route::delete('/',    [CartController::class, 'clear']);
    });

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/',       [WishlistController::class, 'index']);
        Route::post('/',      [WishlistController::class, 'toggle']);
        Route::delete('{id}', [WishlistController::class, 'destroy']);
    });
});

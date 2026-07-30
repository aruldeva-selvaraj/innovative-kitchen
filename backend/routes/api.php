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

// Auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
    Route::middleware('auth:sanctum')->get('me',     [AuthController::class, 'me']);
});

// Products
Route::prefix('products')->group(function () {
    Route::get('/',            [ProductController::class, 'index']);
    Route::get('featured',     [ProductController::class, 'featured']);
    Route::get('best-sellers', [ProductController::class, 'bestSellers']);
    Route::get('new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('top-deals',    [ProductController::class, 'topDeals']);
    Route::get('search',       [SearchController::class, 'search']);
    Route::get('{slug}',       [ProductController::class, 'show']);
    Route::get('{id}/related', [ProductController::class, 'related']);
});

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/',                    [CategoryController::class, 'index']);
    Route::get('top',                  [CategoryController::class, 'top']);
    Route::get('tree',                 [CategoryController::class, 'tree']);
    Route::get('{slug}',               [CategoryController::class, 'show']);
    Route::get('{slug}/products',      [ProductController::class, 'byCategory']);
});

// Brands
Route::prefix('brands')->group(function () {
    Route::get('/',          [BrandController::class, 'index']);
    Route::get('featured',   [BrandController::class, 'featured']);
    Route::get('{slug}',     [BrandController::class, 'show']);
});

// Static pages
Route::get('pages/{page}', [PageController::class, 'show']);
Route::post('contact',     [ContactController::class, 'send']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Account
    Route::prefix('account')->group(function () {
        Route::get('orders',      [OrderController::class, 'index']);
        Route::post('orders',     [OrderController::class, 'store']);
        Route::get('orders/{id}', [OrderController::class, 'show']);
    });

    // Cart (server-side sync for logged-in users)
    Route::prefix('cart')->group(function () {
        Route::get('/',         [CartController::class, 'index']);
        Route::post('/',        [CartController::class, 'store']);
        Route::put('{id}',      [CartController::class, 'update']);
        Route::delete('{id}',   [CartController::class, 'destroy']);
        Route::delete('/',      [CartController::class, 'clear']);
    });

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/',       [WishlistController::class, 'index']);
        Route::post('/',      [WishlistController::class, 'toggle']);
        Route::delete('{id}', [WishlistController::class, 'destroy']);
    });
});

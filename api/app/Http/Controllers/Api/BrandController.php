<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::withCount('products')->orderBy('name')->get());
    }

    public function featured()
    {
        return response()->json(Brand::where('is_featured', true)->orderBy('sort_order')->get());
    }

    public function show(string $slug)
    {
        $brand = Brand::withCount('products')->where('slug', $slug)->firstOrFail();
        return response()->json($brand);
    }
}

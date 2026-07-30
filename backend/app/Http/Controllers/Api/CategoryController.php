<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::withCount('products')->whereNull('parent_id')->orderBy('sort_order')->get()
        );
    }

    public function top()
    {
        return response()->json(
            Category::with('children.children')
                ->whereNull('parent_id')
                ->where('is_featured', true)
                ->withCount('products')
                ->orderBy('sort_order')
                ->limit(12)
                ->get()
        );
    }

    public function tree()
    {
        return response()->json(
            Category::with('children.children')->whereNull('parent_id')->orderBy('sort_order')->get()
        );
    }

    public function show(string $slug)
    {
        $category = Category::with('children')->where('slug', $slug)->firstOrFail();
        return response()->json($category);
    }
}

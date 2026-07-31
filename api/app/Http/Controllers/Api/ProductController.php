<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])->active();

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->brand) {
            $brands = (array) $request->brand;
            $query->whereHas('brand', fn($q) => $q->whereIn('slug', $brands));
        }

        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->boolean('in_stock')) {
            $query->where('in_stock', true);
        }

        match ($request->sort) {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'newest'     => $query->latest(),
            default      => $query->orderByDesc('sales_count'),
        };

        $perPage = min((int) $request->get('per_page', 24), 100);

        return ProductResource::collection($query->paginate($perPage));
    }

    public function show(string $slug)
    {
        $product = Product::with(['category', 'brand'])->where('slug', $slug)->firstOrFail();
        return new ProductResource($product);
    }

    public function featured()
    {
        return ProductResource::collection(
            Product::with('brand')->active()->featured()->limit(12)->get()
        );
    }

    public function bestSellers()
    {
        return ProductResource::collection(
            Product::with('brand')->active()->orderByDesc('sales_count')->limit(20)->get()
        );
    }

    public function newArrivals()
    {
        return ProductResource::collection(
            Product::with('brand')->active()->where('is_new', true)->latest()->limit(20)->get()
        );
    }

    public function topDeals()
    {
        return ProductResource::collection(
            Product::with('brand')->active()
                ->whereNotNull('original_price')
                ->whereColumn('price', '<', 'original_price')
                ->orderByRaw('(original_price - price) / original_price DESC')
                ->limit(20)->get()
        );
    }

    public function byCategory(Request $request, string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = Product::with(['brand'])->active()
            ->where(function ($q) use ($category) {
                $q->where('category_id', $category->id)
                  ->orWhereHas('category', fn($q2) => $q2->where('parent_id', $category->id));
            });

        return ProductResource::collection($query->paginate(24));
    }

    public function related(int $id)
    {
        $product = Product::findOrFail($id);
        return ProductResource::collection(
            Product::with('brand')->active()
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $id)
                ->limit(8)->get()
        );
    }
}

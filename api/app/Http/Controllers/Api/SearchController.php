<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->validate(['q' => 'required|string|min:2'])['q'];

        $products = Product::with(['category', 'brand'])
            ->active()
            ->where(function ($query) use ($q) {
                $query->whereILike('name', "%{$q}%")
                      ->orWhereILike('description', "%{$q}%")
                      ->orWhereILike('sku', "%{$q}%")
                      ->orWhereHas('brand', fn($b) => $b->whereILike('name', "%{$q}%"))
                      ->orWhereHas('category', fn($c) => $c->whereILike('name', "%{$q}%"));
            })
            ->paginate((int) $request->get('per_page', 24));

        return ProductResource::collection($products);
    }
}

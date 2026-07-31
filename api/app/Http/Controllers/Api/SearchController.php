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
        // OWASP A03 — cap query length; enforce safe per_page ceiling
        $validated = $request->validate([
            'q'        => 'required|string|min:2|max:100',
            'per_page' => 'sometimes|integer|min:1|max:48',
        ]);

        $q       = $validated['q'];
        $perPage = (int) ($validated['per_page'] ?? 24);

        $products = Product::with(['category', 'brand'])
            ->active()
            ->where(function ($query) use ($q) {
                $query->whereILike('name', "%{$q}%")
                      ->orWhereILike('sku', "%{$q}%")
                      ->orWhereHas('brand', fn ($b) => $b->whereILike('name', "%{$q}%"))
                      ->orWhereHas('category', fn ($c) => $c->whereILike('name', "%{$q}%"));
            })
            ->paginate($perPage);

        return ProductResource::collection($products);
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'slug'              => $this->slug,
            'sku'               => $this->sku,
            'thumbnail'         => $this->resolveUrl($this->thumbnail),
            'images'            => collect($this->images ?? [])->map(fn ($img) => $this->resolveUrl($img))->toArray(),
            'price'             => (float) $this->price,
            'original_price'    => $this->original_price ? (float) $this->original_price : null,
            'short_description' => $this->short_description,
            'description'       => $this->when($request->routeIs('*.show'), $this->description),
            'is_new'            => $this->is_new,
            'in_stock'          => $this->in_stock,
            'stock_qty'         => $this->stock_qty,
            'specs'             => $this->when($request->routeIs('*.show'), $this->specs),
            'tags'              => $this->tags,
            'rating'            => $this->rating,
            'review_count'      => $this->review_count,
            'category'          => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'brand' => $this->whenLoaded('brand', fn() => [
                'id'   => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
                'logo' => $this->brand->logo,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function resolveUrl(?string $path): ?string
    {
        if (! $path) return null;
        return str_starts_with($path, 'http') ? $path : Storage::url($path);
    }
}

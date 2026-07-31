<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'sku', 'thumbnail', 'images', 'price', 'original_price',
        'short_description', 'description', 'is_new', 'is_featured', 'in_stock',
        'stock_qty', 'category_id', 'brand_id', 'specs', 'tags',
        'rating', 'review_count', 'sales_count', 'is_active',
    ];

    protected $casts = [
        'images'         => 'array',
        'specs'          => 'array',
        'tags'           => 'array',
        'is_new'         => 'boolean',
        'is_featured'    => 'boolean',
        'in_stock'       => 'boolean',
        'is_active'      => 'boolean',
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function brand()    { return $this->belongsTo(Brand::class); }

    public function scopeActive($query)   { return $query->where('is_active', true); }
    public function scopeFeatured($query) { return $query->where('is_featured', true); }
}

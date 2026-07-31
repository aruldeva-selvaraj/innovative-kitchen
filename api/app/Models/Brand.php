<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'logo', 'description', 'is_featured', 'sort_order'];

    protected $casts = ['is_featured' => 'boolean'];

    public function products() { return $this->hasMany(Product::class); }
}

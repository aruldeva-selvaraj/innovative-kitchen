<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_ref',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_company',
        'delivery_address',
        'city',
        'notes',
        'items',
        'subtotal',
        'status',
    ];

    protected $casts = [
        'items'    => 'array',
        'subtotal' => 'decimal:2',
    ];
}

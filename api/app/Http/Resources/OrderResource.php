<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'reference'        => $this->reference,
            'status'           => $this->status,
            'total'            => (float) $this->total,
            'items_count'      => $this->whenCounted('items', $this->items_count),
            'shipping_name'    => $this->shipping_name,
            'shipping_phone'   => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'shipping_city'    => $this->shipping_city,
            'notes'            => $this->notes,
            'items'            => $this->whenLoaded('items', fn() =>
                $this->items->map(fn($item) => [
                    'id'           => $item->id,
                    'product_name' => $item->product_name,
                    'quantity'     => $item->quantity,
                    'price'        => (float) $item->price,
                    'subtotal'     => (float) ($item->price * $item->quantity),
                ])
            ),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}

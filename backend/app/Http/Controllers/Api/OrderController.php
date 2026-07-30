<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->withCount('items')->latest()->get();
        return OrderResource::collection($orders);
    }

    public function show(Request $request, int $id)
    {
        $order = $request->user()->orders()->with('items.product')->findOrFail($id);
        return new OrderResource($order);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'shipping_name'    => 'required|string',
            'shipping_phone'   => 'required|string',
            'shipping_address' => 'required|string',
            'shipping_city'    => 'required|string',
            'notes'            => 'nullable|string',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        $total = $cart->items->sum(fn($i) => $i->price * $i->quantity);

        $order = Order::create([
            'user_id'          => $request->user()->id,
            'reference'        => 'ORD-' . strtoupper(Str::random(8)),
            'status'           => 'pending',
            'total'            => $total,
            'shipping_name'    => $data['shipping_name'],
            'shipping_phone'   => $data['shipping_phone'],
            'shipping_address' => $data['shipping_address'],
            'shipping_city'    => $data['shipping_city'],
            'notes'            => $data['notes'] ?? null,
        ]);

        foreach ($cart->items as $item) {
            $order->items()->create([
                'product_id'   => $item->product_id,
                'product_name' => $item->product->name,
                'quantity'     => $item->quantity,
                'price'        => $item->price,
            ]);
        }

        $cart->items()->delete();

        return new OrderResource($order->load('items'));
    }
}

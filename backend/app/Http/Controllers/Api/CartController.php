<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getOrCreateCart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        return response()->json($cart->load('items.product'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->where('product_id', $data['product_id'])->first();

        if ($item) {
            $item->increment('quantity', $data['quantity']);
        } else {
            $product = Product::findOrFail($data['product_id']);
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $data['quantity'],
                'price'      => $product->price,
            ]);
        }

        return response()->json($cart->fresh('items.product'));
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);
        $item = CartItem::findOrFail($id);
        $item->update(['quantity' => $data['quantity']]);
        return response()->json($item);
    }

    public function destroy(int $id)
    {
        CartItem::findOrFail($id)->delete();
        return response()->json(['message' => 'Removed']);
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}

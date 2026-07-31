<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CartController extends Controller
{
    private function getOrCreateCart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        return response()->json($cart->load('items.product'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity'   => 'required|integer|min:1|max:100',
        ]);

        $cart = $this->getOrCreateCart($request);
        $item = $cart->items()->where('product_id', $data['product_id'])->first();

        if ($item) {
            $newQty = $item->quantity + $data['quantity'];
            $item->update(['quantity' => min($newQty, 100)]);
        } else {
            $product = Product::active()->findOrFail($data['product_id']);
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $data['quantity'],
                'price'      => $product->price,
            ]);
        }

        return response()->json($cart->fresh('items.product'));
    }

    /**
     * OWASP A01 — Broken Access Control
     * Verify the item belongs to the authenticated user's cart before modifying.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1|max:100']);

        $item = $this->ownedItem($request, $id);
        $item->update(['quantity' => $data['quantity']]);

        return response()->json($item);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->ownedItem($request, $id)->delete();
        return response()->json(['message' => 'Removed']);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->getOrCreateCart($request)->items()->delete();
        return response()->json(['message' => 'Cart cleared']);
    }

    /**
     * Return the cart item only if it belongs to the requesting user's cart.
     * Returns 403 if the item exists but belongs to a different user (IDOR prevention).
     */
    private function ownedItem(Request $request, int $itemId): CartItem
    {
        $item = CartItem::findOrFail($itemId);

        if ($item->cart->user_id !== $request->user()->id) {
            abort(Response::HTTP_FORBIDDEN, 'Access denied.');
        }

        return $item;
    }
}

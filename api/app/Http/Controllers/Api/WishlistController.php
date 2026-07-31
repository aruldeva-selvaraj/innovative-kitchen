<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    private function getOrCreateWishlist(Request $request): Wishlist
    {
        return Wishlist::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request)
    {
        $wishlist = $this->getOrCreateWishlist($request);
        return response()->json($wishlist->load('items.product'));
    }

    public function toggle(Request $request)
    {
        $data = $request->validate(['product_id' => 'required|exists:products,id']);
        $wishlist = $this->getOrCreateWishlist($request);
        $item = $wishlist->items()->where('product_id', $data['product_id'])->first();

        if ($item) {
            $item->delete();
            return response()->json(['action' => 'removed']);
        }

        $wishlist->items()->create(['product_id' => $data['product_id']]);
        return response()->json(['action' => 'added']);
    }

    public function destroy(int $id)
    {
        WishlistItem::findOrFail($id)->delete();
        return response()->json(['message' => 'Removed']);
    }
}

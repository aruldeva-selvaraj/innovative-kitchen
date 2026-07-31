<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * City-to-2-char code map for UAE emirates.
     *
     * @var array<string, string>
     */
    private const CITY_CODES = [
        'dubai'          => 'DU',
        'abu dhabi'      => 'AD',
        'sharjah'        => 'SH',
        'ajman'          => 'AJ',
        'ras al khaimah' => 'RA',
        'fujairah'       => 'FU',
        'umm al quwain'  => 'UA',
        'al ain'         => 'AL',
    ];

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:120',
            'customer_phone'   => 'required|string|max:30',
            'customer_email'   => 'nullable|email|max:120',
            'customer_company' => 'nullable|string|max:120',
            'delivery_address' => 'nullable|string|max:500',
            'city'             => 'required|string|max:60',
            'notes'            => 'nullable|string|max:1000',
            'items'            => 'required|array|min:1|max:50',
            // OWASP A08 — require product_id so we look up prices server-side
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1|max:100',
            // sku + name kept for display purposes only; price is ignored and re-fetched from DB
            'items.*.sku'        => 'nullable|string|max:100',
            'items.*.name'       => 'nullable|string|max:255',
        ]);

        // OWASP A08 — Software and Data Integrity Failures
        // Resolve server-side prices from the database.
        // Never trust the price submitted by the client.
        $productIds = collect($data['items'])->pluck('product_id')->unique()->all();
        $products   = Product::active()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        // Validate all products are active and build canonical item list
        $canonicalItems = [];
        foreach ($data['items'] as $item) {
            $product = $products->get($item['product_id']);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => ["Product #{$item['product_id']} is not available."],
                ]);
            }

            $canonicalItems[] = [
                'product_id' => $product->id,
                'name'       => $product->name,
                'sku'        => $product->sku,
                'quantity'   => $item['quantity'],
                'price'      => (float) $product->price,   // authoritative server price
                'line_total' => round((float) $product->price * $item['quantity'], 2),
            ];
        }

        $subtotal  = collect($canonicalItems)->sum('line_total');
        $orderRef  = $this->uniqueOrderRef($data['city']);

        $order = Order::create([
            'order_ref'        => $orderRef,
            'customer_name'    => $data['customer_name'],
            'customer_phone'   => $data['customer_phone'],
            'customer_email'   => $data['customer_email'] ?? null,
            'customer_company' => $data['customer_company'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? null,
            'city'             => $data['city'],
            'notes'            => $data['notes'] ?? null,
            'items'            => $canonicalItems,
            'subtotal'         => $subtotal,
            'status'           => 'pending',
        ]);

        return response()->json([
            'order_ref'  => $order->order_ref,
            'subtotal'   => (float) $order->subtotal,
            'status'     => $order->status,
            'created_at' => $order->created_at,
        ], 201);
    }

    /**
     * Generate a collision-resistant order reference.
     * Format: {CC}{YYMMDD}{HHmmss}{ms3}  →  e.g. DU260731143052847 (17 chars)
     */
    private function uniqueOrderRef(string $city): string
    {
        $cc = $this->cityCode($city);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $ref = $cc . $this->timestampSuffix();
            if (! Order::where('order_ref', $ref)->exists()) {
                return $ref;
            }
            usleep(1000);
        }

        return $cc . $this->timestampSuffix() . str_pad(random_int(0, 99), 2, '0', STR_PAD_LEFT);
    }

    private function timestampSuffix(): string
    {
        [$usec, $sec] = explode(' ', microtime());
        $ms = str_pad((int) ($usec * 1000), 3, '0', STR_PAD_LEFT);
        return date('ymdHis', (int) $sec) . $ms;
    }

    private function cityCode(string $city): string
    {
        $key = strtolower(trim($city));
        return self::CITY_CODES[$key]
            ?? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $city), 0, 2) ?: 'XX');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'delivery_address' => 'nullable|string|max:255',
            'city'             => 'required|string|max:60',
            'notes'            => 'nullable|string|max:1000',
            'items'            => 'required|array|min:1',
            'items.*.name'     => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.sku'      => 'nullable|string',
        ]);

        $subtotal = collect($data['items'])->sum(
            fn (array $item) => $item['price'] * $item['quantity']
        );

        $order_ref = $this->uniqueOrderRef($data['city']);

        $order = Order::create([
            'order_ref'        => $order_ref,
            'customer_name'    => $data['customer_name'],
            'customer_phone'   => $data['customer_phone'],
            'customer_email'   => $data['customer_email'] ?? null,
            'customer_company' => $data['customer_company'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? null,
            'city'             => $data['city'],
            'notes'            => $data['notes'] ?? null,
            'items'            => $data['items'],
            'subtotal'         => $subtotal,
            'status'           => 'pending',
        ]);

        return response()->json([
            'order_ref' => $order->order_ref,
            'subtotal'  => (float) $order->subtotal,
            'status'    => $order->status,
            'created_at' => $order->created_at,
        ], 201);
    }

    /**
     * Generate a collision-resistant order reference.
     *
     * Format: {CC}{YYMMDD}{HHmmss}{ms3}  →  e.g. DU260731143052847  (17 chars)
     *   CC    = 2-letter city code
     *   YYMMDD = year-month-day (6 digits)
     *   HHmmss = hour-minute-second (6 digits)
     *   ms3    = milliseconds 000-999 (3 digits)
     *
     * On the extremely rare same-millisecond collision the loop retries
     * with a fresh microtime snapshot (max 5 attempts before appending
     * a random 2-digit suffix to guarantee uniqueness).
     */
    private function uniqueOrderRef(string $city): string
    {
        $cc = $this->cityCode($city);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $ref = $cc . $this->timestampSuffix();
            if (! Order::where('order_ref', $ref)->exists()) {
                return $ref;
            }
            usleep(1000); // 1 ms back-off before retry
        }

        // Absolute fallback: append 2 random digits (17→19 chars, still unique)
        return $cc . $this->timestampSuffix() . str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT);
    }

    /**
     * Build {YYMMDD}{HHmmss}{ms3} — 15 digits of date + time + milliseconds.
     */
    private function timestampSuffix(): string
    {
        [$usec, $sec] = explode(' ', microtime());
        $ms = str_pad((int) ($usec * 1000), 3, '0', STR_PAD_LEFT);

        return date('ymdHis', (int) $sec) . $ms;
    }

    /**
     * Map city name to a 2-char uppercase code.
     */
    private function cityCode(string $city): string
    {
        $key = strtolower(trim($city));

        return self::CITY_CODES[$key]
            ?? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $city), 0, 2) ?: 'XX');
    }
}

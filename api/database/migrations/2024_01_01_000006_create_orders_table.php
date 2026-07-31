<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_ref', 20)->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('customer_company')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('city');
            $table->text('notes')->nullable();
            $table->jsonb('items');
            $table->decimal('subtotal', 10, 2);
            $table->enum('status', ['pending', 'processing', 'confirmed', 'delivered', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

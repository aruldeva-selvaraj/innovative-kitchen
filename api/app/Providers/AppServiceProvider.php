<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * OWASP A07 — Identification and Authentication Failures
     * OWASP A04 — Insecure Design
     *
     * Define named rate limiters used in routes/api.php.
     * Responses automatically get Retry-After + X-RateLimit-* headers.
     */
    private function configureRateLimiting(): void
    {
        // Login / register — strict limit to prevent brute-force
        // 5 attempts per minute per IP, then lock for 1 minute
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Public order placement — prevent spam/flood
        RateLimiter::for('orders', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perDay(50)->by($request->ip()),
            ];
        });

        // Contact form — prevent email spam
        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Public search / product listing — prevent scraping
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        // Authenticated API — generous but bounded
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(200)->by(
                optional($request->user())->id ?: $request->ip()
            );
        });
    }
}

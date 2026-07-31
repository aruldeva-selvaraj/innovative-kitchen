<?php

return [

    /*
     * Paths that should have CORS headers. The api/* pattern covers all
     * API routes; sanctum/csrf-cookie is needed if you add cookie-based auth.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * In production, set FRONTEND_URL in .env to your deployed Angular domain.
     * e.g. FRONTEND_URL=https://your-shop.ae
     */
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:4200')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Set to true only if you use cookie-based Sanctum auth (withCredentials).
     * Keep false for the current token-less / localStorage-cart setup.
     */
    'supports_credentials' => false,

];

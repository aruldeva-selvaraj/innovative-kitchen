<?php

/**
 * OWASP A05 — Security Misconfiguration: CORS
 *
 * Never use ['*'] for allowed_methods or allowed_headers in production.
 * Wildcard origins are already restricted to FRONTEND_URL below.
 */
return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Only the HTTP methods our API actually uses
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
     * Production: set FRONTEND_URL=https://www.innovativekitchen.ae in .env
     * Development: defaults to http://localhost:4200
     * Never use '*' here — that would allow any site to call your API with
     * the user's credentials.
     */
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:4200')],

    'allowed_origins_patterns' => [],

    // Only the headers our Angular app actually sends
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-XSRF-TOKEN',
    ],

    // Expose pagination headers to the frontend if needed
    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'Retry-After',
    ],

    // Cache pre-flight results for 2 hours
    'max_age' => 7200,

    /*
     * Keep false unless you switch to cookie-based Sanctum auth.
     * True + wildcard origin = the most dangerous CORS combination.
     */
    'supports_credentials' => false,

];

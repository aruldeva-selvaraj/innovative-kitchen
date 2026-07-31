<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * OWASP A05 — Security Misconfiguration
 *
 * Adds hardened HTTP response headers to every response.
 * These are the single most impactful one-line defences against:
 *   - Clickjacking          (X-Frame-Options, CSP frame-ancestors)
 *   - MIME sniffing attacks (X-Content-Type-Options)
 *   - XSS (legacy browsers) (X-XSS-Protection)
 *   - Information leakage   (Referrer-Policy)
 *   - Protocol downgrade    (Strict-Transport-Security)
 *   - Excessive permissions (Permissions-Policy)
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Prevent clickjacking — same origin only
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME-type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Legacy XSS filter (Chrome removed it, but IE/Edge still honour it)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Limit referrer info sent to third-party sites
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Force HTTPS for 1 year (only effective in production with TLS)
        if (app()->isProduction()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Disable browser features that are not needed
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
        );

        // Basic Content-Security-Policy
        // Tighten script-src / style-src once you know all CDN origins
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        // Remove server fingerprinting headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}

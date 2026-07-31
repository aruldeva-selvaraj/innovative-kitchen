<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // OWASP A05 — Security headers on every response
        $middleware->append(SecurityHeaders::class);

        // Prevent host-header injection attacks on generated URLs
        $middleware->trustHosts(at: ['TRUSTED_HOSTS']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for all API errors — never leak HTML stack traces
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Sanitise exception output in production
        $exceptions->dontFlash([
            'current_password',
            'password',
            'password_confirmation',
        ]);
    })->create();

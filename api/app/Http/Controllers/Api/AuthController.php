<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * OWASP A07 — Identification and Authentication Failures
     *
     * Register enforces a strong password policy:
     *   - Minimum 8 characters
     *   - At least one uppercase letter
     *   - At least one lowercase letter
     *   - At least one digit
     *   - At least one special character
     *   - Not a known compromised password (mixedCase/symbols/numbers checked
     *     against common patterns by Laravel's Password rule)
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email:rfc,dns|max:255|unique:users,email',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            'phone'    => 'nullable|string|max:20|regex:/^[+\d\s\-()]{7,20}$/',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'phone'    => $data['phone'] ?? null,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $this->safeUser($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login with generic error message on failure to prevent user enumeration
     * (OWASP A07 — don't reveal whether email or password was wrong).
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        $user = User::where('email', $data['email'])->first();

        // Use a constant-time comparison to prevent timing attacks
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        // Prune old tokens before issuing a new one (keep at most 5 active tokens)
        $existing = $user->tokens()->latest()->get();
        if ($existing->count() >= 5) {
            $user->tokens()->oldest()->limit($existing->count() - 4)->delete();
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $this->safeUser($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout — invalidate the current device's token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Logout from all devices — revoke every Sanctum token for this user.
     * OWASP A07 — allow users to terminate all sessions after a compromise.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out from all devices.']);
    }

    /**
     * Return the currently authenticated user.
     * OWASP A01 — only expose fields the client needs.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->safeUser($request->user()));
    }

    /**
     * Return only safe fields — never expose password, remember_token, etc.
     *
     * @return array<string, mixed>
     */
    private function safeUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
        ];
    }
}

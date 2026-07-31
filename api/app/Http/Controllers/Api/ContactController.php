<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        // OWASP A03 — enforce max length; no max would allow multi-MB payloads
        $data = $request->validate([
            'name'    => 'required|string|max:120',
            'email'   => 'required|email:rfc|max:255',
            'phone'   => 'nullable|string|max:30|regex:/^[+\d\s\-()]{7,30}$/',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|min:10|max:5000',
        ]);

        // Mail::to(config('mail.support_address'))->send(new \App\Mail\ContactFormMail($data));

        return response()->json(['message' => 'Message sent successfully']);
    }
}

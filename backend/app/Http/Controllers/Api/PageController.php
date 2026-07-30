<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;

class PageController extends Controller
{
    public function show(string $page)
    {
        $record = Page::where('slug', $page)->firstOrFail();
        return response()->json(['content' => $record->content]);
    }
}

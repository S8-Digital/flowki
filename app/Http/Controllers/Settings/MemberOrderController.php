<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MemberOrderController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_order' => ['present', 'array'],
            'member_order.*' => ['integer'],
        ]);

        $family = $request->user()->family()->firstOrFail();

        $this->authorize('update', $family);

        $settings = $family->settings ?? [];
        $settings['member_order'] = $validated['member_order'];
        $family->update(['settings' => $settings]);

        return back()->with('status', 'member-order-updated');
    }
}

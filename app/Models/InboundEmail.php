<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InboundEmail extends Model
{
    protected $fillable = [
        'user_id',
        'from',
        'subject',
        'body_text',
        'body_html',
        'raw',
        'has_calendar',
        'attachments',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'has_calendar' => 'boolean',
            'attachments' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

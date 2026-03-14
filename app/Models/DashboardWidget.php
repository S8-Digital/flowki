<?php

namespace App\Models;

use App\Enums\DashboardWidgetType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardWidget extends Model
{
    protected $fillable = ['user_id', 'type', 'position', 'settings'];

    protected function casts(): array
    {
        return [
            'type' => DashboardWidgetType::class,
            'settings' => 'array',
            'position' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Kreait\Firebase\Contract\Database;

class SyncModelToRtdb implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string  $path   RTDB path, e.g. "families/1/todos/42"
     * @param  array<string, mixed>|null  $data   Null signals a delete (remove)
     */
    public function __construct(
        public readonly string $path,
        public readonly ?array $data,
    ) {}

    /**
     * Write or remove the node in Firebase Realtime Database.
     */
    public function handle(Database $database): void
    {
        $ref = $database->getReference($this->path);

        if ($this->data === null) {
            $ref->remove();
        } else {
            $ref->set($this->data);
        }
    }
}

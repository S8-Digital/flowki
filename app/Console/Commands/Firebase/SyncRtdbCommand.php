<?php

declare(strict_types=1);

namespace App\Console\Commands\Firebase;

use App\Jobs\SyncModelToRtdb;
use App\Models\Family;
use Illuminate\Console\Command;

class SyncRtdbCommand extends Command
{
    protected $signature = 'firebase:rtdb:sync
                            {--family= : Sync a single family by ID}
                            {--queue : Dispatch each record as a queued job instead of running inline}';

    protected $description = 'Bulk-mirror existing Postgres data to Firebase Realtime Database';

    public function handle(): int
    {
        $familyQuery = Family::query();

        if ($this->option('family')) {
            $familyQuery->where('id', $this->option('family'));
        }

        $families = $familyQuery->get();

        if ($families->isEmpty()) {
            $this->warn('No families found to sync.');

            return self::SUCCESS;
        }

        $useQueue = (bool) $this->option('queue');

        $this->info(sprintf('Syncing %d %s…', $families->count(), $families->count() === 1 ? 'family' : 'families'));

        $bar = $this->output->createProgressBar($families->count());
        $bar->start();

        foreach ($families as $family) {
            $this->syncFamily($family->id, $useQueue);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('✓ RTDB sync complete.');

        return self::SUCCESS;
    }

    private function syncFamily(int $familyId, bool $useQueue): void
    {
        $family = Family::with([
            'todos',
            'chores',
            'shoppingLists.items',
            'calendarEvents',
        ])->find($familyId);

        if (! $family) {
            return;
        }

        foreach ($family->todos as $todo) {
            $this->dispatch("families/{$familyId}/todos/{$todo->id}", $todo->toSyncArray(), $useQueue);
        }

        foreach ($family->chores as $chore) {
            $this->dispatch("families/{$familyId}/chores/{$chore->id}", $chore->toSyncArray(), $useQueue);
        }

        foreach ($family->shoppingLists as $list) {
            $this->dispatch("families/{$familyId}/shopping_lists/{$list->id}", $list->toSyncArray(), $useQueue);

            foreach ($list->items as $item) {
                $this->dispatch("families/{$familyId}/shopping_items/{$item->id}", $item->toSyncArray(), $useQueue);
            }
        }

        foreach ($family->calendarEvents as $event) {
            $this->dispatch("families/{$familyId}/events/{$event->id}", $event->toSyncArray(), $useQueue);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function dispatch(string $path, array $data, bool $useQueue): void
    {
        $job = new SyncModelToRtdb($path, $data);

        if ($useQueue) {
            dispatch($job);
        } else {
            dispatch_sync($job);
        }
    }
}

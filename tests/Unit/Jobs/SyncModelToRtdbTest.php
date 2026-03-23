<?php

namespace Tests\Unit\Jobs;

use App\Jobs\SyncModelToRtdb;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncModelToRtdbTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_implements_should_queue(): void
    {
        $job = new SyncModelToRtdb('families/1/todos/1', []);

        $this->assertInstanceOf(ShouldQueue::class, $job);
    }

    public function test_job_stores_path_and_data(): void
    {
        $data = ['id' => 5, 'name' => 'Eggs', 'updated_at' => '2024-01-01T00:00:00+00:00'];

        $job = new SyncModelToRtdb('families/2/shopping_items/5', $data);

        $this->assertSame('families/2/shopping_items/5', $job->path);
        $this->assertSame($data, $job->data);
    }

    public function test_job_stores_null_data_for_deletes(): void
    {
        $job = new SyncModelToRtdb('families/3/chores/9', null);

        $this->assertNull($job->data);
        $this->assertSame('families/3/chores/9', $job->path);
    }

    public function test_job_path_can_be_any_rtdb_path(): void
    {
        $paths = [
            'families/1/todos/10',
            'families/1/chores/20',
            'families/1/shopping_items/30',
            'families/1/shopping_lists/40',
            'families/1/events/50',
        ];

        foreach ($paths as $path) {
            $job = new SyncModelToRtdb($path, null);
            $this->assertSame($path, $job->path);
        }
    }
}

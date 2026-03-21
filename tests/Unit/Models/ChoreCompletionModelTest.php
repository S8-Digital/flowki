<?php

namespace Tests\Unit\Models;

use App\Models\Chore;
use App\Models\ChoreCompletion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ChoreCompletionModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_chore_relationship_returns_chore(): void
    {
        $chore = Chore::factory()->create();
        $completion = ChoreCompletion::factory()->create(['chore_id' => $chore->id]);

        $this->assertInstanceOf(Chore::class, $completion->chore);
        $this->assertEquals($chore->id, $completion->chore->id);
    }

    public function test_completed_by_relationship_returns_user(): void
    {
        $user = User::factory()->create();
        $completion = ChoreCompletion::factory()->create(['completed_by' => $user->id]);

        $this->assertInstanceOf(User::class, $completion->completedBy);
        $this->assertEquals($user->id, $completion->completedBy->id);
    }

    public function test_completed_at_is_cast_to_datetime(): void
    {
        $completion = ChoreCompletion::factory()->create([
            'completed_at' => '2025-06-15 10:00:00',
        ]);

        $this->assertInstanceOf(Carbon::class, $completion->completed_at);
    }

    public function test_can_create_completion_with_notes(): void
    {
        $completion = ChoreCompletion::factory()->create(['notes' => 'Done with extra care']);

        $this->assertEquals('Done with extra care', $completion->notes);
    }

    public function test_fillable_fields_are_accepted(): void
    {
        $chore = Chore::factory()->create();
        $user = User::factory()->create();

        $completion = ChoreCompletion::create([
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
            'completed_at' => now(),
            'notes' => 'Test note',
        ]);

        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
            'notes' => 'Test note',
        ]);
    }
}

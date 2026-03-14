<?php

namespace Tests\Unit\Models;

use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\Family;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChoreModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_chore_belongs_to_family(): void
    {
        $chore = Chore::factory()->create();
        $this->assertInstanceOf(Family::class, $chore->family);
    }

    public function test_chore_belongs_to_creator(): void
    {
        $chore = Chore::factory()->create();
        $this->assertInstanceOf(User::class, $chore->creator);
    }

    public function test_chore_has_many_assignees(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $chore = Chore::factory()->create(['family_id' => $user->family_id]);
        $chore->assignees()->attach($member->id);

        $this->assertCount(1, $chore->fresh()->assignees);
    }

    public function test_casts_frequency_to_enum(): void
    {
        $chore = Chore::factory()->create(['frequency' => ChoreFrequency::Weekly]);
        $this->assertInstanceOf(ChoreFrequency::class, $chore->fresh()->frequency);
    }

    public function test_scope_for_family(): void
    {
        $familyA = Family::factory()->create();
        $familyB = Family::factory()->create();
        Chore::factory()->count(3)->create(['family_id' => $familyA->id]);
        Chore::factory()->create(['family_id' => $familyB->id]);

        $results = Chore::query()->forFamily($familyA->id)->get();
        $this->assertCount(3, $results);
    }

    public function test_scope_due_today(): void
    {
        $chore = Chore::factory()->create(['next_due_date' => today()]);
        Chore::factory()->create(['next_due_date' => today()->addDay()]);

        $results = Chore::query()->dueToday()->get();
        $this->assertCount(1, $results);
        $this->assertEquals($chore->id, $results->first()->id);
    }

    public function test_scope_search_matches_title(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->create(['family_id' => $user->family_id, 'title' => 'Vacuum floors']);
        Chore::factory()->create(['family_id' => $user->family_id, 'title' => 'Wash dishes']);

        $results = Chore::query()->forFamily($user->family_id)->search('vacuum')->get();
        $this->assertCount(1, $results);
    }
}

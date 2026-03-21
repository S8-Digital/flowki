<?php

namespace Tests\Unit\Enums;

use App\Enums\FamilyRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_label_returns_correct_value_for_admin(): void
    {
        $this->assertEquals('Admin', FamilyRole::Admin->label());
    }

    public function test_label_returns_correct_value_for_member(): void
    {
        $this->assertEquals('Member', FamilyRole::Member->label());
    }

    public function test_label_returns_correct_value_for_guest(): void
    {
        $this->assertEquals('Guest', FamilyRole::Guest->label());
    }

    public function test_label_returns_correct_value_for_child(): void
    {
        $this->assertEquals('Child', FamilyRole::Child->label());
    }

    public function test_is_admin_returns_true_for_admin(): void
    {
        $this->assertTrue(FamilyRole::Admin->isAdmin());
    }

    public function test_is_admin_returns_false_for_member(): void
    {
        $this->assertFalse(FamilyRole::Member->isAdmin());
    }

    public function test_is_admin_returns_false_for_guest(): void
    {
        $this->assertFalse(FamilyRole::Guest->isAdmin());
    }

    public function test_is_admin_returns_false_for_child(): void
    {
        $this->assertFalse(FamilyRole::Child->isAdmin());
    }

    public function test_can_login_returns_true_for_admin(): void
    {
        $this->assertTrue(FamilyRole::Admin->canLogin());
    }

    public function test_can_login_returns_true_for_member(): void
    {
        $this->assertTrue(FamilyRole::Member->canLogin());
    }

    public function test_can_login_returns_true_for_guest(): void
    {
        $this->assertTrue(FamilyRole::Guest->canLogin());
    }

    public function test_can_login_returns_false_for_child(): void
    {
        $this->assertFalse(FamilyRole::Child->canLogin());
    }
}

<?php

namespace Tests\Unit\Services;

use App\Services\RosterParserService;
use Tests\TestCase;

class RosterParserServiceTest extends TestCase
{
    private RosterParserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RosterParserService;
    }

    // -----------------------------------------------------------------------
    // parseText – happy paths
    // -----------------------------------------------------------------------

    public function test_parses_iso_date_with_time_range(): void
    {
        $shifts = $this->service->parseText('2026-03-17 07:00-15:00 Morning Shift');

        $this->assertCount(1, $shifts);
        $this->assertEquals('Morning Shift', $shifts[0]['title']);
        $this->assertEquals('2026-03-17T07:00:00', $shifts[0]['start_at']);
        $this->assertEquals('2026-03-17T15:00:00', $shifts[0]['end_at']);
        $this->assertFalse($shifts[0]['is_all_day']);
    }

    public function test_parses_dd_mm_yyyy_date_format(): void
    {
        $shifts = $this->service->parseText('17/03/2026 Night Shift 22:00-06:00');

        $this->assertCount(1, $shifts);
        $this->assertEquals('Night Shift', $shifts[0]['title']);
        $this->assertEquals('2026-03-17', substr($shifts[0]['start_at'], 0, 10));
    }

    public function test_handles_overnight_shift(): void
    {
        $shifts = $this->service->parseText('2026-03-17 22:00-06:00 Night');

        $this->assertCount(1, $shifts);
        // end_at should be the next day
        $this->assertEquals('2026-03-18T06:00:00', $shifts[0]['end_at']);
    }

    public function test_parses_named_month_format(): void
    {
        $shifts = $this->service->parseText('17 Mar 2026 08:00-16:00 Day Shift');

        $this->assertCount(1, $shifts);
        $this->assertEquals('2026-03-17', substr($shifts[0]['start_at'], 0, 10));
        $this->assertEquals('Day Shift', $shifts[0]['title']);
    }

    public function test_parses_month_day_year_format(): void
    {
        $shifts = $this->service->parseText('March 17, 2026 09:00-17:30 Admin');

        $this->assertCount(1, $shifts);
        $this->assertEquals('2026-03-17', substr($shifts[0]['start_at'], 0, 10));
        $this->assertEquals('Admin', $shifts[0]['title']);
    }

    public function test_parses_all_day_shift_when_no_time(): void
    {
        $shifts = $this->service->parseText('2026-03-20 REST DAY');

        $this->assertCount(1, $shifts);
        $this->assertTrue($shifts[0]['is_all_day']);
        $this->assertNull($shifts[0]['end_at']);
    }

    public function test_parses_multiple_lines(): void
    {
        $content = <<<'TXT'
        2026-03-17 07:00-15:00 Morning Shift
        2026-03-18 15:00-23:00 Afternoon Shift
        2026-03-19 REST
        TXT;

        $shifts = $this->service->parseText($content);

        $this->assertCount(3, $shifts);
    }

    public function test_skips_blank_lines_and_comments(): void
    {
        $content = <<<'TXT'

        # This is a comment
        2026-03-17 07:00-15:00 Morning Shift

        // Another comment
        TXT;

        $shifts = $this->service->parseText($content);

        $this->assertCount(1, $shifts);
    }

    public function test_returns_empty_for_lines_without_dates(): void
    {
        $shifts = $this->service->parseText('This line has no date or time at all');

        $this->assertCount(0, $shifts);
    }

    // -----------------------------------------------------------------------
    // parseLine – edge cases
    // -----------------------------------------------------------------------

    public function test_parse_line_with_day_name_prefix(): void
    {
        $shift = $this->service->parseLine('Mon 17 Mar 2026 07:00-15:00 AM Shift');

        $this->assertNotNull($shift);
        $this->assertEquals('2026-03-17', substr($shift['start_at'], 0, 10));
        $this->assertStringContainsString('AM Shift', $shift['title']);
    }

    public function test_parse_line_returns_null_for_no_date(): void
    {
        $this->assertNull($this->service->parseLine('No date information here'));
    }

    public function test_parse_line_returns_null_for_empty_string(): void
    {
        $this->assertNull($this->service->parseLine(''));
    }

    public function test_parse_line_with_single_time_only(): void
    {
        $shift = $this->service->parseLine('2026-03-17 07:00 Shift Start');

        $this->assertNotNull($shift);
        $this->assertEquals('2026-03-17T07:00:00', $shift['start_at']);
        $this->assertNull($shift['end_at']);
        $this->assertFalse($shift['is_all_day']);
    }

    // -----------------------------------------------------------------------
    // Roster-style multi-line schedule
    // -----------------------------------------------------------------------

    public function test_parses_typical_roster_block(): void
    {
        $roster = <<<'TXT'
        Mon 17/03/2026 07:00-15:00 Early Shift
        Tue 18/03/2026 15:00-23:00 Late Shift
        Wed 19/03/2026 OFF
        Thu 20/03/2026 07:00-15:00 Early Shift
        TXT;

        $shifts = $this->service->parseText($roster);

        $this->assertCount(4, $shifts);
        $this->assertEquals('Early Shift', $shifts[0]['title']);
        $this->assertEquals('Late Shift', $shifts[1]['title']);
        $this->assertEquals('OFF', $shifts[2]['title']);
        $this->assertTrue($shifts[2]['is_all_day']);
    }
}

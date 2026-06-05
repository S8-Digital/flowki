<?php

declare(strict_types=1);

namespace App\Traits;

trait StripsMdFences
{
    /**
     * Strip markdown code fences that some AI models wrap JSON responses in.
     */
    protected function stripJsonFences(string $raw): string
    {
        $stripped = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));

        return (string) preg_replace('/\s*```$/', '', $stripped);
    }
}

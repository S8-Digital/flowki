<?php

namespace App\Ai\Concerns;

trait ValidatesRemoteUrl
{
    /**
     * Returns true if the IP is private, loopback, link-local, or otherwise reserved.
     * An unresolvable value is treated as private to fail safe.
     */
    protected function isPrivateIp(string $ip): bool
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP)) {
            return true; // Cannot parse — block it
        }

        return ! filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        );
    }
}

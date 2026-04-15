import { useEffect, useState } from 'react';
import type { WeatherData } from '@/types';
import { index } from '@/actions/App/Http/Controllers/WeatherController';

interface UseWeatherOptions {
    lat?: number | null;
    lng?: number | null;
    location?: string | null;
    /** Set to false to skip fetching (e.g. when dialog is closed). Defaults to true. */
    enabled?: boolean;
}

interface UseWeatherResult {
    data: WeatherData | null;
    loading: boolean;
}

/**
 * Fetches weather data for the authenticated user's family location, or for an
 * ad-hoc location when `lat`, `lng`, and `location` options are provided.
 *
 * Returns `{ data: null, loading: false }` when disabled, no location is configured,
 * the API key is absent, or the upstream request fails (graceful degradation).
 */
export function useWeather(options?: UseWeatherOptions): UseWeatherResult {
    const { enabled = true } = options ?? {};

    // Normalise undefined → null so the effect dependency array stays stable
    // and React's Object.is comparison works reliably.
    const lat = options?.lat ?? null;
    const lng = options?.lng ?? null;
    const location = options?.location ?? null;

    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(enabled);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);

            return;
        }

        let cancelled = false;

        setLoading(true);

        // Build the URL as a relative path – fetch() resolves it against the
        // current origin automatically, so window.location.origin is not needed
        // and cannot throw inside the effect.
        const params = new URLSearchParams();

        if (lat !== null && lng !== null && location !== null) {
            params.set('lat', String(lat));
            params.set('lng', String(lng));
            params.set('location', location);
        }

        const paramString = params.toString();
        const fetchUrl = index.url() + (paramString ? `?${paramString}` : '');

        fetch(fetchUrl, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => {
                if (res.status === 204) {
                    return null;
                }

                if (!res.ok) {
                    throw new Error(`Weather fetch failed: ${res.status}`);
                }

                return res.json() as Promise<WeatherData>;
            })
            .then((json) => {
                if (!cancelled) {
                    setData(json);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    console.error('[useWeather]', err);
                    setData(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, lat, lng, location]);

    return { data, loading };
}

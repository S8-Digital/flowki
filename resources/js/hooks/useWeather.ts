import { useEffect, useState } from 'react';
import { index } from '@/actions/App/Http/Controllers/WeatherController';
import type { WeatherData } from '@/types';

interface UseWeatherResult {
    data: WeatherData | null;
    loading: boolean;
}

/**
 * Fetches weather data for the authenticated user's family location.
 *
 * Returns `{ data: null, loading: false }` when no location is configured,
 * the API key is absent, or the upstream request fails (graceful degradation).
 */
export function useWeather(): UseWeatherResult {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);

        fetch(index().url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => {
                if (!res.ok || res.status === 204) {
                    return null;
                }

                return res.json() as Promise<WeatherData>;
            })
            .then((json) => {
                if (!cancelled) {
                    setData(json);
                }
            })
            .catch(() => {
                // Silently swallow – graceful degradation
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { data, loading };
}

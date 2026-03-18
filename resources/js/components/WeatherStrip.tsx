import { useWeather } from '@/hooks/useWeather';
import Box from '@mui/material/Box';

function weatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}.png`;
}

/**
 * A compact weather strip shown at the top of date-based calendar views.
 * Silently renders nothing when weather data is unavailable.
 */
export default function WeatherStrip() {
    const { data, loading } = useWeather();

    if (loading || !data) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'var(--border)',
                bgcolor: 'var(--card)',
                px: 1.5,
                py: 1,
                fontSize: '0.875rem',
                boxShadow: 1,
            }}
        >
            <img
                src={weatherIconUrl(data.current.icon)}
                alt={data.current.description}
                width={24}
                height={24}
                style={{ marginTop: -4, marginBottom: -4 }}
            />
            <Box component="span" sx={{ fontWeight: 600 }}>
                {data.current.temp}°C
            </Box>
            <Box component="span" sx={{ color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                {data.current.description}
            </Box>
            <Box component="span" sx={{ ml: 'auto', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                {data.location}
            </Box>
        </Box>
    );
}

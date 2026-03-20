import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useWeather } from '@/hooks/useWeather';

function weatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function formatDay(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function WeatherWidget() {
    const { data, loading } = useWeather();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={20} />
            </Box>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Current conditions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    component="img"
                    src={weatherIconUrl(data.current.icon)}
                    alt={data.current.description}
                    sx={{ width: 64, height: 64, mt: -1, mb: -1, ml: -1 }}
                />
                <Box>
                    <Typography sx={{ fontSize: '1.875rem', lineHeight: 1, fontWeight: 600 }}>{data.current.temp}°C</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: 'text.secondary', textTransform: 'capitalize' }}>
                        {data.current.description}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        Feels {data.current.feels_like}°C · Humidity {data.current.humidity}% · Wind {data.current.wind_speed} m/s
                    </Typography>
                </Box>
            </Box>

            {/* Location */}
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', color: 'text.secondary', textTransform: 'uppercase' }}>
                {data.location}
            </Typography>

            {/* 5-day forecast */}
            {data.forecast.length > 0 && (
                <Box
                    component="ul"
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 0.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 1.5,
                        m: 0,
                        pl: 0,
                        listStyle: 'none',
                    }}
                >
                    {data.forecast.map((day) => (
                        <Box
                            component="li"
                            key={day.date}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, textAlign: 'center' }}
                        >
                            <Typography component="span" sx={{ fontSize: '0.625rem', fontWeight: 500, color: 'text.secondary' }}>
                                {formatDay(day.date)}
                            </Typography>
                            <Box component="img" src={weatherIconUrl(day.icon)} alt={day.description} sx={{ width: 32, height: 32 }} />
                            <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                                <Typography component="span" sx={{ fontWeight: 500 }}>
                                    {day.temp_max}°
                                </Typography>
                                <Typography component="span" sx={{ color: 'text.secondary' }}>
                                    {' '}
                                    / {day.temp_min}°
                                </Typography>
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

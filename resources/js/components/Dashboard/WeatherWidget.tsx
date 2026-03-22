import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useWeather } from '@/hooks/useWeather';

const TempDisplay = styled(Typography)({
    fontSize: '1.875rem',
    lineHeight: 1,
    fontWeight: 600,
});

const ConditionText = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textTransform: 'capitalize',
}));

const FeelsLikeText = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const LocationLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
}));

interface ForecastGridProps {
    columns: number;
}

const ForecastGrid = styled('ul')<ForecastGridProps>(({ theme, columns }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1.5),
    margin: 0,
    paddingLeft: 0,
    listStyle: 'none',
}));

const ForecastDay = styled('span')(({ theme }) => ({
    fontSize: '0.625rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
}));

const TempRange = styled('span')({
    fontSize: '0.75rem',
});

const TempHigh = styled('span')({
    fontWeight: 500,
});

const TempLow = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

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
                {data.current.icon_url && (
                    <Box
                        component="img"
                        src={data.current.icon_url}
                        alt={data.current.description}
                        sx={{ width: 64, height: 64, mt: -1, mb: -1, ml: -1 }}
                    />
                )}
                <Box>
                    <TempDisplay>{data.current.temp}°C</TempDisplay>
                    <ConditionText sx={{ mt: 0.5 }}>{data.current.description}</ConditionText>
                    <FeelsLikeText>
                        Feels {data.current.feels_like}°C · Humidity {data.current.humidity}% · Wind {data.current.wind_speed} km/h
                    </FeelsLikeText>
                </Box>
            </Box>

            {/* Location */}
            <LocationLabel>{data.location}</LocationLabel>

            {/* 7-day forecast */}
            {data.forecast.length > 0 && (
                <ForecastGrid columns={Math.min(data.forecast.length, 7)}>
                    {data.forecast.slice(0, 7).map((day) => (
                        <Box
                            component="li"
                            key={day.date}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, textAlign: 'center' }}
                        >
                            <ForecastDay>{formatDay(day.date)}</ForecastDay>
                            {day.icon_url && <Box component="img" src={day.icon_url} alt={day.description} sx={{ width: 32, height: 32 }} />}
                            <TempRange>
                                <TempHigh>{day.temp_max}°</TempHigh>
                                <TempLow> / {day.temp_min}°</TempLow>
                            </TempRange>
                        </Box>
                    ))}
                </ForecastGrid>
            )}
        </Box>
    );
}

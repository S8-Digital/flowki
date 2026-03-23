import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import GoogleAddressAutocomplete from '@/components/GoogleAddressAutocomplete';
import type { PlaceResult } from '@/components/GoogleAddressAutocomplete';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWeather } from '@/hooks/useWeather';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultLocationName: string | null;
    defaultLat: number | null;
    defaultLng: number | null;
}

const WeatherEmptyText = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const CurrentTemp = styled(Typography)({
    fontSize: '2rem',
    lineHeight: 1,
    fontWeight: 700,
});

const CurrentDescription = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const CurrentDetails = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const ForecastGrid = styled('ul')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1.5),
    margin: 0,
    paddingLeft: 0,
    listStyle: 'none',
}));

const ForecastDayItem = styled('li')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
});

const ForecastDayLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.625rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
}));

const ForecastTempRange = styled(Typography)({
    fontSize: '0.75rem',
});

const ForecastTempHigh = styled(Typography)({
    fontWeight: 600,
});

const ForecastTempLow = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

function formatDay(dateStr: string): string {
    if (!dateStr) {
        return '';
    }

    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function ForecastSkeleton() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton variant="circular" width={56} height={56} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" height={36} />
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="80%" height={16} />
                </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Skeleton width={32} height={12} />
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton width={28} height={14} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

/**
 * Displays a 5-day weather forecast in a dialog.
 *
 * Defaults to the family's stored location; the user can type another location
 * using the Google Places autocomplete to temporarily preview a different forecast
 * without persisting the change.
 */
export default function WeatherForecastDialog({ open, onOpenChange, defaultLocationName, defaultLat, defaultLng }: Props) {
    const [locationName, setLocationName] = useState(defaultLocationName ?? '');
    const [lat, setLat] = useState<number | null>(defaultLat);
    const [lng, setLng] = useState<number | null>(defaultLng);

    // Reset to family defaults each time the dialog opens
    useEffect(() => {
        if (open) {
            setLocationName(defaultLocationName ?? '');
            setLat(defaultLat);
            setLng(defaultLng);
        }
    }, [open, defaultLocationName, defaultLat, defaultLng]);

    const hasCoords = lat !== null && lng !== null && locationName !== '';

    const { data, loading } = useWeather({
        lat: hasCoords ? lat : null,
        lng: hasCoords ? lng : null,
        location: hasCoords ? locationName : null,
        enabled: open && hasCoords,
    });

    function handlePlaceSelected(place: PlaceResult): void {
        setLocationName(place.address);
        setLat(place.latitude);
        setLng(place.longitude);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>5-Day Forecast</DialogTitle>
                </DialogHeader>

                {/* Location input */}
                <Box sx={{ mt: 1 }}>
                    <GoogleAddressAutocomplete
                        value={locationName}
                        onChange={setLocationName}
                        onPlaceSelected={handlePlaceSelected}
                        placeholder="Search for a location…"
                    />
                </Box>

                {/* Forecast content */}
                {loading ? (
                    <ForecastSkeleton />
                ) : !data ? (
                    <WeatherEmptyText sx={{ mt: 3 }}>
                        {hasCoords ? 'Weather data unavailable for this location.' : 'Select a location to view the forecast.'}
                    </WeatherEmptyText>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Current conditions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {data.current.icon_url && (
                                <Box
                                    component="img"
                                    src={data.current.icon_url}
                                    alt={data.current.description}
                                    sx={{ width: 56, height: 56, mt: -0.5, mb: -0.5, ml: -0.5 }}
                                />
                            )}
                            <Box>
                                <CurrentTemp>{data.current.temp}°C</CurrentTemp>
                                <CurrentDescription sx={{ mt: 0.25 }}>{data.current.description}</CurrentDescription>
                                <CurrentDetails>
                                    Feels {data.current.feels_like}°C · Humidity {data.current.humidity}% · Wind {data.current.wind_speed} km/h
                                </CurrentDetails>
                            </Box>
                        </Box>

                        {/* 5-day forecast grid */}
                        {data.forecast.length > 0 && (
                            <ForecastGrid sx={{ gridTemplateColumns: `repeat(${Math.min(data.forecast.length, 5)}, 1fr)` }}>
                                {data.forecast.slice(0, 5).map((day) => (
                                    <ForecastDayItem key={day.date}>
                                        <ForecastDayLabel component="span">{formatDay(day.date)}</ForecastDayLabel>
                                        {day.icon_url && (
                                            <Box component="img" src={day.icon_url} alt={day.description} sx={{ width: 28, height: 28 }} />
                                        )}
                                        <ForecastTempRange component="span">
                                            <ForecastTempHigh component="span">{day.temp_max}°</ForecastTempHigh>
                                            <ForecastTempLow component="span"> / {day.temp_min}°</ForecastTempLow>
                                        </ForecastTempRange>
                                    </ForecastDayItem>
                                ))}
                            </ForecastGrid>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

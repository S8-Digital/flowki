import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
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
 * Displays a 7-day weather forecast in a dialog.
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
                    <Typography sx={{ mt: 3, color: 'text.secondary', textAlign: 'center', fontSize: '0.875rem' }}>
                        {hasCoords ? 'Weather data unavailable for this location.' : 'Select a location to view the forecast.'}
                    </Typography>
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
                                <Typography sx={{ fontSize: '2rem', lineHeight: 1, fontWeight: 700 }}>{data.current.temp}°C</Typography>
                                <Typography sx={{ mt: 0.25, fontSize: '0.875rem', color: 'text.secondary' }}>{data.current.description}</Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                    Feels {data.current.feels_like}°C · Humidity {data.current.humidity}% · Wind {data.current.wind_speed} km/h
                                </Typography>
                            </Box>
                        </Box>

                        {/* 5-day forecast grid */}
                        {data.forecast.length > 0 && (
                            <Box
                                component="ul"
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${Math.min(data.forecast.length, 5)}, 1fr)`,
                                    gap: 0.5,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    pt: 1.5,
                                    m: 0,
                                    pl: 0,
                                    listStyle: 'none',
                                }}
                            >
                                {data.forecast.slice(0, 5).map((day) => (
                                    <Box
                                        component="li"
                                        key={day.date}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography component="span" sx={{ fontSize: '0.625rem', fontWeight: 500, color: 'text.secondary' }}>
                                            {formatDay(day.date)}
                                        </Typography>
                                        {day.icon_url && (
                                            <Box component="img" src={day.icon_url} alt={day.description} sx={{ width: 28, height: 28 }} />
                                        )}
                                        <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                                            <Typography component="span" sx={{ fontWeight: 600 }}>
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
                )}
            </DialogContent>
        </Dialog>
    );
}

import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import WeatherForecastDialog from '@/components/WeatherForecastDialog';
import { useWeather } from '@/hooks/useWeather';
import type { AppPageProps } from '@/types';

const WeatherButton = styled(Box)(({ theme }) => ({
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
}));

const TempText = styled(Box)({
    fontWeight: 600,
});

const DescriptionText = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
    textTransform: 'capitalize',
}));

/**
 * A compact weather strip shown at the top of date-based calendar views.
 * Silently renders nothing when weather data is unavailable.
 * Clicking it opens a 5-day forecast dialog with an editable location.
 */
export default function WeatherStrip() {
    const { data, loading } = useWeather();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { auth } = usePage<AppPageProps>().props;
    const family = auth.user?.family ?? null;

    if (loading || !data) {
        return null;
    }

    return (
        <>
            <WeatherButton
                role="button"
                tabIndex={0}
                onClick={() => setDialogOpen(true)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDialogOpen(true)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.75, py: 0.25 }}
            >
                {data.current.icon_url && (
                    <Box
                        component="img"
                        src={data.current.icon_url}
                        alt={data.current.description}
                        sx={{ width: 24, height: 24, mt: -0.5, mb: -0.5 }}
                    />
                )}
                <TempText component="span">{data.current.temp}°C</TempText>
                <DescriptionText component="span">{data.current.description}</DescriptionText>
            </WeatherButton>

            <WeatherForecastDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultLocationName={family?.location_name ?? null}
                defaultLat={family?.latitude ?? null}
                defaultLng={family?.longitude ?? null}
            />
        </>
    );
}

import { useWeather } from '@/hooks/useWeather';

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
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
            <img src={weatherIconUrl(data.current.icon)} alt={data.current.description} width={24} height={24} className="-my-1" />
            <span className="font-semibold">{data.current.temp}°C</span>
            <span className="text-muted-foreground capitalize">{data.current.description}</span>
            <span className="ml-auto text-xs text-muted-foreground">{data.location}</span>
        </div>
    );
}

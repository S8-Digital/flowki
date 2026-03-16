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
            <div className="flex items-center justify-center py-8">
                <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Current conditions */}
            <div className="flex items-center gap-3">
                <img src={weatherIconUrl(data.current.icon)} alt={data.current.description} width={64} height={64} className="-my-2 -ml-2" />
                <div>
                    <p className="text-3xl leading-none font-semibold">{data.current.temp}°C</p>
                    <p className="mt-1 text-sm text-muted-foreground capitalize">{data.current.description}</p>
                    <p className="text-xs text-muted-foreground">
                        Feels {data.current.feels_like}°C · Humidity {data.current.humidity}% · Wind {data.current.wind_speed} m/s
                    </p>
                </div>
            </div>

            {/* Location */}
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{data.location}</p>

            {/* 5-day forecast */}
            {data.forecast.length > 0 && (
                <ul className="grid grid-cols-5 gap-1 border-t pt-3">
                    {data.forecast.map((day) => (
                        <li key={day.date} className="flex flex-col items-center gap-1 text-center">
                            <span className="text-[10px] font-medium text-muted-foreground">{formatDay(day.date)}</span>
                            <img src={weatherIconUrl(day.icon)} alt={day.description} width={32} height={32} />
                            <span className="text-xs">
                                <span className="font-medium">{day.temp_max}°</span>
                                <span className="text-muted-foreground"> / {day.temp_min}°</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

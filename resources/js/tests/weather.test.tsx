import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import WeatherForecastDialog from '@/components/WeatherForecastDialog';
import WeatherStrip from '@/components/WeatherStrip';
import { useWeather } from '@/hooks/useWeather';
import type { WeatherData } from '@/types';

// Mock the useWeather hook – vi.mock is hoisted by Vitest so this runs before imports.
vi.mock('@/hooks/useWeather', () => ({
    useWeather: vi.fn(),
}));

// Mock GoogleAddressAutocomplete to avoid Maps JS API loading in tests
vi.mock('@/components/GoogleAddressAutocomplete', () => ({
    default: ({ placeholder, value }: { placeholder?: string; value?: string }) => (
        <input data-testid="location-input" placeholder={placeholder} defaultValue={value} readOnly />
    ),
}));

// Mock usePage for WeatherStrip (which uses Inertia shared props)
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(() => ({
        props: {
            auth: {
                user: {
                    family: {
                        id: 1,
                        name: 'Test Family',
                        invite_code: 'ABC123',
                        location_name: 'London',
                        latitude: 51.5074,
                        longitude: -0.1278,
                        created_at: '2024-01-01T00:00:00Z',
                    },
                },
            },
        },
    })),
}));

const mockWeatherData: WeatherData = {
    location: 'London',
    current: {
        temp: 15,
        feels_like: 13,
        description: 'Light rain',
        icon_url: 'https://maps.gstatic.com/weather/v1/rain.png',
        humidity: 72,
        wind_speed: 4.5,
    },
    forecast: [
        { date: '2026-03-17', temp_min: 10, temp_max: 18, description: 'Clear sky', icon_url: 'https://maps.gstatic.com/weather/v1/clear.png' },
        { date: '2026-03-18', temp_min: 9, temp_max: 16, description: 'Cloudy', icon_url: 'https://maps.gstatic.com/weather/v1/cloudy.png' },
    ],
};

describe('WeatherWidget', () => {
    beforeEach(() => {
        vi.mocked(useWeather).mockReset();
    });

    it('renders a spinner while loading', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: true });
        const { container } = render(<WeatherWidget />);
        expect(container.firstChild).not.toBeNull();
    });

    it('renders nothing when data is null and not loading', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: false });
        const { container } = render(<WeatherWidget />);
        expect(container.firstChild).toBeNull();
    });

    it('renders current temperature and description', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherWidget />);
        expect(screen.getByText('15°C')).toBeInTheDocument();
        expect(screen.getByText('Light rain')).toBeInTheDocument();
    });

    it('renders location name', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherWidget />);
        expect(screen.getByText('London')).toBeInTheDocument();
    });

    it('renders forecast days', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherWidget />);
        expect(screen.getByText(/18°/)).toBeInTheDocument();
        expect(screen.getByText(/16°/)).toBeInTheDocument();
    });
});

describe('WeatherStrip', () => {
    beforeEach(() => {
        vi.mocked(useWeather).mockReset();
    });

    it('renders nothing while loading', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: true });
        const { container } = render(<WeatherStrip />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when data is null', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: false });
        const { container } = render(<WeatherStrip />);
        expect(container.firstChild).toBeNull();
    });

    it('renders temperature, description, and location in strip', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherStrip />);
        expect(screen.getByText('15°C')).toBeInTheDocument();
        expect(screen.getByText('Light rain')).toBeInTheDocument();
        expect(screen.getByText('London')).toBeInTheDocument();
    });

    it('strip is keyboard accessible with role=button', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherStrip />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});

describe('WeatherForecastDialog', () => {
    beforeEach(() => {
        vi.mocked(useWeather).mockReset();
    });

    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        defaultLocationName: 'London',
        defaultLat: 51.5074,
        defaultLng: -0.1278,
    };

    it('renders the location autocomplete input', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: false });
        render(<WeatherForecastDialog {...defaultProps} />);
        expect(screen.getByTestId('location-input')).toBeInTheDocument();
    });

    it('shows unavailable message when data is null and not loading', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: false });
        render(<WeatherForecastDialog {...defaultProps} />);
        expect(screen.getByText(/weather data unavailable/i)).toBeInTheDocument();
    });

    it('renders 7-day forecast when data is available', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherForecastDialog {...defaultProps} />);
        expect(screen.getByText('15°C')).toBeInTheDocument();
        expect(screen.getByText(/18°/)).toBeInTheDocument();
        expect(screen.getByText(/16°/)).toBeInTheDocument();
    });

    it('does not fetch when open is false', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: false });
        render(<WeatherForecastDialog {...defaultProps} open={false} />);
        expect(vi.mocked(useWeather)).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });
});

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WeatherData } from '@/types';

// Mock the useWeather hook
vi.mock('@/hooks/useWeather', () => ({
    useWeather: vi.fn(),
}));

import { useWeather } from '@/hooks/useWeather';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import WeatherStrip from '@/components/WeatherStrip';

const mockWeatherData: WeatherData = {
    location: 'London',
    current: {
        temp: 15,
        feels_like: 13,
        description: 'Light rain',
        icon: '10d',
        humidity: 72,
        wind_speed: 4.5,
    },
    forecast: [
        { date: '2026-03-17', temp_min: 10, temp_max: 18, description: 'Clear sky', icon: '01d' },
        { date: '2026-03-18', temp_min: 9, temp_max: 16, description: 'Cloudy', icon: '03d' },
    ],
};

describe('WeatherWidget', () => {
    beforeEach(() => {
        vi.mocked(useWeather).mockReset();
    });

    it('renders a spinner while loading', () => {
        vi.mocked(useWeather).mockReturnValue({ data: null, loading: true });
        const { container } = render(<WeatherWidget />);
        // Loading spinner should be present
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
        // Should show both forecast days
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

    it('renders temperature and description in strip', () => {
        vi.mocked(useWeather).mockReturnValue({ data: mockWeatherData, loading: false });
        render(<WeatherStrip />);
        expect(screen.getByText('15°C')).toBeInTheDocument();
        expect(screen.getByText('Light rain')).toBeInTheDocument();
        expect(screen.getByText('London')).toBeInTheDocument();
    });
});

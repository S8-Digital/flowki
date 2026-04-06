import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
        <a href={String(href)} {...rest}>
            {children}
        </a>
    ),
}));

// Route stubs
vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
    privacy: () => '/privacy',
    terms: () => '/terms',
}));

vi.mock('@/components/AppearanceToggle', () => ({
    default: () => <button>Toggle appearance</button>,
}));

// ---------------------------------------------------------------------------
// Privacy page
// ---------------------------------------------------------------------------

describe('Privacy page', () => {
    it('renders the Privacy Policy heading', () => {
        render(<Privacy />);
        expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
    });

    it('renders a link to Terms of Service', () => {
        render(<Privacy />);
        expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    });

    it('renders the contact email', () => {
        render(<Privacy />);
        const emailLinks = screen.getAllByText(/privacy@flowki\.family/i);
        expect(emailLinks.length).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// Terms page
// ---------------------------------------------------------------------------

describe('Terms page', () => {
    it('renders the Terms of Service heading', () => {
        render(<Terms />);
        expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument();
    });

    it('renders a link to Privacy Policy', () => {
        render(<Terms />);
        const links = screen.getAllByRole('link', { name: /privacy policy/i });
        expect(links.length).toBeGreaterThan(0);
    });

    it('renders the contact email', () => {
        render(<Terms />);
        const emailLinks = screen.getAllByText(/legal@flowki\.family/i);
        expect(emailLinks.length).toBeGreaterThan(0);
    });
});

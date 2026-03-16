import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';

describe('InputError', () => {
    it('renders nothing when message is empty', () => {
        const { container } = render(<InputError />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the error message when provided', () => {
        render(<InputError message="Email is required" />);
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('applies a custom className to the wrapper', () => {
        const { container } = render(<InputError message="Error" className="mt-2" />);
        expect(container.firstChild).toHaveClass('mt-2');
    });
});

describe('HeadingSmall', () => {
    it('renders the title', () => {
        render(<HeadingSmall title="Profile information" />);
        expect(screen.getByRole('heading', { name: 'Profile information' })).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        render(<HeadingSmall title="Settings" description="Manage your account" />);
        expect(screen.getByText('Manage your account')).toBeInTheDocument();
    });

    it('does not render description text when omitted', () => {
        render(<HeadingSmall title="Title only" />);
        expect(screen.queryByText('Title only')).toBeInTheDocument();
        // Only one element — the heading. No description node.
        const header = screen.getByRole('banner');
        expect(header.querySelectorAll('p')).toHaveLength(0);
    });
});

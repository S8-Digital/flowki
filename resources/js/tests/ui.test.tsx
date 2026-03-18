import { Button } from '@/components/ui/button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
    it('renders with default text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', async () => {
        const handler = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={handler}>Submit</Button>);
        await user.click(screen.getByRole('button', { name: 'Submit' }));
        expect(handler).toHaveBeenCalledOnce();
    });

    it('is disabled when the disabled prop is set', async () => {
        const handler = vi.fn();
        // MUI applies pointer-events:none to disabled buttons; bypass the pointer check
        const user = userEvent.setup({ pointerEventsCheck: 0 });
        render(
            <Button disabled onClick={handler}>
                Disabled
            </Button>,
        );
        const btn = screen.getByRole('button', { name: 'Disabled' });
        expect(btn).toBeDisabled();
        await user.click(btn);
        expect(handler).not.toHaveBeenCalled();
    });

    it('renders as a link when asChild is used with an anchor', () => {
        render(
            <Button asChild>
                <a href="/home">Home</a>
            </Button>,
        );
        const link = screen.getByRole('link', { name: 'Home' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/home');
    });
});

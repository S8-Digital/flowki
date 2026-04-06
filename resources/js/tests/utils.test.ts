import { describe, expect, it } from 'vitest';
import { cn, getProfileColor, toUrl, urlIsActive } from '@/lib/utils';

describe('cn', () => {
    it('returns a single class name unchanged', () => {
        expect(cn('foo')).toBe('foo');
    });

    it('joins multiple class names with a space', () => {
        expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('ignores falsy values', () => {
        expect(cn('foo', false, null, undefined, 0, 'bar')).toBe('foo bar');
    });

    it('returns an empty string when all inputs are falsy', () => {
        expect(cn(false, null, undefined)).toBe('');
    });

    it('returns an empty string when called with no arguments', () => {
        expect(cn()).toBe('');
    });
});

describe('toUrl', () => {
    it('returns the string directly when href is a string', () => {
        expect(toUrl('/dashboard')).toBe('/dashboard');
    });

    it('returns the url property when href is an object', () => {
        expect(toUrl({ url: '/family', method: 'get' } as never)).toBe('/family');
    });
});

describe('urlIsActive', () => {
    it('returns true when the href matches the current URL exactly', () => {
        expect(urlIsActive('/dashboard', '/dashboard')).toBe(true);
    });

    it('returns false when the href does not match the current URL', () => {
        expect(urlIsActive('/calendar', '/dashboard')).toBe(false);
    });

    it('works with object href that matches current URL', () => {
        expect(urlIsActive({ url: '/calendar', method: 'get' } as never, '/calendar')).toBe(true);
    });

    it('returns false when URLs differ by trailing slash', () => {
        expect(urlIsActive('/dashboard/', '/dashboard')).toBe(false);
    });
});

describe('getProfileColor', () => {
    it('returns null for null user', () => {
        expect(getProfileColor(null)).toBeNull();
    });

    it('returns null for undefined user', () => {
        expect(getProfileColor(undefined)).toBeNull();
    });

    it('returns null when profile_color is null', () => {
        expect(getProfileColor({ profile_color: null })).toBeNull();
    });

    it('returns null when profile_color is empty string', () => {
        expect(getProfileColor({ profile_color: '' })).toBeNull();
    });

    it('returns the color when it is a valid 6-digit hex', () => {
        expect(getProfileColor({ profile_color: '#ff0000' })).toBe('#ff0000');
        expect(getProfileColor({ profile_color: '#AABBCC' })).toBe('#AABBCC');
        expect(getProfileColor({ profile_color: '#123456' })).toBe('#123456');
    });

    it('returns null for 3-digit hex (short form)', () => {
        expect(getProfileColor({ profile_color: '#fff' })).toBeNull();
        expect(getProfileColor({ profile_color: '#abc' })).toBeNull();
    });

    it('returns null for invalid color strings', () => {
        expect(getProfileColor({ profile_color: 'not-a-color' })).toBeNull();
        expect(getProfileColor({ profile_color: 'red' })).toBeNull();
        expect(getProfileColor({ profile_color: 'rgb(255,0,0)' })).toBeNull();
    });

    it('returns null for 8-digit hex (includes alpha)', () => {
        expect(getProfileColor({ profile_color: '#ff0000ff' })).toBeNull();
    });

    it('returns null when # is missing', () => {
        expect(getProfileColor({ profile_color: 'ff0000' })).toBeNull();
    });
});

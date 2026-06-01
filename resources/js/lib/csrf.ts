/**
 * Returns the current XSRF token from the XSRF-TOKEN cookie.
 *
 * Laravel refreshes this cookie on every response, so reading it at request
 * time ensures the token is never stale (unlike the meta-tag approach).
 */
export function getXsrfToken(): string {
    return decodeURIComponent(document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
}

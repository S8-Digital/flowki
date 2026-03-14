export function redirect(provider: string): { url: string } {
    return { url: `/auth/${provider}/redirect` };
}

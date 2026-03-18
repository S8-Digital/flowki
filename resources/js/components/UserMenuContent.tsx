import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';
import { Link, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export default function UserMenuContent({ user }: UserMenuContentProps) {
    function handleLogout() {
        router.flushAll();
    }

    return (
        <>
            <DropdownMenuLabel style={{ padding: 0, fontWeight: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.75, textAlign: 'left', fontSize: '0.875rem' }}>
                    <UserInfo user={user} showEmail showAppearanceToggle />
                </Box>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild style={{ cursor: 'pointer' }}>
                <Link style={{ display: 'flex', alignItems: 'center' }} href={edit()} prefetch as="a">
                    <Settings style={{ marginRight: 16, width: 16, height: 16 }} />
                    Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild style={{ cursor: 'pointer' }}>
                <Link style={{ display: 'flex', alignItems: 'center' }} href={logout()} onClick={handleLogout} as="a">
                    <LogOut style={{ marginRight: 16, width: 16, height: 16 }} />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}

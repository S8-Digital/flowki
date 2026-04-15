import { Link, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { LogOut, Settings } from 'lucide-react';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo';
import { toUrl } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

interface UserMenuContentProps {
    user: User;
}

const MenuLabelContent = styled(Box)({
    textAlign: 'left',
    fontSize: '0.875rem',
});

export default function UserMenuContent({ user }: UserMenuContentProps) {
    function handleLogout() {
        router.flushAll();
        router.post(toUrl(logout()));
    }

    return (
        <>
            <DropdownMenuLabel style={{ padding: 0, fontWeight: 400 }}>
                <MenuLabelContent sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.75 }}>
                    <UserInfo user={user} showEmail showAppearanceToggle />
                </MenuLabelContent>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild style={{ cursor: 'pointer' }}>
                <Link style={{ display: 'flex', alignItems: 'center' }} href={edit()} prefetch as="a">
                    <Settings style={{ marginRight: 16, width: 16, height: 16 }} />
                    Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleLogout}>
                <LogOut style={{ marginRight: 16, width: 16, height: 16 }} />
                Log out
            </DropdownMenuItem>
        </>
    );
}

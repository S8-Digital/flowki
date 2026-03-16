import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import AppearanceToggle from '@/components/AppearanceToggle';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

interface UserMenuContentProps {
    user: User;
}

export default function UserMenuContent({ user }: UserMenuContentProps) {
    function handleLogout() {
        router.flushAll();
    }

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-xs text-muted-foreground">Appearance</p>
                <AppearanceToggle />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={edit()} prefetch as="button">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" href={logout()} onClick={handleLogout} as="button">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}

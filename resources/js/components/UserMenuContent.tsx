import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
                    <UserInfo user={user} showEmail showAppearanceToggle />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
                <Link className="flex items-center" href={edit()} prefetch as="a">
                    <Settings className="mr-4 h-4 w-4" />
                    Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
                <Link className="flex items-center" href={logout()} onClick={handleLogout} as="a">
                    <LogOut className="mr-4 h-4 w-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}

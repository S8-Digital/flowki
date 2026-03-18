import AppearanceToggle from '@/components/AppearanceToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/hooks/useInitials';
import type { User } from '@/types';

interface UserInfoProps {
    user: User;
    showEmail?: boolean;
    showAvatar?: boolean;
    showAppearanceToggle?: boolean;
}

export default function UserInfo({ user, showEmail = false, showAvatar = true, showAppearanceToggle = false }: UserInfoProps) {
    const hasAvatar = Boolean(user.avatar) && showAvatar;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                {hasAvatar && <AvatarImage src={user.avatar!} alt={user.name} />}
                <AvatarFallback className="rounded-lg text-black dark:text-white">{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>

            {showAppearanceToggle && <AppearanceToggle />}
        </>
    );
}

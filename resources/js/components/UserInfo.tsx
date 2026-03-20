import Box from '@mui/material/Box';
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
            <Avatar style={{ width: 32, height: 32, overflow: 'hidden', borderRadius: 8 }}>
                {hasAvatar && <AvatarImage src={user.avatar!} alt={user.name} />}
                <AvatarFallback style={{ borderRadius: 8 }}>{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <Box sx={{ display: 'grid', flex: 1, textAlign: 'left', fontSize: '0.875rem', lineHeight: 1.25 }}>
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {user.name}
                </Box>
                {showEmail && (
                    <Box
                        component="span"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                        }}
                    >
                        {user.email}
                    </Box>
                )}
            </Box>

            {showAppearanceToggle && <AppearanceToggle />}
        </>
    );
}

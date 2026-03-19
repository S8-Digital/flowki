import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import type { AppPageProps } from '@/types';
import AppLogoIcon from './AppLogoIcon';

export default function AppLogo() {
    const page = usePage<AppPageProps>();
    const displayName = page.props.auth.user?.family?.name ?? page.props.name;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    aspectRatio: '1/1',
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1.5,
                    bgcolor: 'var(--sidebar-primary)',
                    color: 'var(--sidebar-primary-foreground)',
                }}
            >
                <AppLogoIcon style={{ width: 20, height: 20 }} />
            </Box>
            <Box sx={{ ml: '4px', display: 'grid', flex: 1, textAlign: 'left', fontSize: '0.875rem' }}>
                <Box
                    component="span"
                    sx={{ mb: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25, fontWeight: 600 }}
                >
                    {displayName}
                </Box>
            </Box>
        </>
    );
}

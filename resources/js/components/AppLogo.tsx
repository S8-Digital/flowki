import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAppSidebar } from '@/components/AppSidebarContext';
import type { AppPageProps } from '@/types';
import AppLogoIcon from './AppLogoIcon';

export default function AppLogo() {
    const page = usePage<AppPageProps>();
    const displayName = page.props.auth.user?.family?.name ?? page.props.name;
    const isMobile = useMediaQuery('(max-width:899px)');
    const { open } = useAppSidebar();
    const LOGO_DIMENSIONS = !open || isMobile ? 40 : 50;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    aspectRatio: '1/1',
                    width: LOGO_DIMENSIONS,
                    height: LOGO_DIMENSIONS,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AppLogoIcon style={{ width: LOGO_DIMENSIONS, height: LOGO_DIMENSIONS }} />
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

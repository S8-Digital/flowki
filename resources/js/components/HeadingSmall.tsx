import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface HeadingSmallProps {
    title: string;
    description?: string;
}

export default function HeadingSmall({ title, description }: HeadingSmallProps) {
    return (
        <Box component="header">
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}

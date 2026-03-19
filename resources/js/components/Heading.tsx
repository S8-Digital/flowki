import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface HeadingProps {
    title: string;
    description?: string;
}

export default function Heading({ title, description }: HeadingProps) {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.025em' }}>
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

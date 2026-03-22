import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface HeadingSmallProps {
    title: string;
    description?: string;
}

const HeadingSmallTitle = styled(Typography)({
    fontWeight: 500,
});

export default function HeadingSmall({ title, description }: HeadingSmallProps) {
    return (
        <Box component="header">
            <HeadingSmallTitle variant="subtitle1" sx={{ mb: 0.5 }}>
                {title}
            </HeadingSmallTitle>
            {description && (
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            )}
        </Box>
    );
}

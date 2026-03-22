import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface HeadingProps {
    title: string;
    description?: string;
}

const HeadingTitle = styled(Typography)({
    fontWeight: 600,
    letterSpacing: '-0.025em',
});

export default function Heading({ title, description }: HeadingProps) {
    return (
        <Box sx={{ mb: 4 }}>
            <HeadingTitle variant="h5">{title}</HeadingTitle>
            {description && (
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            )}
        </Box>
    );
}

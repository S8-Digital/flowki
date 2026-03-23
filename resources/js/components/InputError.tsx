import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface InputErrorProps {
    message?: string;
    className?: string;
}

export default function InputError({ message, className }: InputErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <Box className={className}>
            <Typography variant="body2" color="error">
                {message}
            </Typography>
        </Box>
    );
}

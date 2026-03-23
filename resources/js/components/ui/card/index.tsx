import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { cn } from '@/lib/utils';

const StyledCardDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    return <MuiCard className={cn(className)} {...(props as any)} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Box className={cn(className)} sx={{ px: 3, pt: 3, pb: 0 }} {...(props as any)} />;
}

function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MuiCardContent className={cn(className)} {...(props as any)} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Box className={cn(className)} sx={{ px: 3, pb: 3, pt: 0 }} {...(props as any)} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <Typography
            variant="h6"
            component="h3"
            className={cn(className)}
            sx={{ m: 0 }}
            {...(props as any)}
        />
    );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <StyledCardDescription
            variant="body2"
            component="p"
            className={cn(className)}
            sx={{ m: 0 }}
            {...(props as any)}
        />
    );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    return <Box className={cn(className)} sx={{ p: 3 }} {...(props as any)} />;
}

export { Card, CardBody, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

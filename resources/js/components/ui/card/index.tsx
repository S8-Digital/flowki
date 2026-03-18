import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MuiCard className={cn(className)} sx={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} {...(props as any)} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ padding: '24px 24px 0' }} {...props} />;
}

function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <CardContent className={cn(className)} {...(props as any)} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ padding: '0 24px 24px' }} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn(className)} style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.015em', margin: 0 }} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn(className)} style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ padding: '24px' }} {...props} />;
}

export { Card, CardBody, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

import { Card as MtCard, CardBody as MtCardBody, CardFooter as MtCardFooter, CardHeader as MtCardHeader } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtCard className={cn('bg-card text-card-foreground', className)} {...(props as any)} />;
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtCardHeader className={cn('px-6 pt-6 pb-0', className)} {...(props as any)} />;
}

function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtCardBody className={cn('px-6 py-4', className)} {...(props as any)} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtCardFooter className={cn('px-6 pb-6 pt-0', className)} {...(props as any)} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('px-6 py-4', className)} {...props} />;
}

export { Card, CardBody, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

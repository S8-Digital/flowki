import { Link } from '@inertiajs/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemType[];
}

export default function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                    <span key={item.href ?? item.title} className="contents">
                        <BreadcrumbItem>
                            {index === breadcrumbs.length - 1 ? (
                                <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href ?? '#'}>{item.title}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </span>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

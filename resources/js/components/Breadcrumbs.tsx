import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemType[];
}

export default function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                    <span key={index} className="contents">
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

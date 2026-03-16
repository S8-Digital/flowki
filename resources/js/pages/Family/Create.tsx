import { Head, useForm } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create Family', href: '/family/create' }];

export default function FamilyCreate() {
    const { data, setData, post, processing, errors } = useForm({ name: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <>
            <Head title="Create Family" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Create a Family</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Start organizing together. You'll be the family admin.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Family Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. The Smith Family"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Family'}
                            </Button>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

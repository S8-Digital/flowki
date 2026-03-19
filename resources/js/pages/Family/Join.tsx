import { create, joinStore } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Join Family', href: '/family/join' }];

export default function FamilyJoin() {
    const { data, setData, post, processing, errors } = useForm({ invite_code: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(joinStore().url);
    }

    return (
        <>
            <Head title="Join Family" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">Join a Family</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Enter the invite code shared by your family admin.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invite_code">Invite Code</Label>
                                <Input
                                    id="invite_code"
                                    value={data.invite_code}
                                    onChange={(e) => setData('invite_code', e.target.value.toUpperCase())}
                                    placeholder="e.g. ABCD1234"
                                    required
                                    className="uppercase"
                                />
                                <InputError message={errors.invite_code} />
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Joining…' : 'Join Family'}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an invite code?{' '}
                            <Link href={create().url} className="underline underline-offset-4 hover:text-foreground">
                                Create a new family
                            </Link>
                        </p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

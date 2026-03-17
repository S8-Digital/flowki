import { router } from '@inertiajs/react';
import { CalendarDays, FileText, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { confirm, upload } from '@/actions/App/Http/Controllers/RosterController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ParsedShift, RosterItem } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ACCEPTED_TYPES = '.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.pdf';
const MAX_SIZE_MB = 10;

function formatShiftTime(shift: ParsedShift): string {
    if (shift.is_all_day) {
        return new Date(shift.start_at).toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    const start = new Date(shift.start_at);
    const startStr = start.toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    if (!shift.end_at) return startStr;

    const end = new Date(shift.end_at);
    const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return `${startStr} – ${endTime}`;
}

export default function ScheduleUploadModal({ open, onOpenChange }: Props) {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<RosterItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function resetModal() {
        setStep('upload');
        setItems([]);
        setError(null);
        setIsLoading(false);
        setIsDragging(false);
    }

    function handleOpenChange(val: boolean) {
        if (!val) resetModal();
        onOpenChange(val);
    }

    async function processFile(file: File) {
        setError(null);

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
            const response = await fetch(upload().url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfMeta?.content ?? '',
                    Accept: 'application/json',
                },
                body: formData,
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.message ?? 'Failed to parse the file. Please check the format and try again.');
                return;
            }

            const parsed: ParsedShift[] = json.shifts ?? [];
            setItems(
                parsed.map((s, i) => ({
                    ...s,
                    _key: `${s.start_at}-${s.title}-${i}`,
                })),
            );
            setStep('preview');
        } catch {
            setError('An error occurred while uploading. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        // Reset so the same file can be re-selected if needed
        e.target.value = '';
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }

    function removeItem(key: string) {
        setItems((prev) => prev.filter((i) => i._key !== key));
    }

    function handleConfirm() {
        if (items.length === 0) return;

        const shifts = items.map(({ title, start_at, end_at, is_all_day }) => ({
            title,
            start_at,
            end_at,
            is_all_day,
        }));

        router.post(
            confirm().url,
            { shifts },
            {
                onSuccess: () => {
                    handleOpenChange(false);
                },
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="size-5 text-primary" />
                        Import Schedule
                    </DialogTitle>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Upload your schedule file to auto-populate your calendar. Accepted formats: plain text (.txt,
                            .csv), images (.jpg, .png), and PDFs. Works great with work rosters, shift schedules, and
                            timetables.
                        </p>

                        {/* Drop zone */}
                        <div
                            role="button"
                            tabIndex={0}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/30 hover:border-primary hover:bg-muted/30'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            aria-label="Drop schedule file here or click to browse"
                        >
                            <Upload className="mb-3 size-10 text-muted-foreground" />
                            <p className="text-sm font-medium">Drop your schedule file here</p>
                            <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {ACCEPTED_TYPES.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} · max{' '}
                                {MAX_SIZE_MB} MB
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            className="hidden"
                            onChange={handleFileInput}
                            aria-hidden="true"
                        />

                        {isLoading && (
                            <p className="text-center text-sm text-muted-foreground">Parsing your schedule…</p>
                        )}

                        {error && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {items.length} shift{items.length !== 1 ? 's' : ''} found. Remove any you don't want to
                                import, then click <strong>Import</strong>.
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep('upload')}
                                className="text-xs"
                            >
                                ← Re-upload
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                All shifts removed. Re-upload a file or close.
                            </p>
                        ) : (
                            <ul className="divide-y rounded-lg border">
                                {items.map((item) => (
                                    <li key={item._key} className="flex items-start justify-between gap-3 px-3 py-2.5">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{item.title}</p>
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                <FileText className="size-3 shrink-0" />
                                                {formatShiftTime(item)}
                                                {item.is_all_day && (
                                                    <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px]">
                                                        All day
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item._key)}
                                            className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            aria-label={`Remove ${item.title}`}
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirm} disabled={items.length === 0}>
                                <Trash2 className="mr-1.5 size-4 hidden" aria-hidden="true" />
                                Import {items.length > 0 ? `${items.length} shift${items.length !== 1 ? 's' : ''}` : ''}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

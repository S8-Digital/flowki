import { router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { CalendarDays, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { confirm, upload } from '@/actions/App/Http/Controllers/ScheduleController';
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

    if (!shift.end_at) {
        return startStr;
    }

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
        if (!val) {
            resetModal();
        }

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

        if (file) {
            processFile(file);
        }

        // Reset so the same file can be re-selected if needed
        e.target.value = '';
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];

        if (file) {
            processFile(file);
        }
    }

    function removeItem(key: string) {
        setItems((prev) => prev.filter((i) => i._key !== key));
    }

    function handleConfirm() {
        if (items.length === 0) {
            return;
        }

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
            <DialogContent sx={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '32rem' }}>
                <DialogHeader>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarDays size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
                            Import Schedule
                        </Box>
                    </DialogTitle>
                </DialogHeader>

                {step === 'upload' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            Upload your schedule file to auto-populate your calendar. Accepted formats: plain text (.txt, .csv), images (.jpg, .png),
                            and PDFs. Works great with work rosters, shift schedules, and timetables.
                        </Typography>

                        {/* Drop zone */}
                        <Box
                            role="button"
                            tabIndex={0}
                            sx={{
                                display: 'flex',
                                cursor: 'pointer',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 3,
                                border: '2px dashed',
                                borderColor: isDragging ? 'primary.main' : 'var(--muted-foreground)',
                                bgcolor: isDragging ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                                p: 5,
                                transition: 'color 0.2s, background-color 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'var(--muted)',
                                },
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            aria-label="Drop schedule file here or click to browse"
                        >
                            <Upload size={40} style={{ marginBottom: 12, color: 'var(--mui-palette-text-secondary)' }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Drop your schedule file here</Typography>
                            <Typography sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>or click to browse</Typography>
                            <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                                {ACCEPTED_TYPES.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} · max {MAX_SIZE_MB} MB
                            </Typography>
                        </Box>

                        <Box
                            component="input"
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            sx={{ display: 'none' }}
                            onChange={handleFileInput as any}
                            aria-hidden="true"
                        />

                        {isLoading && (
                            <Typography sx={{ textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
                                Parsing your schedule…
                            </Typography>
                        )}

                        {error && (
                            <Box
                                sx={{
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'error.light',
                                    bgcolor: 'rgba(var(--destructive-rgb), 0.1)',
                                    p: 1.5,
                                    fontSize: '0.875rem',
                                    color: 'error.main',
                                }}
                            >
                                {error}
                            </Box>
                        )}
                    </Box>
                )}

                {step === 'preview' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                {items.length} shift{items.length !== 1 ? 's' : ''} found. Remove any you don't want to import, then click{' '}
                                <strong>Import</strong>.
                            </Typography>
                            <Button variant="ghost" size="sm" onClick={() => setStep('upload')} sx={{ fontSize: '0.75rem' }}>
                                ← Re-upload
                            </Button>
                        </Box>

                        {items.length === 0 ? (
                            <Typography sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
                                All shifts removed. Re-upload a file or close.
                            </Typography>
                        ) : (
                            <Box
                                component="ul"
                                sx={{
                                    m: 0,
                                    p: 0,
                                    listStyle: 'none',
                                    border: '1px solid',
                                    borderColor: 'var(--border)',
                                    borderRadius: 2,
                                    '& > li + li': { borderTop: 1, borderColor: 'divider' },
                                }}
                            >
                                {items.map((item) => (
                                    <Box
                                        component="li"
                                        key={item._key}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            gap: 1.5,
                                            px: 1.5,
                                            py: 1.25,
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    mt: 0.25,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    fontSize: '0.75rem',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                <FileText style={{ width: 12, height: 12, flexShrink: 0 }} />
                                                {formatShiftTime(item)}
                                                {item.is_all_day && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            ml: 0.5,
                                                            borderRadius: 0.5,
                                                            bgcolor: 'var(--muted)',
                                                            px: 0.5,
                                                            py: 0.25,
                                                            fontSize: '0.625rem',
                                                        }}
                                                    >
                                                        All day
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <ButtonBase
                                            onClick={() => removeItem(item._key)}
                                            aria-label={`Remove ${item.title}`}
                                            sx={{
                                                mt: 0.25,
                                                flexShrink: 0,
                                                borderRadius: 1,
                                                p: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': { bgcolor: 'error.light', color: 'error.main' },
                                            }}
                                        >
                                            <X style={{ width: 14, height: 14 }} />
                                        </ButtonBase>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}>
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirm} disabled={items.length === 0}>
                                Import {items.length > 0 ? `${items.length} shift${items.length !== 1 ? 's' : ''}` : ''}
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

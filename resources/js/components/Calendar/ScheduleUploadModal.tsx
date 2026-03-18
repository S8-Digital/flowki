import { confirm, upload } from '@/actions/App/Http/Controllers/ScheduleController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ParsedShift, RosterItem } from '@/types';
import { router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CalendarDays, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

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
            <DialogContent style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '32rem' }}>
                <DialogHeader>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarDays style={{ width: 20, height: 20, color: 'var(--primary)' }} />
                            Import Schedule
                        </Box>
                    </DialogTitle>
                </DialogHeader>

                {step === 'upload' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
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
                            <Upload style={{ marginBottom: 12, width: 40, height: 40, color: 'var(--muted-foreground)' }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Drop your schedule file here</Typography>
                            <Typography sx={{ mt: 0.5, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>or click to browse</Typography>
                            <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                {ACCEPTED_TYPES.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} · max {MAX_SIZE_MB} MB
                            </Typography>
                        </Box>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                            aria-hidden="true"
                        />

                        {isLoading && (
                            <Typography sx={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {items.length} shift{items.length !== 1 ? 's' : ''} found. Remove any you don't want to import, then click{' '}
                                <strong>Import</strong>.
                            </Typography>
                            <Button variant="ghost" size="sm" onClick={() => setStep('upload')} style={{ fontSize: '0.75rem' }}>
                                ← Re-upload
                            </Button>
                        </Box>

                        {items.length === 0 ? (
                            <Typography sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
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
                                    '& > li + li': { borderTop: '1px solid', borderColor: 'var(--border)' },
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
                                            gap: '12px',
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
                                                    gap: '4px',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--muted-foreground)',
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
                                                            px: '4px',
                                                            py: '2px',
                                                            fontSize: '0.625rem',
                                                        }}
                                                    >
                                                        All day
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item._key)}
                                            style={{
                                                marginTop: 2,
                                                flexShrink: 0,
                                                borderRadius: 4,
                                                padding: 4,
                                                color: 'var(--muted-foreground)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'none',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(var(--destructive-rgb), 0.1)';
                                                e.currentTarget.style.color = 'var(--destructive)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--muted-foreground)';
                                            }}
                                            aria-label={`Remove ${item.title}`}
                                        >
                                            <X style={{ width: 14, height: 14 }} />
                                        </button>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', pt: 0.5 }}>
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

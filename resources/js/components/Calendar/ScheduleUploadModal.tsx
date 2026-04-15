import { router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CalendarDays, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ParsedShift, RosterItem } from '@/types';
import { confirm, upload } from '@/actions/App/Http/Controllers/ScheduleController';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ACCEPTED_TYPES = '.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.pdf';
const MAX_SIZE_MB = 10;

const DropZone = styled(Box, { shouldForwardProp: (prop) => prop !== 'isDragging' })<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    borderRadius: (theme.shape.borderRadius as number) * 3,
    border: '2px dashed',
    borderColor: isDragging ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
    },
}));

const ErrorBox = styled(Box)(({ theme }) => ({
    borderRadius: (theme.shape.borderRadius as number) * 2,
    border: `1px solid ${theme.palette.error.light}`,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    fontSize: '0.875rem',
    color: theme.palette.error.main,
}));

const PreviewList = styled('ul')(({ theme }) => ({
    margin: 0,
    padding: 0,
    listStyle: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    '& > li + li': {
        borderTop: `1px solid ${theme.palette.divider}`,
    },
}));

const PreviewItemTitle = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
});

const ItemMetaBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const AllDayBadge = styled('span')(({ theme }) => ({
    borderRadius: (theme.shape.borderRadius as number) * 0.5,
    backgroundColor: theme.palette.action.selected,
    fontSize: '0.625rem',
}));

const RemoveButton = styled(ButtonBase)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius as number,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.main,
    },
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const DropZoneTitle = styled(Typography)({
    fontSize: '0.875rem',
    fontWeight: 500,
});

const SmallSecondaryText = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const CenteredSecondaryText = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

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
            <DialogContent sx={{ overflowY: 'auto' }}>
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
                        <DescriptionText>
                            Upload your schedule file to auto-populate your calendar. Accepted formats: plain text (.txt, .csv), images (.jpg, .png),
                            and PDFs. Works great with work rosters, shift schedules, and timetables.
                        </DescriptionText>

                        {/* Drop zone */}
                        <DropZone
                            isDragging={isDragging}
                            role="button"
                            tabIndex={0}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5 }}
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
                            <DropZoneTitle>Drop your schedule file here</DropZoneTitle>
                            <SmallSecondaryText sx={{ mt: 0.5 }}>or click to browse</SmallSecondaryText>
                            <SmallSecondaryText sx={{ mt: 1.5 }}>
                                {ACCEPTED_TYPES.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} · max {MAX_SIZE_MB} MB
                            </SmallSecondaryText>
                        </DropZone>

                        <Box
                            component="input"
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            sx={{ display: 'none' }}
                            onChange={handleFileInput as any}
                            aria-hidden="true"
                        />

                        {isLoading && <CenteredSecondaryText>Parsing your schedule…</CenteredSecondaryText>}

                        {error && <ErrorBox sx={{ p: 1.5 }}>{error}</ErrorBox>}
                    </Box>
                )}

                {step === 'preview' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <DescriptionText>
                                {items.length} shift{items.length !== 1 ? 's' : ''} found. Remove any you don't want to import, then click{' '}
                                <strong>Import</strong>.
                            </DescriptionText>
                            <Button variant="ghost" size="sm" onClick={() => setStep('upload')} style={{ fontSize: '0.75rem' }}>
                                ← Re-upload
                            </Button>
                        </Box>

                        {items.length === 0 ? (
                            <CenteredSecondaryText sx={{ py: 3 }}>All shifts removed. Re-upload a file or close.</CenteredSecondaryText>
                        ) : (
                            <PreviewList>
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
                                            <PreviewItemTitle>{item.title}</PreviewItemTitle>
                                            <ItemMetaBox sx={{ mt: 0.25 }}>
                                                <FileText style={{ width: 12, height: 12, flexShrink: 0 }} />
                                                {formatShiftTime(item)}
                                                {item.is_all_day && <AllDayBadge style={{ marginLeft: 4, padding: '1px 4px' }}>All day</AllDayBadge>}
                                            </ItemMetaBox>
                                        </Box>
                                        <RemoveButton
                                            onClick={() => removeItem(item._key)}
                                            aria-label={`Remove ${item.title}`}
                                            sx={{ mt: 0.25, flexShrink: 0, p: 0.5 }}
                                        >
                                            <X style={{ width: 14, height: 14 }} />
                                        </RemoveButton>
                                    </Box>
                                ))}
                            </PreviewList>
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

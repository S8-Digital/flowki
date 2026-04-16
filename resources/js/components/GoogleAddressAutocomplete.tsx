import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { AppPageProps } from '@/types';

export interface PlaceResult {
    address: string;
    latitude: number;
    longitude: number;
}

interface Props {
    value?: string;
    onChange?: (value: string) => void;
    onPlaceSelected: (place: PlaceResult) => void;
    placeholder?: string;
    id?: string;
}

const MAPS_SCRIPT_ID = 'google-maps-places-script';

// Kick off the Maps bootstrap and Places library as soon as this module is imported
// (i.e. on page load), not when the component first mounts. This ensures that by
// the time the user opens a dialog containing this component, Maps is already ready.
const MAPS_PREWARM_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

if (typeof window !== 'undefined' && MAPS_PREWARM_KEY) {
    loadGoogleMapsScript(MAPS_PREWARM_KEY)
        .then(() => google.maps.importLibrary('places'))
        .catch(() => {});
}

/**
 * Resolves when `google.maps.importLibrary` is available.
 * - If the bootstrap is already loaded (`google` is defined), resolves immediately.
 * - If the script tag exists but hasn't fired `load` yet, waits for it.
 * - Otherwise, injects the script tag.
 */
function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error('Not a browser environment'));

            return;
        }

        // Bootstrap already loaded
        if (typeof google !== 'undefined') {
            resolve();

            return;
        }

        // Script tag exists but load event hasn't fired yet
        const existingScript = document.getElementById(MAPS_SCRIPT_ID);

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load')));

            return;
        }

        // IMPORTANT: do NOT include `libraries=places` — that loads the legacy Places API
        // which is not covered by App Check. Places API (New) is loaded on-demand via
        // importLibrary('places'), which is the App Check-compatible path.
        const script = document.createElement('script');
        script.id = MAPS_SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps failed to load'));
        document.head.appendChild(script);
    });
}

/**
 * Controlled address input backed by Places API (New).
 *
 * Loading strategy:
 *  - Bootstrap uses `loading=async` with NO `libraries=places` (legacy path).
 *  - `importLibrary('places')` loads Places API (New), the App Check-compatible path.
 *
 * Session tokens group each autocomplete search + detail fetch into one billing
 * session (cheaper than per-request billing).
 */
export default function GoogleAddressAutocomplete({ value, onChange, onPlaceSelected, placeholder, id }: Props) {
    const page = usePage<AppPageProps>();
    const [localValue, setLocalValue] = useState(value ?? '');
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const popperRef = useRef<HTMLDivElement | null>(null);
    const isMapsLoadedRef = useRef(false);
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onChangeRef = useRef(onChange);
    const onPlaceSelectedRef = useRef(onPlaceSelected);
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;

    // Sync local value when the parent resets the field (e.g. dialog opens with existing data)
    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

    const apiKey = page.props.googleMapsApiKey ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            return;
        }

        loadGoogleMapsScript(apiKey)
            .then(async () => {
                // Load Places API (New) — App Check-compatible path
                await google.maps.importLibrary('places');
                isMapsLoadedRef.current = true;
            })
            .catch(() => {
                // Input still works as a plain text field when Maps is unavailable
            });
    }, [apiKey]);

    function getOrCreateSessionToken(): google.maps.places.AutocompleteSessionToken {
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        }

        return sessionTokenRef.current;
    }

    async function fetchSuggestions(input: string): Promise<void> {
        // Also check live availability in case Maps loaded between mount and first
        // keypress (e.g. the useEffect hasn't resolved yet but Maps is already ready)
        if (!isMapsLoadedRef.current) {
            if (typeof google !== 'undefined' && google.maps?.places) {
                isMapsLoadedRef.current = true;
            } else {
                return;
            }
        }

        try {
            const result = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                sessionToken: getOrCreateSessionToken(),
            });

            const valid = result.suggestions.filter((s) => s.placePrediction !== null);
            setSuggestions(valid);
            setIsOpen(valid.length > 0);
        } catch {
            setSuggestions([]);
            setIsOpen(false);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const newValue = e.target.value;

        // Update display immediately — no parent re-render needed for this
        setLocalValue(newValue);

        // Keep parent form state in sync
        onChangeRef.current?.(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (newValue.trim()) {
            debounceRef.current = setTimeout(() => void fetchSuggestions(newValue), 300);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }

    async function handleSelect(suggestion: google.maps.places.AutocompleteSuggestion): Promise<void> {
        const prediction = suggestion.placePrediction;

        if (!prediction) {
            return;
        }

        const displayText = prediction.text.text;

        // Close dropdown and fill the input instantly
        setSuggestions([]);
        setIsOpen(false);
        setLocalValue(displayText);
        onChangeRef.current?.(displayText);

        // Consuming the session token groups autocomplete + details into one billing session
        sessionTokenRef.current = null;

        // Fetch formatted address and coordinates in the background
        try {
            const place = prediction.toPlace();
            await place.fetchFields({ fields: ['formattedAddress', 'location'] });

            const address = place.formattedAddress ?? displayText;
            const location = place.location;

            setLocalValue(address);
            onChangeRef.current?.(address);

            if (!location) {
                return;
            }

            const lat = location.lat();
            const lng = location.lng();

            onPlaceSelectedRef.current({ address, latitude: lat, longitude: lng });
        } catch {
            // displayText is already committed as a fallback
        }
    }

    useEffect(() => {
        function handlePointerDown(event: PointerEvent): void {
            const target = event.target as Node;
            const insideContainer = containerRef.current?.contains(target) ?? false;
            const insidePopper = popperRef.current?.contains(target) ?? false;

            if (!insideContainer && !insidePopper) {
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <Input
                id={id}
                value={localValue}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
            />
            <Popper
                open={isOpen && suggestions.length > 0}
                anchorEl={containerRef.current}
                placement="bottom-start"
                sx={{ zIndex: 1400, width: containerRef.current?.offsetWidth ?? 'auto' }}
            >
                <Paper ref={popperRef} elevation={4} sx={{ mt: 0.5, maxHeight: 280, overflow: 'auto' }}>
                    <MenuList dense disablePadding>
                        {suggestions.map((suggestion, i) => (
                            <MenuItem
                                key={i}
                                onPointerDown={(e) => {
                                    // pointerdown fires before input blur, preventing premature close
                                    e.preventDefault();
                                    void handleSelect(suggestion);
                                }}
                            >
                                <Box>
                                    <Typography variant="body2" fontWeight={500} component="span">
                                        {suggestion.placePrediction?.mainText?.text}
                                    </Typography>
                                    {suggestion.placePrediction?.secondaryText?.text && (
                                        <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
                                            {suggestion.placePrediction.secondaryText.text}
                                        </Typography>
                                    )}
                                </Box>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Paper>
            </Popper>
        </div>
    );
}

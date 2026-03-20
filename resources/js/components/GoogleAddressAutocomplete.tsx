import OutlinedInput from '@mui/material/OutlinedInput';
import { useEffect, useRef } from 'react';

export interface PlaceResult {
    address: string;
    latitude: number;
    longitude: number;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelected: (place: PlaceResult) => void;
    placeholder?: string;
    id?: string;
}

const MAPS_SCRIPT_ID = 'google-maps-places-script';

function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById(MAPS_SCRIPT_ID)) {
            // Script already added — wait for it to be ready
            if (window.google?.maps?.places) {
                resolve();
            } else {
                const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement;
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
            }

            return;
        }

        const script = document.createElement('script');
        script.id = MAPS_SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps script failed to load'));
        document.head.appendChild(script);
    });
}

/**
 * An address input enhanced with Google Places Autocomplete.
 * Falls back to a plain text input when the API key is not configured.
 */
export default function GoogleAddressAutocomplete({ value, onChange, onPlaceSelected, placeholder, id }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

    // Keep refs to the latest callbacks to avoid stale closures inside the effect
    const onChangeRef = useRef(onChange);
    const onPlaceSelectedRef = useRef(onPlaceSelected);
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey || !inputRef.current) {
            return;
        }

        let cancelled = false;

        loadGoogleMapsScript(apiKey)
            .then(() => {
                if (cancelled || !inputRef.current) {
                    return;
                }

                autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                    fields: ['formatted_address', 'geometry'],
                });

                // Remove any previously attached listener before adding a new one
                if (listenerRef.current) {
                    window.google.maps.event.removeListener(listenerRef.current);
                }

                listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current?.getPlace();

                    if (!place?.geometry?.location) {
                        return;
                    }

                    const address = place.formatted_address ?? '';
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    onChangeRef.current(address);
                    onPlaceSelectedRef.current({ address, latitude: lat, longitude: lng });
                });
            })
            .catch(() => {
                // Silently fall back to plain input if the script fails to load
            });

        return () => {
            cancelled = true;

            if (listenerRef.current) {
                window.google?.maps?.event?.removeListener(listenerRef.current);
                listenerRef.current = null;
            }

            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [apiKey]);

    return (
        <OutlinedInput
            inputRef={inputRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            size="small"
            fullWidth
            autoComplete="off"
        />
    );
}

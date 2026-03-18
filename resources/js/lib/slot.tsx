import * as React from 'react';

type SlotProps = {
    children?: React.ReactNode;
    [key: string]: any;
};

function mergeRefs<T>(...refs: (React.Ref<T> | undefined | null)[]): React.RefCallback<T> {
    return (el: T | null) => {
        refs.forEach((ref) => {
            if (!ref) {
                return;
            }

            if (typeof ref === 'function') {
                ref(el);
            } else {
                (ref as React.MutableRefObject<T | null>).current = el;
            }
        });
    };
}

/**
 * A lightweight Slot component that merges its props into its single child element.
 * Event handlers from both parent (Slot) and child are both called.
 * Child props take precedence over Slot props for non-event properties.
 * Refs from both are merged via a callback ref.
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, ...slotProps }, slotRef) => {
    if (!React.isValidElement(children)) {
        return <>{children}</>;
    }

    const childProps = children.props as Record<string, any>;
    const mergedProps: Record<string, any> = { ...slotProps };

    // Child props override slot props; event handlers are both called
    for (const key of Object.keys(childProps)) {
        const slotValue = slotProps[key];
        const childValue = childProps[key];

        if (key.startsWith('on') && typeof slotValue === 'function' && typeof childValue === 'function') {
            mergedProps[key] = (...args: unknown[]) => {
                (slotValue as (...a: unknown[]) => void)(...args);
                (childValue as (...a: unknown[]) => void)(...args);
            };
        } else {
            mergedProps[key] = childValue;
        }
    }

    // Merge refs
    const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;

    if (slotRef || childRef) {
        mergedProps.ref = mergeRefs(slotRef as React.Ref<HTMLElement>, childRef);
    }

    return React.cloneElement(children, mergedProps);
});
Slot.displayName = 'Slot';

export { Slot };

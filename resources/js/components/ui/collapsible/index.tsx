import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MuiCollapse from '@mui/material/Collapse';
import * as React from 'react';

interface CollapsibleContextProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextProps>({ open: false, setOpen: () => {} });

function Collapsible({
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    children,
    ...props
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    children?: React.ReactNode;
    className?: string;
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        else setUncontrolledOpen(value);
    };
    return (
        <CollapsibleContext.Provider value={{ open, setOpen }}>
            <Box {...(props as any)}>{children}</Box>
        </CollapsibleContext.Provider>
    );
}

function CollapsibleTrigger({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    const { open, setOpen } = React.useContext(CollapsibleContext);
    const handleClick = () => setOpen(!open);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
            ...(children.props as any),
        });
    }
    return (
        <ButtonBase onClick={handleClick} sx={{ display: 'block', width: '100%' }} {...(props as any)}>
            {children}
        </ButtonBase>
    );
}

function CollapsibleContent({ children, ...props }: { children?: React.ReactNode; className?: string }) {
    const { open } = React.useContext(CollapsibleContext);
    return (
        <MuiCollapse in={open} {...(props as any)}>
            {children}
        </MuiCollapse>
    );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };

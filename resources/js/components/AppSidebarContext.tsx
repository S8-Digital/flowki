import * as React from 'react';

export interface AppSidebarContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export const AppSidebarContext = React.createContext<AppSidebarContextValue>({
    open: true,
    setOpen: () => {},
    mobileOpen: false,
    setMobileOpen: () => {},
});

export function useAppSidebar() {
    return React.useContext(AppSidebarContext);
}

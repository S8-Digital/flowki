import * as React from 'react';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;
export const SIDEBAR_COOKIE = 'sidebar_state';

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

import { Slot } from '@/lib/slot';
import { PanelLeftIcon } from 'lucide-react';
import * as React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3.5rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
    state: 'expanded' | 'collapsed';
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) throw new Error('useSidebar must be used within a SidebarProvider.');
    return context;
}

function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;

    const setOpen = React.useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === 'function' ? value(open) : value;
            if (setOpenProp) setOpenProp(openState);
            else _setOpen(openState);
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [setOpenProp, open],
    );

    const toggleSidebar = React.useCallback(() => {
        return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? 'expanded' : 'collapsed';

    const contextValue = React.useMemo<SidebarContextProps>(
        () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
        [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <div
                style={
                    {
                        '--sidebar-width': SIDEBAR_WIDTH,
                        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                        ...style,
                    } as React.CSSProperties
                }
                className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
                {...props}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

function Sidebar({
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    className,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (isMobile) {
        return (
            <>
                {openMobile && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setOpenMobile(false)}
                    />
                )}
                <div
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-sidebar transition-transform duration-300 ease-in-out',
                        openMobile ? 'translate-x-0' : '-translate-x-full',
                        className,
                    )}
                    style={{ width: SIDEBAR_WIDTH_MOBILE }}
                    {...props}
                >
                    {children}
                </div>
            </>
        );
    }

    if (collapsible === 'none') {
        return (
            <div
                className={cn('flex h-full flex-col bg-sidebar border-r border-sidebar-border', className)}
                style={{ width: SIDEBAR_WIDTH }}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : ''}
            data-variant={variant}
            data-side={side}
            className={cn(
                'group peer hidden md:block text-sidebar-foreground',
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    'duration-200 relative h-svh w-[var(--sidebar-width)] bg-transparent transition-[width] ease-linear',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[side=right]:rotate-180',
                    variant === 'floating' || variant === 'inset'
                        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
                        : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
                )}
            />
            <div
                className={cn(
                    'duration-200 fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] ease-linear md:flex',
                    side === 'left'
                        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                    variant === 'floating' || variant === 'inset'
                        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
                        : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=right]:border-l group-data-[side=left]:border-r border-sidebar-border',
                )}
            >
                <div
                    data-sidebar="sidebar"
                    className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
    const { toggleSidebar } = useSidebar();
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', className)}
            onClick={(event) => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
    const { toggleSidebar } = useSidebar();
    return (
        <button
            data-sidebar="rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
                '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
                '[[data-side=left][data-state=expanded]_&]:cursor-w-resize [[data-side=right][data-state=expanded]_&]:cursor-e-resize',
                className,
            )}
            {...props}
        />
    );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
    return (
        <main
            className={cn(
                'relative flex min-h-svh flex-1 flex-col bg-background',
                'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
                className,
            )}
            {...props}
        />
    );
}

function SidebarInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            data-sidebar="input"
            className={cn(
                'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md px-2 text-sm border border-sidebar-border',
                className,
            )}
            {...props}
        />
    );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="header"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="footer"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-sidebar="separator"
            className={cn('mx-2 w-auto bg-sidebar-border', className)}
            {...props}
        />
    );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="content"
            className={cn(
                'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="group"
            className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
            {...props}
        />
    );
}

function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<'div'> & { asChild?: boolean }) {
    return (
        <div
            data-sidebar="group-label"
            className={cn(
                'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupAction({ className, asChild = false, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
    return (
        <button
            data-sidebar="group-action"
            className={cn(
                'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                'after:absolute after:-inset-2 after:md:hidden',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="group-content"
            className={cn('w-full text-sm', className)}
            {...props}
        />
    );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-sidebar="menu"
            className={cn('flex w-full min-w-0 flex-col gap-1', className)}
            {...props}
        />
    );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-sidebar="menu-item"
            className={cn('group/menu-item relative', className)}
            {...props}
        />
    );
}

const sidebarMenuButtonVariants = {
    size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
    },
};

function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = 'default',
    size = 'default',
    tooltip,
    className,
    children,
    ...props
}: React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    tooltip?: string | React.ComponentProps<'div'>;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                sidebarMenuButtonVariants.size[size],
                className,
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}

function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: React.ComponentProps<'button'> & {
    asChild?: boolean;
    showOnHover?: boolean;
}) {
    return (
        <button
            data-sidebar="menu-action"
            className={cn(
                'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
                'after:absolute after:-inset-2 after:md:hidden',
                'group-data-[collapsible=icon]:hidden',
                showOnHover && 'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-sidebar="menu-badge"
            className={cn(
                'absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none',
                'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSkeleton({ className, showIcon = false, ...props }: React.ComponentProps<'div'> & { showIcon?: boolean }) {
    const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);
    return (
        <div
            data-sidebar="menu-skeleton"
            className={cn('rounded-md h-8 flex gap-2 px-2 items-center', className)}
            {...props}
        >
            {showIcon && <div className="size-4 rounded-md bg-surface animate-pulse" data-sidebar="menu-skeleton-icon" />}
            <div
                className="h-4 flex-1 max-w-[--skeleton-width] bg-surface animate-pulse rounded-md"
                style={{ '--skeleton-width': width } as React.CSSProperties}
                data-sidebar="menu-skeleton-text"
            />
        </div>
    );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-sidebar="menu-sub"
            className={cn(
                'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
    return <li data-sidebar="menu-sub-item" className={cn(className)} {...props} />;
}

function SidebarMenuSubButton({
    asChild = false,
    size = 'md',
    isActive = false,
    className,
    children,
    ...props
}: React.ComponentProps<'a'> & {
    asChild?: boolean;
    size?: 'sm' | 'md';
    isActive?: boolean;
}) {
    const Comp = asChild ? Slot : 'a';
    return (
        <Comp
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground',
                'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}

function SidebarMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('my-1 h-px bg-sidebar-border mx-2', className)} {...props} />;
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarInput,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuSeparator,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};

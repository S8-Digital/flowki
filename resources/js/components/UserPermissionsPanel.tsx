import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { PermissionGroup } from '@/types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface Props {
    permissionGroups: PermissionGroup[];
    grantedPermissions: string[];
    onChange: (permission: string, granted: boolean) => void;
}

const groupLabels: Record<string, string> = {
    todos: 'Todos',
    chores: 'Chores',
    events: 'Calendar Events',
    shopping: 'Shopping',
    recipes: 'Recipes',
    members: 'Family Members',
    family: 'Family Settings',
    dashboard: 'Dashboard',
};

const permissionLabels: Record<string, string> = {
    'view-todos': 'View todos',
    'create-todos': 'Create todos',
    'edit-todos': 'Edit todos',
    'delete-todos': 'Delete todos',
    'view-chores': 'View chores',
    'create-chores': 'Create chores',
    'edit-chores': 'Edit chores',
    'delete-chores': 'Delete chores',
    'complete-chores': 'Complete chores',
    'view-events': 'View calendar events',
    'create-events': 'Create calendar events',
    'edit-events': 'Edit calendar events',
    'delete-events': 'Delete calendar events',
    'view-shopping': 'View shopping lists',
    'create-shopping': 'Create shopping lists',
    'edit-shopping': 'Edit shopping lists',
    'delete-shopping': 'Delete shopping lists',
    'create-shopping-items': 'Add items to shopping lists',
    'view-recipes': 'View recipes',
    'create-recipes': 'Create recipes',
    'edit-recipes': 'Edit recipes',
    'delete-recipes': 'Delete recipes',
    'view-members': 'View family members',
    'manage-members': 'Manage family members',
    'manage-family': 'Manage family settings',
    'manage-dashboard': 'Manage dashboard widgets',
};

export default function UserPermissionsPanel({ permissionGroups, grantedPermissions, onChange }: Props) {
    return (
        <Stack spacing={3}>
            {permissionGroups.map((group, index) => (
                <Box key={group.group}>
                    {index > 0 && <Separator style={{ marginBottom: 24 }} />}
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'var(--foreground)' }}>
                        {groupLabels[group.group] ?? group.group}
                    </Typography>
                    <Stack spacing={1.5}>
                        {group.permissions.map((permission) => {
                            const isGranted = grantedPermissions.includes(permission.name);

                            return (
                                <Box key={permission.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Checkbox
                                        id={`perm-${permission.name}`}
                                        checked={isGranted}
                                        onCheckedChange={(checked) => onChange(permission.name, !!checked)}
                                    />
                                    <Label htmlFor={`perm-${permission.name}`} style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 400 }}>
                                        {permissionLabels[permission.name] ?? permission.name}
                                    </Label>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}

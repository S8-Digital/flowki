import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { PermissionGroup } from '@/types';

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
        <div className="space-y-6">
            {permissionGroups.map((group, index) => (
                <div key={group.group}>
                    {index > 0 && <Separator className="mb-6" />}
                    <h4 className="mb-3 text-sm font-semibold text-foreground">{groupLabels[group.group] ?? group.group}</h4>
                    <div className="space-y-3">
                        {group.permissions.map((permission) => {
                            const isGranted = grantedPermissions.includes(permission.name);

                            return (
                                <div key={permission.name} className="flex items-center gap-3">
                                    <Checkbox
                                        id={`perm-${permission.name}`}
                                        checked={isGranted}
                                        onCheckedChange={(checked) => onChange(permission.name, !!checked)}
                                    />
                                    <Label htmlFor={`perm-${permission.name}`} className="cursor-pointer text-sm font-normal">
                                        {permissionLabels[permission.name] ?? permission.name}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

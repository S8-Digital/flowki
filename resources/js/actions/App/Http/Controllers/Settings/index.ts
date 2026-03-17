import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import CategoriesController from './CategoriesController'
import PermissionController from './PermissionController'
import NotificationPreferencesController from './NotificationPreferencesController'
import MemberColorController from './MemberColorController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    CategoriesController: Object.assign(CategoriesController, CategoriesController),
    PermissionController: Object.assign(PermissionController, PermissionController),
    NotificationPreferencesController: Object.assign(NotificationPreferencesController, NotificationPreferencesController),
    MemberColorController: Object.assign(MemberColorController, MemberColorController),
}

export default Settings
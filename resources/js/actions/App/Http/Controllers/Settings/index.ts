import TwoFactorController from './TwoFactorController'
import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import CategoriesController from './CategoriesController'
import MemberProfileController from './MemberProfileController'
import PermissionController from './PermissionController'
import NotificationPreferencesController from './NotificationPreferencesController'
import MemberColorController from './MemberColorController'
import MemberOrderController from './MemberOrderController'

const Settings = {
    TwoFactorController: Object.assign(TwoFactorController, TwoFactorController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    CategoriesController: Object.assign(CategoriesController, CategoriesController),
    MemberProfileController: Object.assign(MemberProfileController, MemberProfileController),
    PermissionController: Object.assign(PermissionController, PermissionController),
    NotificationPreferencesController: Object.assign(NotificationPreferencesController, NotificationPreferencesController),
    MemberColorController: Object.assign(MemberColorController, MemberColorController),
    MemberOrderController: Object.assign(MemberOrderController, MemberOrderController),
}

export default Settings
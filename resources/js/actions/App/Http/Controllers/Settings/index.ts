import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import CategoriesController from './CategoriesController'
import PermissionController from './PermissionController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    CategoriesController: Object.assign(CategoriesController, CategoriesController),
    PermissionController: Object.assign(PermissionController, PermissionController),
}

export default Settings
import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import CategoriesController from './CategoriesController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    CategoriesController: Object.assign(CategoriesController, CategoriesController),
}

export default Settings
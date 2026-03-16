import CategoriesController from './CategoriesController';
import PasswordController from './PasswordController';
import ProfileController from './ProfileController';

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    CategoriesController: Object.assign(CategoriesController, CategoriesController),
};

export default Settings;

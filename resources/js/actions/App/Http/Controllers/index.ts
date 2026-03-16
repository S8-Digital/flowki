import AcceptInviteController from './AcceptInviteController';
import AiController from './AiController';
import Auth from './Auth';
import CalendarEventController from './CalendarEventController';
import ChoreController from './ChoreController';
import DashboardController from './DashboardController';
import FamilyController from './FamilyController';
import GlobalSearchController from './GlobalSearchController';
import GoogleCalendarController from './GoogleCalendarController';
import RecipeController from './RecipeController';
import Settings from './Settings';
import ShoppingItemController from './ShoppingItemController';
import ShoppingListController from './ShoppingListController';
import TodoController from './TodoController';

const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    FamilyController: Object.assign(FamilyController, FamilyController),
    TodoController: Object.assign(TodoController, TodoController),
    ChoreController: Object.assign(ChoreController, ChoreController),
    CalendarEventController: Object.assign(CalendarEventController, CalendarEventController),
    ShoppingListController: Object.assign(ShoppingListController, ShoppingListController),
    ShoppingItemController: Object.assign(ShoppingItemController, ShoppingItemController),
    RecipeController: Object.assign(RecipeController, RecipeController),
    AiController: Object.assign(AiController, AiController),
    GlobalSearchController: Object.assign(GlobalSearchController, GlobalSearchController),
    Settings: Object.assign(Settings, Settings),
    GoogleCalendarController: Object.assign(GoogleCalendarController, GoogleCalendarController),
    Auth: Object.assign(Auth, Auth),
    AcceptInviteController: Object.assign(AcceptInviteController, AcceptInviteController),
};

export default Controllers;

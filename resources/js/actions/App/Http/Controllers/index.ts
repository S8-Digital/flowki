import FirebaseServiceWorkerController from './FirebaseServiceWorkerController'
import DashboardController from './DashboardController'
import FamilyController from './FamilyController'
import TodoController from './TodoController'
import ChoreController from './ChoreController'
import CalendarEventController from './CalendarEventController'
import ShoppingListController from './ShoppingListController'
import ShoppingItemController from './ShoppingItemController'
import RecipeController from './RecipeController'
import AiController from './AiController'
import GlobalSearchController from './GlobalSearchController'
import FcmTokenController from './FcmTokenController'
import Settings from './Settings'
import GoogleCalendarController from './GoogleCalendarController'
import Auth from './Auth'
import AcceptInviteController from './AcceptInviteController'

const Controllers = {
    FirebaseServiceWorkerController: Object.assign(FirebaseServiceWorkerController, FirebaseServiceWorkerController),
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
    FcmTokenController: Object.assign(FcmTokenController, FcmTokenController),
    Settings: Object.assign(Settings, Settings),
    GoogleCalendarController: Object.assign(GoogleCalendarController, GoogleCalendarController),
    Auth: Object.assign(Auth, Auth),
    AcceptInviteController: Object.assign(AcceptInviteController, AcceptInviteController),
}

export default Controllers
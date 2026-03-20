import Auth from './Auth'
import Settings from './Settings'
import FirebaseServiceWorkerController from './FirebaseServiceWorkerController'
import DashboardController from './DashboardController'
import FamilyController from './FamilyController'
import TodoController from './TodoController'
import ChoreController from './ChoreController'
import CalendarEventController from './CalendarEventController'
import ScheduleController from './ScheduleController'
import ShoppingListController from './ShoppingListController'
import ShoppingItemController from './ShoppingItemController'
import RecipeController from './RecipeController'
import AiController from './AiController'
import GlobalSearchController from './GlobalSearchController'
import FcmTokenController from './FcmTokenController'
import WeatherController from './WeatherController'
import NotificationController from './NotificationController'
import GoogleCalendarController from './GoogleCalendarController'
import AcceptInviteController from './AcceptInviteController'

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    Settings: Object.assign(Settings, Settings),
    FirebaseServiceWorkerController: Object.assign(FirebaseServiceWorkerController, FirebaseServiceWorkerController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    FamilyController: Object.assign(FamilyController, FamilyController),
    TodoController: Object.assign(TodoController, TodoController),
    ChoreController: Object.assign(ChoreController, ChoreController),
    CalendarEventController: Object.assign(CalendarEventController, CalendarEventController),
    ScheduleController: Object.assign(ScheduleController, ScheduleController),
    ShoppingListController: Object.assign(ShoppingListController, ShoppingListController),
    ShoppingItemController: Object.assign(ShoppingItemController, ShoppingItemController),
    RecipeController: Object.assign(RecipeController, RecipeController),
    AiController: Object.assign(AiController, AiController),
    GlobalSearchController: Object.assign(GlobalSearchController, GlobalSearchController),
    FcmTokenController: Object.assign(FcmTokenController, FcmTokenController),
    WeatherController: Object.assign(WeatherController, WeatherController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    GoogleCalendarController: Object.assign(GoogleCalendarController, GoogleCalendarController),
    AcceptInviteController: Object.assign(AcceptInviteController, AcceptInviteController),
}

export default Controllers
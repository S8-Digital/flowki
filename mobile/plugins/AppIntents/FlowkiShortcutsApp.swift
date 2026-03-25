// FlowkiShortcutsApp.swift
//
// Registers pre-built Siri phrase suggestions so users can immediately say
// "Hey Siri, add milk to my Flowki list" without manually creating a Shortcut.
// Siri and the Shortcuts app surface these as App Shortcuts.
//
// Requires iOS 16+ (App Intents framework).

import AppIntents

struct FlowkiAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddShoppingItemIntent(),
            phrases: [
                "Add \(\.$item) to my \(.applicationName) list",
                "Add \(\.$item) to my \(.applicationName) shopping list",
                "Put \(\.$item) on my \(.applicationName) list",
                "Add \(\.$item) to \(.applicationName)",
            ],
            shortTitle: "Add Shopping Item",
            systemImageName: "cart.badge.plus"
        )
        AppShortcut(
            intent: CreateTodoIntent(),
            phrases: [
                "Add \(\.$title) to my \(.applicationName) to-dos",
                "Create a \(.applicationName) task for \(\.$title)",
                "Remind me to \(\.$title) on \(.applicationName)",
                "Add a \(.applicationName) to-do for \(\.$title)",
            ],
            shortTitle: "Create To-Do",
            systemImageName: "checklist"
        )
        AppShortcut(
            intent: GetTodayScheduleIntent(),
            phrases: [
                "What's on my \(.applicationName) schedule",
                "Show my \(.applicationName) schedule today",
                "What do I have on \(.applicationName) today",
                "Check my \(.applicationName) calendar",
            ],
            shortTitle: "Today's Schedule",
            systemImageName: "calendar"
        )
        AppShortcut(
            intent: CompleteChoreIntent(),
            phrases: [
                "Mark \(\.$chore) done on \(.applicationName)",
                "I finished \(\.$chore) on \(.applicationName)",
                "Complete \(\.$chore) on \(.applicationName)",
                "I did \(\.$chore) on \(.applicationName)",
            ],
            shortTitle: "Complete Chore",
            systemImageName: "checkmark.circle"
        )
        AppShortcut(
            intent: AddChoreIntent(),
            phrases: [
                "Add \(\.$chore) to my \(.applicationName) chores",
                "Create a \(.applicationName) chore for \(\.$chore)",
                "Add a chore to \(.applicationName) for \(\.$chore)",
                "New \(.applicationName) chore: \(\.$chore)",
            ],
            shortTitle: "Add Chore",
            systemImageName: "figure.cleaning"
        )
        AppShortcut(
            intent: AddCalendarItemIntent(),
            phrases: [
                "Add \(\.$event) to my \(.applicationName) calendar",
                "Schedule \(\.$event) on \(.applicationName)",
                "Create a \(.applicationName) event for \(\.$event)",
                "Add a \(.applicationName) calendar event for \(\.$event)",
            ],
            shortTitle: "Add Calendar Event",
            systemImageName: "calendar.badge.plus"
        )
    }
}

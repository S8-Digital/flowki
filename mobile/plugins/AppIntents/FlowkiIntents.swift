// FlowkiIntents.swift
//
// Defines the six App Intents that surface as Siri voice commands in iOS 16+.
// All intents call the Flowki voice-command API, which routes the natural-language
// phrase through the FamilyAssistantAgent to Postgres + RTDB sync.
//
// Intent → API flow:
//   Siri → AppIntent.perform() → POST /api/mobile/voice/command → AI agent → DB + RTDB
//
// The auth token is read directly from the iOS Keychain where expo-secure-store
// wrote it under the key "flowki_auth_token" (service = bundle identifier).

import AppIntents
import Foundation
import Security

// MARK: - Keychain helper

private func readKeychainString(key: String, service: String) -> String? {
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: service,
        kSecAttrAccount: key,
        kSecReturnData: true,
        kSecMatchLimit: kSecMatchLimitOne,
    ]
    var item: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess, let data = item as? Data else { return nil }
    return String(data: data, encoding: .utf8)
}

// MARK: - Shared API client

private enum FlowkiIntentError: Error, LocalizedError {
    case notAuthenticated
    case invalidConfiguration
    case serverError(String)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Please open Flowki and log in before using Siri commands."
        case .invalidConfiguration:
            return "Invalid API URL configuration."
        case .serverError(let msg):
            return msg
        case .networkError(let err):
            return "Could not reach Flowki: \(err.localizedDescription)"
        }
    }
}

private struct VoiceCommandResponse: Decodable {
    let success: Bool
    let response: String
}

private func sendVoiceCommand(_ command: String) async throws -> String {
    let bundleID = Bundle.main.bundleIdentifier ?? "com.s8digital.flowki"

    guard let token = readKeychainString(key: "flowki_auth_token", service: bundleID) else {
        throw FlowkiIntentError.notAuthenticated
    }

    let apiURL = Bundle.main.object(forInfoDictionaryKey: "FLOWKI_API_URL") as? String
        ?? "https://flowki.family"

    guard let url = URL(string: "\(apiURL)/api/mobile/voice/command") else {
        throw FlowkiIntentError.invalidConfiguration
    }

    var request = URLRequest(url: url, timeoutInterval: 30)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.httpBody = try JSONEncoder().encode(["command": command])

    let (data, urlResponse): (Data, URLResponse)
    do {
        (data, urlResponse) = try await URLSession.shared.data(for: request)
    } catch {
        throw FlowkiIntentError.networkError(error)
    }

    if let httpResponse = urlResponse as? HTTPURLResponse {
        if httpResponse.statusCode == 401 {
            throw FlowkiIntentError.notAuthenticated
        }
        if !(200..<300).contains(httpResponse.statusCode) {
            struct ErrorBody: Decodable { let response: String?; let message: String? }
            let errorBody = try? JSONDecoder().decode(ErrorBody.self, from: data)
            let msg = errorBody?.response ?? errorBody?.message
                ?? "Server error (\(httpResponse.statusCode))."
            throw FlowkiIntentError.serverError(msg)
        }
    }

    let decoded = try JSONDecoder().decode(VoiceCommandResponse.self, from: data)
    guard decoded.success else {
        throw FlowkiIntentError.serverError(decoded.response)
    }
    return decoded.response
}

// MARK: - CreateTodoIntent

@available(iOS 16.0, *)
struct CreateTodoIntent: AppIntent {
    static let title: LocalizedStringResource = "Create a To-Do"
    static let description = IntentDescription(
        "Add a new to-do item to your Flowki family list.",
        categoryName: "Todos"
    )
    static let openAppWhenRun: Bool = false

    @Parameter(
        title: "Title",
        description: "What would you like to add to your to-do list?",
        requestValueDialog: IntentDialog("What should I add to your to-do list?")
    )
    var title: String

    func perform() async throws -> some ProvidesDialog {
        let command = "Create a todo: \(title)"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

// MARK: - AddShoppingItemIntent

@available(iOS 16.0, *)
struct AddShoppingItemIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Shopping Item"
    static let description = IntentDescription(
        "Add an item to your Flowki family shopping list.",
        categoryName: "Shopping"
    )
    static let openAppWhenRun: Bool = false

    @Parameter(
        title: "Item",
        description: "What would you like to add to your shopping list?",
        requestValueDialog: IntentDialog("What should I add to your shopping list?")
    )
    var item: String

    func perform() async throws -> some ProvidesDialog {
        let command = "Add \(item) to my shopping list"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

// MARK: - GetTodayScheduleIntent

@available(iOS 16.0, *)
struct GetTodayScheduleIntent: AppIntent {
    static let title: LocalizedStringResource = "Get Today's Schedule"
    static let description = IntentDescription(
        "Hear what's on your Flowki family calendar today.",
        categoryName: "Calendar"
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some ProvidesDialog {
        let command = "What's on my schedule today?"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

// MARK: - CompleteChoreIntent

@available(iOS 16.0, *)
struct CompleteChoreIntent: AppIntent {
    static let title: LocalizedStringResource = "Complete a Chore"
    static let description = IntentDescription(
        "Mark a chore as done in Flowki.",
        categoryName: "Chores"
    )
    static let openAppWhenRun: Bool = false

    @Parameter(
        title: "Chore",
        description: "Which chore did you complete?",
        requestValueDialog: IntentDialog("Which chore did you complete?")
    )
    var chore: String

    func perform() async throws -> some ProvidesDialog {
        let command = "Mark \(chore) as done"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

// MARK: - AddChoreIntent

@available(iOS 16.0, *)
struct AddChoreIntent: AppIntent {
    static let title: LocalizedStringResource = "Add a Chore"
    static let description = IntentDescription(
        "Create a new chore in your Flowki family chore list.",
        categoryName: "Chores"
    )
    static let openAppWhenRun: Bool = false

    @Parameter(
        title: "Chore",
        description: "What chore would you like to add?",
        requestValueDialog: IntentDialog("What chore should I add?")
    )
    var chore: String

    func perform() async throws -> some ProvidesDialog {
        let command = "Add a chore: \(chore)"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

// MARK: - AddCalendarItemIntent

@available(iOS 16.0, *)
struct AddCalendarItemIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Calendar Event"
    static let description = IntentDescription(
        "Add a new event to your Flowki family calendar.",
        categoryName: "Calendar"
    )
    static let openAppWhenRun: Bool = false

    @Parameter(
        title: "Event",
        description: "What event would you like to add?",
        requestValueDialog: IntentDialog("What event should I add to your calendar?")
    )
    var event: String

    func perform() async throws -> some ProvidesDialog {
        let command = "Add a calendar event: \(event)"
        do {
            let response = try await sendVoiceCommand(command)
            return .result(dialog: IntentDialog(stringLiteral: response))
        } catch {
            return .result(dialog: IntentDialog(stringLiteral: error.localizedDescription))
        }
    }
}

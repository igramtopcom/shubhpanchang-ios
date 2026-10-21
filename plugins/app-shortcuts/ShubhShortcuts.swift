// Siri, Spotlight and Shortcuts: "Today's tithi" and "Next vrat", ready as
// soon as the app is installed (App Shortcuts need no setup).
//
// The app writes the answers ahead of time (src/components/siri-sync.tsx)
// into its standard UserDefaults as JSON, one line per date for the coming
// two weeks, in English: Siri has no Gujarati voice. The intents only pick
// the line for today, so they answer even when the app has not run for days.
import AppIntents
import Foundation

private func answer(_ key: String, fallback: String) -> String {
  guard
    let json = UserDefaults.standard.string(forKey: key),
    let data = json.data(using: .utf8),
    let rows = try? JSONDecoder().decode([String: String].self, from: data)
  else { return fallback }
  let f = DateFormatter()
  f.calendar = Calendar(identifier: .gregorian)
  f.locale = Locale(identifier: "en_US_POSIX")
  f.dateFormat = "yyyy-MM-dd"
  // The coming entry: today's, else the next one written (dates sort as text).
  let today = f.string(from: Date())
  if let line = rows[today] { return line }
  if let next = rows.keys.sorted().first(where: { $0 > today }) { return rows[next] ?? fallback }
  return fallback
}

private let openFirst = "Open ShubhPanchang once to set your place, and ask again."

struct TodayTithiIntent: AppIntent {
  static let title: LocalizedStringResource = "Today's Tithi"
  static let description = IntentDescription("Today's tithi, Rahu Kaal and the next good time at your place.")

  func perform() async throws -> some IntentResult & ProvidesDialog {
    .result(dialog: "\(answer("siri.today", fallback: openFirst))")
  }
}

struct NextVratIntent: AppIntent {
  static let title: LocalizedStringResource = "Next Vrat"
  static let description = IntentDescription("The coming fast at your place and when to break it.")

  func perform() async throws -> some IntentResult & ProvidesDialog {
    .result(dialog: "\(answer("siri.vrat", fallback: openFirst))")
  }
}

struct ShubhShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: TodayTithiIntent(),
      phrases: [
        "Today's tithi in \(.applicationName)",
        "What is the tithi today in \(.applicationName)",
        "\(.applicationName) today",
      ],
      shortTitle: "Today's Tithi",
      systemImageName: "moon.stars"
    )
    AppShortcut(
      intent: NextVratIntent(),
      phrases: [
        "Next vrat in \(.applicationName)",
        "When is the next Ekadashi in \(.applicationName)",
        "Next fast in \(.applicationName)",
      ],
      shortTitle: "Next Vrat",
      systemImageName: "fork.knife"
    )
  }
}

import SwiftUI
@preconcurrency import WatchConnectivity

struct WatchRunnerState: Decodable {
    let protocolVersion: Int
    let sessionId: String
    let revision: Int
    let sentAt: Date
    let currentExerciseEndsAt: Date?
    let status: String
    let currentIndex: Int
    let totalExercises: Int
    let currentExercise: WatchExercise?
    let nextExercise: WatchExercise?
    let appearance: WatchAppearance

    private enum CodingKeys: String, CodingKey { case protocolVersion, sessionId, revision, sentAt, currentExerciseEndsAt, status, currentIndex, totalExercises, currentExercise, nextExercise, appearance }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        protocolVersion = try container.decode(Int.self, forKey: .protocolVersion)
        sessionId = try container.decode(String.self, forKey: .sessionId)
        revision = try container.decode(Int.self, forKey: .revision)
        sentAt = try Self.decodeDate(container.decode(String.self, forKey: .sentAt))
        if let value = try container.decodeIfPresent(String.self, forKey: .currentExerciseEndsAt) { currentExerciseEndsAt = try Self.decodeDate(value) } else { currentExerciseEndsAt = nil }
        status = try container.decode(String.self, forKey: .status)
        currentIndex = try container.decode(Int.self, forKey: .currentIndex)
        totalExercises = try container.decode(Int.self, forKey: .totalExercises)
        currentExercise = try container.decodeIfPresent(WatchExercise.self, forKey: .currentExercise)
        nextExercise = try container.decodeIfPresent(WatchExercise.self, forKey: .nextExercise)
        appearance = try container.decodeIfPresent(WatchAppearance.self, forKey: .appearance) ?? .fallback
    }

    private static func decodeDate(_ value: String) throws -> Date {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: value) { return date }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: value) { return date }
        throw DecodingError.dataCorrupted(.init(codingPath: [], debugDescription: "Invalid runner timestamp"))
    }

    var controlCommand: String? { switch status { case "ready", "setup": return "start"; case "running": return "pause"; case "paused": return "resume"; default: return nil } }
    func remainingSeconds(at now: Date) -> Int {
        let remaining = max(0, currentExercise?.remainingSeconds ?? 0)
        guard status == "running" else { return remaining }
        if let currentExerciseEndsAt { return max(0, Int(ceil(currentExerciseEndsAt.timeIntervalSince(now)))) }
        return max(0, remaining - Int(now.timeIntervalSince(sentAt)))
    }
    func commandPayload(command: String, messageId: String) -> [String: Any] { ["type": "runner.command", "protocolVersion": protocolVersion, "sessionId": sessionId, "messageId": messageId, "sentAt": ISO8601DateFormatter().string(from: .now), "command": command, "baseRevision": revision] }
}

struct WatchExercise: Decodable { let name: String; let remainingSeconds: Int?; let durationSeconds: Int? }
struct WatchAppearance: Decodable {
    let accent: String
    let background: String
    let text: String
    let secondaryText: String
    let timerNormal: String
    let timerWarning: String
    let timerDanger: String
    static let fallback = WatchAppearance(accent: "#ed6b9c", background: "#f7faf9", text: "#173c35", secondaryText: "#436055", timerNormal: "#000000", timerWarning: "#a8631f", timerDanger: "#a53d50")
}

struct ContentView: View {
    @ObservedObject var session: WatchSessionStore
    var body: some View {
        Group {
            if let state = session.state, state.totalExercises > 0 {
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    WatchRunnerView(state: state, now: context.date, session: session)
                }.id("\(state.sessionId)-\(state.revision)")
            } else {
                VStack(spacing: 6) { Image(systemName: "timer").font(.title2); Text("PilateSafe").font(.headline); Text(session.isReachable ? "Start a flow on your iPhone" : "Open PilateSafe on your iPhone").font(.caption).multilineTextAlignment(.center) }.padding()
            }
        }.background(Color(hex: session.state?.appearance.background ?? WatchAppearance.fallback.background)).preferredColorScheme(.light).task { session.activate() }
    }
}

private struct WatchRunnerView: View {
    let state: WatchRunnerState
    let now: Date
    @ObservedObject var session: WatchSessionStore

    private var remaining: String { String(format: "%02d:%02d", state.remainingSeconds(at: now) / 60, state.remainingSeconds(at: now) % 60) }

    var body: some View {
        VStack(spacing: 5) {
            Text(remaining).font(.system(size: 35, weight: .bold, design: .rounded)).monospacedDigit().foregroundStyle(Color(hex: state.appearance.timerNormal))
            Text(state.currentExercise?.name ?? "Class complete").font(.headline).multilineTextAlignment(.center).lineLimit(2).foregroundStyle(Color(hex: state.appearance.accent))
            Text("NEXT").font(.caption2).fontWeight(.semibold).foregroundStyle(Color(hex: state.appearance.secondaryText))
            Text(state.nextExercise?.name ?? "Class complete").font(.caption).multilineTextAlignment(.center).lineLimit(2).foregroundStyle(Color(hex: state.appearance.text))
            HStack(spacing: 4) {
                Button { session.send(command: state.status == "paused" ? "resume" : "start") } label: { Image(systemName: "play.fill").frame(maxWidth: .infinity, minHeight: 38) }.disabled(state.status == "running" || state.controlCommand == nil)
                Button { session.send(command: "pause") } label: { Image(systemName: "pause.fill").frame(maxWidth: .infinity, minHeight: 38) }.disabled(state.status != "running")
                Button { session.send(command: "stop") } label: { Image(systemName: "stop.fill").frame(maxWidth: .infinity, minHeight: 38) }.disabled(state.controlCommand == nil)
                Button { session.send(command: "next") } label: { VStack(spacing: 1) { Image(systemName: "forward.end.fill"); Text("Next").font(.system(size: 8, weight: .semibold)) }.frame(maxWidth: .infinity, minHeight: 38) }.disabled(state.currentIndex >= state.totalExercises - 1 || state.controlCommand == nil).accessibilityLabel("Next exercise")
            }.buttonStyle(.bordered).tint(Color(hex: state.appearance.accent)).disabled(!session.isReachable)
            Text("\(state.currentIndex + 1) of \(state.totalExercises)").font(.caption2).foregroundStyle(Color(hex: state.appearance.secondaryText))
        }.padding(.horizontal, 8).padding(.vertical, 3).foregroundStyle(Color(hex: state.appearance.text))
    }
}

private extension Color {
    init(hex: String) {
        let digits = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        let value = UInt32(digits, radix: 16) ?? 0
        self.init(.sRGB, red: Double((value >> 16) & 255) / 255, green: Double((value >> 8) & 255) / 255, blue: Double(value & 255) / 255)
    }
}

@MainActor
final class WatchSessionStore: NSObject, ObservableObject, WCSessionDelegate {
    @Published private(set) var state: WatchRunnerState?
    @Published private(set) var isReachable = false
    private let session = WCSession.default
    func activate() { guard WCSession.isSupported() else { return }; session.delegate = self; session.activate(); isReachable = session.isReachable; if !session.receivedApplicationContext.isEmpty { apply(session.receivedApplicationContext) } }
    func send(command: String) { guard session.isReachable, let state, let data = try? JSONSerialization.data(withJSONObject: state.commandPayload(command: command, messageId: UUID().uuidString)), let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }; session.sendMessage(payload, replyHandler: nil) }
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { Task { @MainActor in self.isReachable = session.isReachable; if !session.receivedApplicationContext.isEmpty { self.apply(session.receivedApplicationContext) } } }
    nonisolated func sessionReachabilityDidChange(_ session: WCSession) { Task { @MainActor in self.isReachable = session.isReachable } }
    nonisolated func session(_ session: WCSession, didReceiveMessage message: [String: Any]) { Task { @MainActor in self.apply(message) } }
    nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) { Task { @MainActor in self.apply(applicationContext) } }
#if os(iOS)
    nonisolated func sessionDidBecomeInactive(_ session: WCSession) { Task { @MainActor in self.isReachable = false } }
    nonisolated func sessionDidDeactivate(_ session: WCSession) { Task { @MainActor in self.isReachable = false } }
#endif
    private func apply(_ payload: [String: Any]) {
        guard payload["type"] as? String == "runner.state", let data = try? JSONSerialization.data(withJSONObject: payload), let next = try? JSONDecoder().decode(WatchRunnerState.self, from: data), next.protocolVersion == 1 else { return }
        if let current = state {
            if next.sessionId == current.sessionId {
                guard next.revision > current.revision || (next.revision == current.revision && next.sentAt >= current.sentAt) else { return }
            } else {
                guard next.sentAt >= current.sentAt else { return }
            }
        }
        state = next
    }
}

@main
struct PilateSafeWatchApp: App {
    @StateObject private var session = WatchSessionStore()
    var body: some Scene { WindowGroup { ContentView(session: session) } }
}

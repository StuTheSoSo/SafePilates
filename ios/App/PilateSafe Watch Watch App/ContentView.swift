import SwiftUI
@preconcurrency import WatchConnectivity

struct WatchRunnerState: Decodable {
    let protocolVersion: Int
    let sessionId: String
    let revision: Int
    let sentAt: Date
    let status: String
    let currentIndex: Int
    let totalExercises: Int
    let currentExercise: WatchExercise?
    let nextExercise: WatchExercise?

    var controlCommand: String? {
        switch status { case "ready": return "start"; case "running": return "pause"; case "paused": return "resume"; default: return nil }
    }

    func remainingSeconds(at now: Date) -> Int {
        let remaining = max(0, currentExercise?.remainingSeconds ?? 0)
        guard status == "running" else { return remaining }
        return max(0, remaining - Int(now.timeIntervalSince(sentAt)))
    }

    func commandPayload(command: String, messageId: String) -> [String: Any] {
        ["type": "runner.command", "protocolVersion": protocolVersion, "sessionId": sessionId, "messageId": messageId, "sentAt": ISO8601DateFormatter().string(from: .now), "command": command, "baseRevision": revision]
    }
}

struct WatchExercise: Decodable { let name: String; let remainingSeconds: Int?; let durationSeconds: Int? }

struct ContentView: View {
    @ObservedObject var session: WatchSessionStore
    var body: some View {
        VStack(spacing: 5) {
            if let state = session.state {
                Text(String(format: "%02d:%02d", state.remainingSeconds(at: .now) / 60, state.remainingSeconds(at: .now) % 60)).font(.system(size: 35, weight: .bold, design: .rounded)).monospacedDigit()
                Text(state.currentExercise?.name ?? "Class complete").font(.headline).multilineTextAlignment(.center).lineLimit(2)
                Text("Next: \(state.nextExercise?.name ?? "Done")").font(.caption2).foregroundStyle(.secondary).multilineTextAlignment(.center).lineLimit(2)
                HStack {
                    Button { session.send(command: state.status == "paused" ? "resume" : "start") } label: { Image(systemName: "play.fill") }.disabled(state.status == "running" || state.controlCommand == nil)
                    Button { session.send(command: "pause") } label: { Image(systemName: "pause.fill") }.disabled(state.status != "running")
                    Button { session.send(command: "stop") } label: { Image(systemName: "stop.fill") }.disabled(state.controlCommand == nil)
                }.buttonStyle(.bordered).disabled(!session.isReachable)
                Text("\(state.currentIndex + 1) of \(state.totalExercises)").font(.caption2).foregroundStyle(.secondary)
            } else {
                Image(systemName: "timer").font(.title2)
                Text("PilateSafe").font(.headline)
                Text(session.isReachable ? "Start a flow on your iPhone" : "Open PilateSafe on your iPhone").font(.caption).multilineTextAlignment(.center)
            }
        }.padding().task { session.activate() }
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
    private func apply(_ payload: [String: Any]) { guard payload["type"] as? String == "runner.state", let data = try? JSONSerialization.data(withJSONObject: payload), let next = try? JSONDecoder().decode(WatchRunnerState.self, from: data), next.protocolVersion == 1 else { return }; state = next }
}

@main
struct PilateSafeWatchApp: App {
    @StateObject private var session = WatchSessionStore()
    var body: some Scene { WindowGroup { ContentView(session: session) } }
}
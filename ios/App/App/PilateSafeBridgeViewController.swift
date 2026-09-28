import Capacitor
import UIKit
import WatchConnectivity

class PilateSafeBridgeViewController: CAPBridgeViewController {
    override func setScreenOrientationDefaults() {
        supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(WatchBridgePlugin())
    }
}

@objc(WatchBridgePlugin)
class WatchBridgePlugin: CAPPlugin, CAPBridgedPlugin, WCSessionDelegate {
    let identifier = "WatchBridgePlugin"
    let jsName = "WatchBridge"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendAcknowledgement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestState", returnType: CAPPluginReturnPromise)
    ]

    private var session: WCSession? { WCSession.isSupported() ? WCSession.default : nil }
    private var pendingState: [String: Any]?
    private var stateRetryWorkItem: DispatchWorkItem?
    private var stateRetryCount = 0

    override func load() {
        guard let session else { return }
        session.delegate = self
        session.activate()
    }

    @objc func isAvailable(_ call: CAPPluginCall) { call.resolve(connectionState()) }

    @objc func sendState(_ call: CAPPluginCall) {
        guard let state = call.getObject("state") else { call.reject("A runner state message is required."); return }
        guard let session else { call.reject("WatchConnectivity is unavailable on this device."); return }
        pendingState = state
        stateRetryWorkItem?.cancel()
        stateRetryWorkItem = nil
        stateRetryCount = 0
        guard session.activationState == .activated else { session.activate(); call.resolve(); return }
        deliverPendingState(using: session)
        call.resolve()
    }

    @objc func sendAcknowledgement(_ call: CAPPluginCall) {
        guard let acknowledgement = call.getObject("acknowledgement"), let session else { call.reject("WatchConnectivity is unavailable on this device."); return }
        if session.isReachable { session.sendMessage(acknowledgement, replyHandler: nil) { _ in } }
        call.resolve()
    }

    @objc func requestState(_ call: CAPPluginCall) { notifyListeners("connectionChanged", data: connectionState()); call.resolve() }

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        guard activationState == .activated else { return }
        deliverPendingState(using: session)
        DispatchQueue.main.async { [weak self] in self?.notifyListeners("connectionChanged", data: self?.connectionState() ?? [:]) }
    }

    func sessionDidBecomeInactive(_ session: WCSession) { notifyListeners("connectionChanged", data: connectionState()) }
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }
    func sessionReachabilityDidChange(_ session: WCSession) { deliverPendingState(using: session); notifyListeners("connectionChanged", data: connectionState()) }
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) { forwardCommand(message) }
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) { forwardCommand(applicationContext) }

    private func forwardCommand(_ message: [String: Any]) {
        guard message["type"] as? String == "runner.command" else { return }
        DispatchQueue.main.async { [weak self] in self?.notifyListeners("command", data: message, retainUntilConsumed: true) }
    }

    private func deliverPendingState(using session: WCSession) {
        guard let pendingState, session.activationState == .activated else { return }
        let sentState = pendingState
        if session.isReachable {
            session.sendMessage(sentState, replyHandler: nil) { [weak self] error in
                NSLog("[PilateSafe WatchBridge] Live state delivery failed: %@", error.localizedDescription)
                DispatchQueue.main.async { [weak self] in
                    guard let self,
                          self.pendingState?["sessionId"] as? String == sentState["sessionId"] as? String,
                          self.pendingState?["revision"] as? Int == sentState["revision"] as? Int,
                          self.stateRetryCount == 0 else { return }
                    self.stateRetryCount = 1
                    let retry = DispatchWorkItem { [weak self] in
                        guard let self else { return }
                        self.stateRetryWorkItem = nil
                        self.deliverPendingState(using: session)
                    }
                    self.stateRetryWorkItem = retry
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.35, execute: retry)
                }
            }
        }
        do { try session.updateApplicationContext(sentState) }
        catch { NSLog("[PilateSafe WatchBridge] Application context update failed: %@", error.localizedDescription) }
    }

    private func connectionState() -> JSObject {
        guard let session else { return ["available": false, "paired": false, "reachable": false] }
        return ["available": true, "paired": session.isPaired && session.isWatchAppInstalled, "reachable": session.isReachable]
    }
}
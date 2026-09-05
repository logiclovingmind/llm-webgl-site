// Cross-component signal bus. A plain mutable object read by the 3D core and
// written by the demo — avoids wiring context/props through the whole tree.
export const burstSignal = {
  burst: 0, // epoch-ms of the last "decision" — Core3D reads this to pulse
}

export function fireBurst() {
  burstSignal.burst = Date.now()
}

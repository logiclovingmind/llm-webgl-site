// Single source of truth for scroll progress (0..1) shared between the
// HTML overlay and the 3D camera rig.
export const scrollState = {
  progress: 0,
  // epoch-ms of the last "decision" burst (set by the hero demo)
  burst: 0,
}

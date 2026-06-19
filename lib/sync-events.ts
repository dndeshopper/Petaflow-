export const PETALS_CHANGED_EVENT = "petalflow:petals-changed";

export function notifyPetalsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PETALS_CHANGED_EVENT));
  }
}

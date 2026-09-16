export const WORKSPACE_MODE_KEY = "bp_workspace_mode";
export const WORKSPACE_MODE_EVENT = "bp-workspace-mode";

export type WorkspaceMode = "simple" | "pro";

export function readWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") return "simple";
  try {
    return localStorage.getItem(WORKSPACE_MODE_KEY) === "pro" ? "pro" : "simple";
  } catch {
    return "simple";
  }
}

export function writeWorkspaceMode(mode: WorkspaceMode): void {
  try {
    localStorage.setItem(WORKSPACE_MODE_KEY, mode);
  } catch {
    /* нопазир */
  }
  window.dispatchEvent(new Event(WORKSPACE_MODE_EVENT));
}

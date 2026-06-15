import { toast } from "sonner";
import { create } from "zustand";

import {
  checkForUpdate,
  installPendingUpdate,
  type UpdateCheckResult,
} from "@/lib/tauri/update-manager";
import { useSettingsStore } from "@/stores/settings-store";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "up_to_date"
  | "available"
  | "downloading"
  | "error";

interface RunCheckOptions {
  silent?: boolean;
}

interface UpdateState {
  status: UpdateStatus;
  currentVersion: string | null;
  nextVersion: string | null;
  releaseNotes: string | null;
  downloadProgress: number | null;
  errorMessage: string | null;
  dialogOpen: boolean;
  runCheck: (options?: RunCheckOptions) => Promise<void>;
  dismissDialog: () => void;
  installUpdate: () => Promise<void>;
}

function applyCheckResult(
  result: UpdateCheckResult,
  silent: boolean,
  set: (partial: Partial<UpdateState>) => void,
) {
  const setLastUpdateCheckAt = useSettingsStore.getState().setLastUpdateCheckAt;
  setLastUpdateCheckAt(new Date().toISOString());

  if (result.status === "up_to_date") {
    set({
      status: "up_to_date",
      currentVersion: result.version,
      nextVersion: null,
      releaseNotes: null,
      errorMessage: null,
      dialogOpen: false,
    });
    if (!silent) {
      toast.success("You're up to date", {
        description: `Version ${result.version}`,
      });
    }
    return;
  }

  if (result.status === "available") {
    set({
      status: "available",
      currentVersion: result.currentVersion,
      nextVersion: result.nextVersion,
      releaseNotes: result.body ?? null,
      errorMessage: null,
      dialogOpen: true,
    });
    return;
  }

  set({
    status: "error",
    errorMessage: result.message,
    dialogOpen: !silent,
  });

  if (!silent) {
    toast.error("Update check failed", {
      description: result.message,
    });
  }
}

export const useUpdateStore = create<UpdateState>((set) => ({
  status: "idle",
  currentVersion: null,
  nextVersion: null,
  releaseNotes: null,
  downloadProgress: null,
  errorMessage: null,
  dialogOpen: false,

  runCheck: async (options = {}) => {
    const { silent = false } = options;
    set({
      status: "checking",
      errorMessage: null,
      downloadProgress: null,
    });

    const result = await checkForUpdate();
    applyCheckResult(result, silent, set);
  },

  dismissDialog: () => {
    set({
      dialogOpen: false,
      downloadProgress: null,
    });
  },

  installUpdate: async () => {
    set({ status: "downloading", downloadProgress: 0, errorMessage: null });

    const result = await installPendingUpdate((percent) => {
      set({ downloadProgress: percent });
    });

    if (result.status === "error") {
      set({
        status: "error",
        errorMessage: result.message,
        downloadProgress: null,
      });
    }
  },
}));

export function useUpdateCheck() {
  const status = useUpdateStore((s) => s.status);
  const currentVersion = useUpdateStore((s) => s.currentVersion);
  const nextVersion = useUpdateStore((s) => s.nextVersion);
  const releaseNotes = useUpdateStore((s) => s.releaseNotes);
  const downloadProgress = useUpdateStore((s) => s.downloadProgress);
  const errorMessage = useUpdateStore((s) => s.errorMessage);
  const dialogOpen = useUpdateStore((s) => s.dialogOpen);
  const runCheck = useUpdateStore((s) => s.runCheck);
  const dismissDialog = useUpdateStore((s) => s.dismissDialog);
  const installUpdate = useUpdateStore((s) => s.installUpdate);
  const lastUpdateCheckAt = useSettingsStore((s) => s.lastUpdateCheckAt);

  const isChecking = status === "checking";
  const isDownloading = status === "downloading";
  const hasUpdate = status === "available" || (dialogOpen && nextVersion !== null);

  return {
    status,
    currentVersion,
    nextVersion,
    releaseNotes,
    downloadProgress,
    errorMessage,
    dialogOpen,
    lastUpdateCheckAt,
    isChecking,
    isDownloading,
    hasUpdate,
    runCheck,
    dismissDialog,
    installUpdate,
  };
}

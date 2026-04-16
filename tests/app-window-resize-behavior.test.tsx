import { Suspense } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

import App from "../src/App";
import { DEFAULT_SETTINGS } from "../src/store";

const invokeMock = vi.fn();
const listenMock = vi.fn();
const setSizeMock = vi.fn();
const innerSizeMock = vi.fn();
const scaleFactorMock = vi.fn();
const centerMock = vi.fn();
const closeMock = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));
vi.mock("@tauri-apps/api/event", () => ({ listen: listenMock }));
vi.mock("@tauri-apps/api/window", () => ({
  LogicalSize: class LogicalSize {
    width: number;
    height: number;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
  },
  getCurrentWindow: () => ({
    setSize: setSizeMock,
    innerSize: innerSizeMock,
    scaleFactor: scaleFactorMock,
    center: centerMock,
    close: closeMock,
  }),
}));

vi.mock("../src/hotkeys", () => ({
  canonicalizeHotkeyForBackend: vi.fn(async (hotkey: string) => hotkey),
}));

vi.mock("../src/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/store")>();
  return {
    ...actual,
    loadSettings: vi.fn(async () => ({ ...actual.DEFAULT_SETTINGS })),
    saveSettings: vi.fn(async () => undefined),
    clearSavedSettings: vi.fn(async () => undefined),
  };
});

vi.mock("../src/components/TitleBar", () => ({
  default: ({ setTab }: { setTab: (next: "simple" | "advanced" | "settings") => void }) => (
    <div>
      <button onClick={() => setTab("simple")}>tab-simple</button>
      <button onClick={() => setTab("advanced")}>tab-advanced</button>
      <button onClick={() => setTab("settings")}>tab-settings</button>
    </div>
  ),
}));

vi.mock("../src/components/panels/SimplePanel", () => ({
  default: ({ update }: { update: (patch: Partial<typeof DEFAULT_SETTINGS>) => void }) => (
    <button onClick={() => update({ theme: "light" })}>update-theme</button>
  ),
}));

vi.mock("../src/components/panels/AdvancedPanel", () => ({
  default: () => <div>advanced-panel</div>,
}));

vi.mock("../src/components/panels/AdvancedPanelCompact", () => ({
  default: () => <div>advanced-panel-compact</div>,
}));

vi.mock("../src/components/panels/SettingsPanel", () => ({
  default: () => <div>settings-panel</div>,
}));

vi.mock("../src/components/Updatebanner", () => ({
  default: () => <div>update-banner</div>,
}));

function createInvokeResolver() {
  return async <T = unknown>(cmd: string): Promise<T> => {
    if (cmd === "get_app_info") {
      return {
        version: "3.2.0",
        updateStatus: "ok",
        screenshotProtectionSupported: false,
      } as T;
    }

    if (cmd === "get_status") {
      return {
        running: false,
        clickCount: 0,
        lastError: null,
        stopReason: null,
      } as T;
    }

    if (cmd === "register_hotkey" || cmd === "update_settings") {
      return "ctrl+y" as T;
    }

    if (cmd === "check_for_updates") {
      return {
        updateAvailable: false,
        currentVersion: "3.2.0",
        latestVersion: "3.2.0",
      } as T;
    }

    return undefined as T;
  };
}

async function flushAppEffects() {
  await act(async () => {
    await Promise.resolve();
  });

  await act(async () => {
    vi.runOnlyPendingTimers();
  });

  await act(async () => {
    await Promise.resolve();
  });
}

async function renderAppWithMocks() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  await act(async () => {
    root.render(
      <Suspense fallback={<div>loading</div>}>
        <App />
      </Suspense>,
    );
  });

  await flushAppEffects();

  return { host, root };
}

function clickByText(host: HTMLElement, text: string) {
  const btn = Array.from(host.querySelectorAll("button")).find(
    (candidate) => candidate.textContent === text,
  );

  if (!btn) {
    throw new Error(`Button not found: ${text}`);
  }

  btn.click();
}

describe("app window resize behavior", () => {
  let root: Root | null = null;
  let host: HTMLElement | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    invokeMock.mockImplementation(createInvokeResolver());
    listenMock.mockResolvedValue(() => undefined);
    setSizeMock.mockResolvedValue(undefined);
    centerMock.mockResolvedValue(undefined);
    closeMock.mockResolvedValue(undefined);
    innerSizeMock.mockResolvedValue({ width: 550, height: 175 });
    scaleFactorMock.mockResolvedValue(1);
  });

  afterEach(async () => {
    if (root && host) {
      await act(async () => {
        root!.unmount();
      });
      host.remove();
    }

    root = null;
    host = null;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("does not resize for non-size setting updates but resizes for tab-driven size changes", async () => {
    const rendered = await renderAppWithMocks();
    root = rendered.root;
    host = rendered.host;

    const initialSetSizeCalls = setSizeMock.mock.calls.length;
    expect(initialSetSizeCalls).toBeGreaterThan(0);

    await act(async () => {
      clickByText(host!, "update-theme");
    });
    await flushAppEffects();

    expect(setSizeMock.mock.calls.length).toBe(initialSetSizeCalls);

    await act(async () => {
      clickByText(host!, "tab-settings");
    });
    await flushAppEffects();

    expect(setSizeMock.mock.calls.length).toBeGreaterThan(initialSetSizeCalls);
  });
});

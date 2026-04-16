import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SettingsPanel from "../src/components/panels/SettingsPanel";
import type { AppInfo, Settings } from "../src/store";

const invokeMock = vi.fn();
const openMock = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));
vi.mock("@tauri-apps/plugin-shell", () => ({ open: openMock }));

const baseSettings: Settings = {
  version: "3.0.0",
  clickSpeed: 25,
  clickInterval: "s",
  mouseButton: "Left",
  hotkey: "ctrl+y",
  mode: "Toggle",
  dutyCycleEnabled: true,
  dutyCycle: 45,
  speedVariationEnabled: true,
  speedVariation: 35,
  doubleClickEnabled: false,
  doubleClickDelay: 40,
  clickLimitEnabled: false,
  clickLimit: 1000,
  timeLimitEnabled: false,
  timeLimit: 60,
  timeLimitUnit: "s",
  cornerStopEnabled: true,
  cornerStopTL: 50,
  cornerStopTR: 50,
  cornerStopBL: 50,
  cornerStopBR: 50,
  edgeStopEnabled: true,
  edgeStopTop: 40,
  edgeStopBottom: 40,
  edgeStopLeft: 40,
  edgeStopRight: 40,
  positionEnabled: false,
  positionX: 0,
  positionY: 0,
  disableScreenshots: false,
  advancedSettingsEnabled: true,
  explanationMode: "text",
  lastPanel: "simple",
  showStopReason: true,
  showStopOverlay: true,
  theme: "dark",
};

const appInfo: AppInfo = {
  version: "3.0.0",
  updateStatus: "ok",
  screenshotProtectionSupported: false,
};

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

function findScrollContainer(host: HTMLElement): HTMLDivElement {
  const panel = host.querySelector('[data-testid="settings-panel-scroll"]');

  if (!(panel instanceof HTMLDivElement)) {
    throw new Error("Missing settings panel scroll container");
  }

  return panel;
}

describe("settings panel scroll stability", () => {
  let host: HTMLElement | null = null;
  let root: Root | null = null;
  let updateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    invokeMock.mockResolvedValue({
      totalClicks: 0,
      totalTimeSecs: 0,
      totalSessions: 0,
      avgCpu: 0,
    });
    updateSpy = vi.fn();

    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root!.render(
        <SettingsPanel
          settings={baseSettings}
          update={updateSpy}
          appInfo={appInfo}
          onReset={vi.fn(async () => undefined)}
        />,
      );
    });

    await flushEffects();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    host?.remove();
    host = null;
    root = null;
    vi.clearAllMocks();
  });

  it("keeps the same scroll owner container across re-renders", async () => {
    const firstOwner = findScrollContainer(host!);

    await act(async () => {
      root!.render(
        <SettingsPanel
          settings={{ ...baseSettings, showStopReason: false }}
          update={updateSpy}
          appInfo={appInfo}
          onReset={vi.fn(async () => undefined)}
        />,
      );
    });

    const secondOwner = findScrollContainer(host!);

    expect(secondOwner).toBe(firstOwner);
    expect(host!.querySelectorAll('[data-testid="settings-panel-scroll"]').length).toBe(1);
  });

  it("does not churn scroll-container role metadata during interactions", async () => {
    const owner = findScrollContainer(host!);
    const roleBefore = owner.getAttribute("role");

    await act(async () => {
      owner.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 35 }));
    });

    const toggleButton = Array.from(host!.querySelectorAll("button")).find(
      (button) => button.textContent === "Off",
    );

    if (!toggleButton) {
      throw new Error("Expected settings toggle button to exist");
    }

    await act(async () => {
      toggleButton.click();
    });

    const ownerAfter = findScrollContainer(host!);

    expect(ownerAfter).toBe(owner);
    expect(ownerAfter.getAttribute("role")).toBe(roleBefore);
    expect(host!.querySelectorAll('[role="scroll-container"]').length).toBe(0);
  });

  it("remains stable when overflow is present and wheel scrolling occurs", async () => {
    const owner = findScrollContainer(host!);

    Object.defineProperty(owner, "clientHeight", { value: 120, configurable: true });
    Object.defineProperty(owner, "scrollHeight", { value: 640, configurable: true });
    owner.scrollTop = 40;

    await act(async () => {
      owner.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 80 }));
    });

    const ownerAfter = findScrollContainer(host!);

    expect(ownerAfter).toBe(owner);
    expect(ownerAfter.scrollTop).toBe(120);
    expect(host!.querySelectorAll('[data-testid="settings-panel-scroll"]').length).toBe(1);
  });
});

type QuantUiConfig = {
  forceRestricted?: boolean;
  restrictedHosts?: string[];
};

declare global {
  interface Window {
    __QUANT_UI_CONFIG__?: QuantUiConfig;
  }
}

function parseHostList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function currentHostname() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

function runtimeConfig(): QuantUiConfig {
  if (typeof window === "undefined") return {};
  return window.__QUANT_UI_CONFIG__ ?? {};
}

export function getHideMoldFields() {
  const runtime = runtimeConfig();

  if (runtime.forceRestricted === true) {
    return true;
  }

  if (import.meta.env.VITE_HIDE_MOLD_FIELDS === "true") {
    return true;
  }

  const restrictedHosts = [
    ...(runtime.restrictedHosts ?? []),
    ...parseHostList(import.meta.env.VITE_RESTRICTED_HOSTS),
  ].map((host) => host.toLowerCase());

  return restrictedHosts.includes(currentHostname());
}

export const hideMoldFields = getHideMoldFields();

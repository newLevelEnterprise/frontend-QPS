type QuantUiConfig = {
  forceRestricted?: boolean;
  restrictedHosts?: string[];
};

declare global {
  interface Window {
    __QUANT_UI_CONFIG__?: QuantUiConfig;
  }
}

const DEFAULT_RESTRICTED_HOSTS = [
  "127.0.0.1",
  "quant-copy-production.up.railway.app",
];

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

export function appPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
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
    ...DEFAULT_RESTRICTED_HOSTS,
    ...(runtime.restrictedHosts ?? []),
    ...parseHostList(import.meta.env.VITE_RESTRICTED_HOSTS),
  ].map((host) => host.toLowerCase());

  return restrictedHosts.includes(currentHostname());
}

export const hideMoldFields = getHideMoldFields();

export const MAQ_GARGALO_LABEL = "Maq. Gargalo";

export function hiddenModeLabel(
  fullLabel: string,
  hiddenLabel = MAQ_GARGALO_LABEL,
) {
  return hideMoldFields ? hiddenLabel : fullLabel;
}

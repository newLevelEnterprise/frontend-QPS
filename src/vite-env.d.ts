/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_HIDE_MOLD_FIELDS?: string;
  readonly VITE_RESTRICTED_HOSTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

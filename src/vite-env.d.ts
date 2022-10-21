/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_ENV: string;
  VITE_GOOGLE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_GOOGLE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

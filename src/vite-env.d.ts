/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_GOOGLE_API_KEY: string;
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_CHAT_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

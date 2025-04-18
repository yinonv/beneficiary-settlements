import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 3500,
        open: false
    },
    preview: {
        port: 3500,
        open: true
    },
    envDir: "environment"
});

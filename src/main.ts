import { MapService, FirebaseProvider } from "./services";
import { Layout, Login, Chat } from "./components";

/**
 * Application class that initializes all components
 */
class App {
    private mapService: MapService | null = null;
    private layout: Layout | null = null;
    private login: Login | null = null;
    private chat: Chat | null = null;
    private firebaseProvider: FirebaseProvider | null = null;

    /**
     * Initialize the application
     */
    public async init(): Promise<void> {
        try {
            // Load styles
            await this.loadStyles();

            // Initialize services
            await this.initializeServices();

            // Initialize components
            this.initializeComponents();

            // Make app visible and remove loading screen
            this.makeAppVisible();

            console.log("Application initialized successfully");
        } catch (error) {
            console.error("Failed to initialize application:", error);
            this.showErrorMessage(
                "Failed to initialize the application. Please refresh the page."
            );
        }
    }

    /**
     * Make the app visible and remove loading screen
     */
    private makeAppVisible(): void {
        // Make app visible
        const appElement = document.getElementById("app");
        if (appElement) {
            appElement.style.visibility = "visible";
        }

        // Remove initial loading screen
        const loadingScreen = document.getElementById("initial-loading-screen");
        if (loadingScreen) {
            loadingScreen.remove();
        }
    }

    /**
     * Load required styles
     */
    private async loadStyles(): Promise<void> {
        await Promise.all([
            import("./styles/main.css"),
            import("bootstrap/dist/css/bootstrap.min.css")
        ]);
    }

    /**
     * Initialize services
     */
    private async initializeServices(): Promise<void> {
        // Initialize map service
        this.mapService = await MapService.init();

        // Initialize Firebase
        this.firebaseProvider = new FirebaseProvider();
    }

    /**
     * Initialize components
     */
    private initializeComponents(): void {
        if (!this.mapService || !this.firebaseProvider) {
            throw new Error("Required services not initialized");
        }

        // Initialize layout
        this.layout = new Layout(this.mapService);
        this.layout.init();

        // Initialize login
        this.login = new Login(this.firebaseProvider);
        this.login.init();

        // Initialize chat
        this.chat = new Chat(this.firebaseProvider);
        this.chat.init();
    }

    /**
     * Show error message to user
     */
    private showErrorMessage(message: string): void {
        const errorContainer = document.createElement("div");
        errorContainer.className =
            "alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3";
        errorContainer.style.zIndex = "9999";
        errorContainer.textContent = message;
        document.body.appendChild(errorContainer);
    }
}

// Initialize the application when the DOM is loaded
window.addEventListener("load", () => {
    const app = new App();
    app.init();
});

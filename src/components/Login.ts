import { FirebaseProvider } from "../services/FirebaseProvider";

export class Login {
    private loginButton: HTMLButtonElement | null;
    private logoutButton: HTMLButtonElement | null;
    private firebaseProvider: FirebaseProvider;

    constructor(firebaseProvider: FirebaseProvider) {
        this.loginButton = document.getElementById(
            "login-button"
        ) as HTMLButtonElement;
        this.logoutButton = document.getElementById(
            "logout-button"
        ) as HTMLButtonElement;
        this.firebaseProvider = firebaseProvider;
    }

    public init(): void {
        if (!this.loginButton || !this.logoutButton) {
            console.error("Auth buttons not found in the DOM");
            return;
        }

        // Hide both buttons initially until auth state is determined
        this.loginButton.hidden = true;
        this.logoutButton.hidden = true;

        this.setupEventListeners();
        this.subscribeToAuthState();
    }

    private setupEventListeners(): void {
        this.loginButton?.addEventListener("click", this.handleLogin);
        this.logoutButton?.addEventListener("click", this.handleLogout);
    }

    private handleLogin = async (): Promise<void> => {
        try {
            await this.firebaseProvider.signInWithGoogle();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    private handleLogout = async (): Promise<void> => {
        try {
            await this.firebaseProvider.signOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    private subscribeToAuthState(): void {
        this.firebaseProvider.subscribe((user) => {
            if (!this.loginButton || !this.logoutButton) {
                return;
            }

            // Show the appropriate button based on auth state
            this.loginButton.hidden = !!user;
            this.logoutButton.hidden = !user;
        });
    }
}

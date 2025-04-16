import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User,
    Auth,
    signOut
} from "firebase/auth";

export class FirebaseProvider {
    private auth: Auth;
    private googleProvider = new GoogleAuthProvider();
    private user: User | null = null;
    private listeners: Set<(user: User | null) => void> = new Set();
    private authInitialized: boolean = false;
    private pendingSubscribers: Array<(user: User | null) => void> = [];

    constructor() {
        this.initializeFirebase();
        this.auth = getAuth();
        this.setupAuthStateListener();
    }

    public async signInWithGoogle(): Promise<User> {
        try {
            const result = await signInWithPopup(
                this.auth,
                this.googleProvider
            );
            return result.user;
        } catch (error) {
            throw error;
        }
    }

    public async signOut(): Promise<void> {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw error;
        }
    }

    public async getIdToken(): Promise<string | null> {
        if (!this.user) {
            return null;
        }

        try {
            return await this.user.getIdToken();
        } catch (error) {
            return null;
        }
    }

    public subscribe(callback: (user: User | null) => void): () => void {
        this.listeners.add(callback);

        // If auth is already initialized, call the callback immediately
        if (this.authInitialized) {
            callback(this.user);
        } else {
            // Otherwise, add to pending subscribers
            this.pendingSubscribers.push(callback);
        }

        return () => {
            this.listeners.delete(callback);
        };
    }

    private initializeFirebase(): void {
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env
                .VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        initializeApp(firebaseConfig);
    }

    private setupAuthStateListener(): void {
        onAuthStateChanged(this.auth, (user) => {
            this.user = user;

            // Mark auth as initialized after first state change
            if (!this.authInitialized) {
                this.authInitialized = true;

                // Notify all pending subscribers
                this.pendingSubscribers.forEach((callback) =>
                    callback(this.user)
                );
                this.pendingSubscribers = [];
            }

            this.notifyListeners();
        });
    }

    private notifyListeners(): void {
        this.listeners.forEach((callback) => callback(this.user));
    }
}

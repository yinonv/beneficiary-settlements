import { FirebaseProvider } from "../services/FirebaseProvider";
import { ChatService } from "../services/ChatService";

// Types
interface ChatElements {
    chatContainer: HTMLDivElement;
    messageInput: HTMLInputElement;
    sendButton: HTMLButtonElement;
    messagesContainer: HTMLDivElement;
    toggleButton: HTMLButtonElement;
}

type MessageRole = "user" | "assistant" | "system";

// Chat UI Component
class ChatUI {
    private isMinimized: boolean = true;
    private lastAssistantMessageElement: HTMLDivElement | null = null;

    constructor(private elements: ChatElements) {}

    public init(): void {
        this.setupEventListeners();
        this.updateMinimizeState();
    }

    public enableChat(): void {
        this.elements.messageInput.disabled = false;
        this.elements.sendButton.disabled = false;
        this.elements.messageInput.placeholder = "Ask anything";
        this.clearMessages();
    }

    public disableChat(): void {
        this.elements.messageInput.disabled = true;
        this.elements.sendButton.disabled = true;
        this.elements.messageInput.placeholder =
            "Please log in to chat with the AI assistant...";
        this.clearMessages();
        this.addMessage(
            "system",
            "Please log in to start chatting with the AI assistant. The chat will be enabled automatically once you're logged in."
        );
    }

    public addMessage(role: MessageRole, content: string): void {
        // For assistant messages, check if we need to update an existing message
        if (role === "assistant" && this.lastAssistantMessageElement) {
            // Update the existing message content
            const contentElement =
                this.lastAssistantMessageElement.querySelector(
                    ".message-content"
                );
            if (contentElement) {
                contentElement.textContent = content;
            }
            // Scroll to bottom after updating content
            this.scrollToBottom();
            return;
        }

        // Create a new message element
        const messageElement = document.createElement("div");
        messageElement.className = `message ${role}-message`;

        const roleElement = document.createElement("div");
        roleElement.className = "message-role";
        roleElement.textContent =
            role === "user"
                ? "You"
                : role === "assistant"
                  ? "Assistant"
                  : "System";

        const contentElement = document.createElement("div");
        contentElement.className = "message-content";
        contentElement.textContent = content;

        messageElement.appendChild(roleElement);
        messageElement.appendChild(contentElement);

        this.elements.messagesContainer.appendChild(messageElement);

        // Store reference to the last assistant message for updates
        if (role === "assistant") {
            this.lastAssistantMessageElement = messageElement;
        } else {
            this.lastAssistantMessageElement = null;
        }

        // Scroll to bottom after adding new message
        this.scrollToBottom();
    }

    // Helper method to scroll to the bottom of the messages container
    private scrollToBottom(): void {
        this.elements.messagesContainer.scrollTop =
            this.elements.messagesContainer.scrollHeight;
    }

    public getMessageInput(): string {
        return this.elements.messageInput.value.trim();
    }

    public clearMessageInput(): void {
        this.elements.messageInput.value = "";
    }

    private clearMessages(): void {
        while (this.elements.messagesContainer.firstChild) {
            this.elements.messagesContainer.removeChild(
                this.elements.messagesContainer.firstChild
            );
        }
    }

    private setupEventListeners(): void {
        this.elements.toggleButton.addEventListener("click", () => {
            this.isMinimized = !this.isMinimized;
            this.updateMinimizeState();
        });
    }

    private updateMinimizeState(): void {
        if (this.isMinimized) {
            this.elements.messagesContainer.style.display = "none";
            this.elements.messageInput.style.display = "none";
            this.elements.sendButton.style.display = "none";
            this.elements.chatContainer.style.height = "auto";
            this.elements.toggleButton.textContent = "□";
            return;
        }
        this.elements.messagesContainer.style.display = "block";
        this.elements.messageInput.style.display = "block";
        this.elements.sendButton.style.display = "block";
        this.elements.chatContainer.style.height = "600px";
        this.elements.toggleButton.textContent = "−";
    }
}

// Main Chat Component
export class Chat {
    private ui: ChatUI | null = null;
    private service: ChatService;
    private firebaseProvider: FirebaseProvider;

    constructor(firebaseProvider: FirebaseProvider) {
        this.firebaseProvider = firebaseProvider;
        this.service = new ChatService(firebaseProvider);

        const elements = this.getChatElements();
        if (!elements) {
            console.error("Chat elements not found in the DOM");
            return;
        }

        this.ui = new ChatUI(elements);
    }

    public init(): void {
        if (!this.ui) {
            return;
        }

        // Always show the chat container
        const chatContainer = document.getElementById(
            "chat-container"
        ) as HTMLDivElement;
        chatContainer.style.display = "flex";
        chatContainer.style.flexDirection = "column";

        // Initialize UI
        this.ui.init();

        this.firebaseProvider.subscribe((user) => {
            if (!this.ui) return;
            if (!user) {
                // User is signed out, disable chat
                this.ui.disableChat();
                return;
            }
            // User is signed in, enable chat
            this.ui.enableChat();
        });

        // Set up message sending
        this.setupMessageSending();
    }

    private getChatElements(): ChatElements | null {
        const chatContainer = document.getElementById(
            "chat-container"
        ) as HTMLDivElement;
        const messageInput = document.getElementById(
            "message-input"
        ) as HTMLInputElement;
        const sendButton = document.getElementById(
            "send-button"
        ) as HTMLButtonElement;
        const messagesContainer = document.getElementById(
            "messages-container"
        ) as HTMLDivElement;
        const toggleButton = document.getElementById(
            "chat-toggle"
        ) as HTMLButtonElement;

        if (
            !chatContainer ||
            !messageInput ||
            !sendButton ||
            !messagesContainer ||
            !toggleButton
        ) {
            return null;
        }

        return {
            chatContainer,
            messageInput,
            sendButton,
            messagesContainer,
            toggleButton
        };
    }

    private setupMessageSending(): void {
        if (!this.ui) {
            return;
        }

        const elements = this.getChatElements();
        if (!elements) {
            return;
        }

        elements.sendButton.addEventListener("click", this.handleSendMessage);
        elements.messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleSendMessage();
            }
        });
    }

    private handleSendMessage = async (): Promise<void> => {
        if (!this.ui) return;

        const message = this.ui.getMessageInput();
        if (!message) return;

        // Add user message to chat
        this.ui.addMessage("user", message);
        this.ui.clearMessageInput();

        try {
            await this.service.sendMessage(
                message,
                (data) => {
                    if (!this.ui) {
                        console.warn("UI is null, cannot add message");
                        return;
                    }
                    this.ui.addMessage("assistant", data);
                },
                (error) => {
                    console.error("Error from server:", error);
                    if (this.ui) this.ui.addMessage("system", error);
                }
            );
        } catch (error) {
            console.error("Error sending message:", error);
            if (!this.ui) return;

            if (error instanceof Error) {
                this.ui.addMessage("system", error.message);
            } else {
                this.ui.addMessage("system", "An unknown error occurred");
            }
        }
    };
}

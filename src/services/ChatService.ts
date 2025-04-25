import { FirebaseProvider } from "./FirebaseProvider";

export class ChatService {
    private url = import.meta.env.VITE_CHAT_API_URL;
    private sessionID: string | null = null;

    constructor(private firebaseProvider: FirebaseProvider) {}

    public async sendMessage(
        message: string,
        onResponse: (data: string) => void,
        onError: (error: string) => void
    ): Promise<void> {
        try {
            // Get the current user's ID token
            const idToken = await this.firebaseProvider.getIdToken();
            if (!idToken) {
                throw new Error("No ID token found");
            }

            // Build the request with headers and body
            const { headers, body } = this.buildRequest(message, idToken);

            // Send message to chat endpoint
            const response = await fetch(this.url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle event stream response
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is not readable");
            }

            // Process the response stream
            const fullResponse = await this.handleResponseStream(
                reader,
                onResponse
            );

            // Final update to ensure we have the complete response
            if (fullResponse) {
                onResponse(fullResponse);
            } else {
                onError("לא התקבלה תשובה מהשרת");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            if (error instanceof Error && error.message.includes("401")) {
                onError(
                    "אין גישה. יש לפנות ל- beneficiary-settlements@googlegroups.com."
                );
            } else {
                onError("ארעה שגיאה, אנא נסה שנית.");
            }
        }
    }

    private buildRequest(
        message: string,
        idToken: string
    ): { headers: Record<string, string>; body: any } {
        // Create the request body with session ID if available
        const body = {
            role: "user",
            content: message,
            session_id: this.sessionID // Include session ID if available
        };

        // Prepare headers with authorization
        const headers: Record<string, string> = {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json"
        };

        return { headers, body };
    }

    private async handleResponseStream(
        reader: ReadableStreamDefaultReader<Uint8Array>,
        onResponse: (data: string) => void
    ): Promise<string> {
        let buffer = "";
        let fullResponse = "";
        let isSessionIdEvent = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            buffer += chunk;
            // Process complete event stream messages
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

            for (const line of lines) {
                // Check for session_id event
                if (line.startsWith("event: session_id")) {
                    isSessionIdEvent = true;
                    continue;
                }
                // If we're expecting session_id data
                if (isSessionIdEvent && line.startsWith("data: ")) {
                    const data = line.substring(6); // Remove 'data: ' prefix
                    // Simply use the data as the session ID
                    this.sessionID = data;
                    isSessionIdEvent = false;
                    continue;
                }

                // Handle regular content data
                if (line.startsWith("data: ")) {
                    const data = line.substring(6); // Remove 'data: ' prefix
                    fullResponse += data;
                    onResponse(fullResponse);
                }
            }
        }

        return fullResponse;
    }
}

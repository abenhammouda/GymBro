import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private isConnecting = false;

    async connect(token: string): Promise<void> {
        // If already connected or connecting, don't try again
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('SignalR connection already in progress');
            return;
        }

        this.isConnecting = true;

        try {
            // Disconnect existing connection if any
            if (this.connection) {
                await this.connection.stop();
                this.connection = null;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5085';
            console.log('SignalR connecting to:', `${apiUrl}/hubs/message`);
            console.log('Token available:', !!token);

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${apiUrl}/hubs/message`, {
                    // Temporarily remove token to test basic connectivity
                    // accessTokenFactory: () => token,
                    skipNegotiation: false,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Debug)
                .build();

            this.connection.onreconnecting(() => {
                console.log('SignalR reconnecting...');
            });

            this.connection.onreconnected(() => {
                console.log('SignalR reconnected');
            });

            this.connection.onclose(() => {
                console.log('SignalR connection closed');
                this.isConnecting = false;
            });

            await this.connection.start();
            console.log('SignalR connected');
        } catch (error) {
            console.error('SignalR connection error:', error);
            this.connection = null;
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    on(eventName: string, callback: (...args: any[]) => void): void {
        this.connection?.on(eventName, callback);
    }

    off(eventName: string, callback: (...args: any[]) => void): void {
        this.connection?.off(eventName, callback);
    }

    async invoke(methodName: string, ...args: any[]): Promise<any> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('SignalR not connected');
        }
        return await this.connection.invoke(methodName, ...args);
    }

    async joinConversation(conversationId: number): Promise<void> {
        await this.invoke('JoinConversation', conversationId);
    }

    async leaveConversation(conversationId: number): Promise<void> {
        await this.invoke('LeaveConversation', conversationId);
    }

    async sendMessage(conversationId: number, messageText: string): Promise<void> {
        await this.invoke('SendMessage', conversationId, messageText);
    }

    async markAsRead(messageId: number): Promise<void> {
        await this.invoke('MarkAsRead', messageId);
    }

    async userTyping(conversationId: number): Promise<void> {
        await this.invoke('UserTyping', conversationId);
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

export default new SignalRService();

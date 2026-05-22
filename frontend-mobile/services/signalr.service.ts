import * as signalR from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../constants/Api';
import type { MessageResponse } from '../types/api.types';

let connection: signalR.HubConnection | null = null;

export async function connectSignalR(token: string): Promise<void> {
  if (connection && connection.state === signalR.HubConnectionState.Connected) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_HUB_URL}?access_token=${token}`, {
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  await connection.start();
}

export function onReceiveMessage(callback: (msg: MessageResponse) => void): () => void {
  if (!connection) return () => {};
  connection.on('ReceiveMessage', callback);
  return () => connection?.off('ReceiveMessage', callback);
}

export async function disconnectSignalR(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}

export function getConnectionState(): signalR.HubConnectionState | null {
  return connection?.state ?? null;
}

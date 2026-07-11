import * as signalR from '@microsoft/signalr';
import { appConfig } from '../config/appConfig';
import { getValidAccessToken } from './authService';

/** Event names pushed by KatKatHub - see KatKatHubConsts.EventNames on the backend. */
export const KatKatHubEvents = {
  P2PRequestCreated: 'ReceiveP2PRequestCreated',
  P2PRequestFulfilled: 'ReceiveP2PRequestFulfilled',
  ResourceReservationCreated: 'ReceiveResourceReservationCreated',
  ResourceReservationCancelled: 'ReceiveResourceReservationCancelled',
  SosAlert: 'ReceiveSosAlert',
  SosAlertResolved: 'ReceiveSosAlertResolved',
  IssueResolved: 'ReceiveIssueResolved',
} as const;

let connection: signalR.HubConnection | null = null;
let startPromise: Promise<void> | null = null;

function getConnection(): signalR.HubConnection {
  connection ??= new signalR.HubConnectionBuilder()
    .withUrl(appConfig.signalrHubUrl, { accessTokenFactory: () => getValidAccessToken() ?? '' })
    .withAutomaticReconnect()
    .build();
  return connection;
}

export async function ensureConnected(): Promise<signalR.HubConnection> {
  const hub = getConnection();
  if (hub.state === signalR.HubConnectionState.Disconnected) {
    startPromise ??= hub.start().finally(() => {
      startPromise = null;
    });
    await startPromise;
  }
  return hub;
}

export async function joinComplexGroup(complexId: string): Promise<void> {
  const hub = await ensureConnected();
  await hub.invoke('JoinComplexGroupAsync', complexId);
}

export async function leaveComplexGroup(complexId: string): Promise<void> {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.invoke('LeaveComplexGroupAsync', complexId);
  }
}

export function onHubEvent<T>(eventName: string, handler: (payload: T) => void): () => void {
  const hub = getConnection();
  hub.on(eventName, handler);
  return () => hub.off(eventName, handler);
}

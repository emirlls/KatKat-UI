import { useEffect } from 'react';
import { joinComplexGroup, leaveComplexGroup, onHubEvent } from '../services/signalr-service';

/** Joins the `complex-{complexId}` SignalR group for the lifetime of the calling component. */
export function useComplexGroup(complexId: string | undefined): void {
  useEffect(() => {
    if (!complexId) {
      return;
    }
    void joinComplexGroup(complexId);
    return () => {
      void leaveComplexGroup(complexId);
    };
  }, [complexId]);
}

/** Subscribes to a KatKatHub server event for the lifetime of the calling component. */
export function useHubEvent<T>(eventName: string, handler: (payload: T) => void): void {
  useEffect(() => onHubEvent<T>(eventName, handler), [eventName, handler]);
}

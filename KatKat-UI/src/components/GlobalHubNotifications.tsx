import { useCallback, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useHubEvent } from '../hooks/useSignalR';
import { ensureConnected, KatKatHubEvents } from '../services/signalr-service';
import type { ResourceReservationDto } from '../types/resource';

/**
 * Mounted once at the app root - notifies a user of a live event regardless of which screen
 * they're on (e.g. a manager rejecting their reservation while they're looking at something
 * else entirely). Reservation approve/reject already push straight to the reserver's own
 * connection (SignalR Clients.User), not a complex group, so this only needs the connection
 * itself to be established - no group-join required.
 */
export function GlobalHubNotifications() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      void ensureConnected();
    }
  }, [isAuthenticated]);

  const handleApproved = useCallback(() => {
    showToast('Rezervasyon talebiniz onaylandı.', 'success');
  }, [showToast]);

  const handleRejected = useCallback(
    (dto: ResourceReservationDto) => {
      showToast(
        dto.rejectionReason
          ? `Rezervasyon talebiniz reddedildi: ${dto.rejectionReason}`
          : 'Rezervasyon talebiniz reddedildi.',
        'danger',
      );
    },
    [showToast],
  );

  useHubEvent(KatKatHubEvents.ResourceReservationApproved, handleApproved);
  useHubEvent(KatKatHubEvents.ResourceReservationRejected, handleRejected);

  return null;
}

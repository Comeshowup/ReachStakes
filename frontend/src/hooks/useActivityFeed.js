import { useState, useCallback } from 'react';
import { useAdminWebSocket } from './useAdminWebSocket';

const MAX_EVENTS = 50;

const SEED_EVENTS = [
  { id: 1, type: 'campaign_created', message: 'Nike Summer Splash campaign was created', actor: 'Nike Brand', time: new Date(Date.now() - 2 * 60000).toISOString(), meta: {} },
  { id: 2, type: 'creator_joined', message: 'Emma Wilson joined Adidas Collab campaign', actor: 'Emma Wilson', time: new Date(Date.now() - 8 * 60000).toISOString(), meta: {} },
  { id: 3, type: 'payment_released', message: '$3,200 payment released to Jake Torres', actor: 'System', time: new Date(Date.now() - 22 * 60000).toISOString(), meta: { amount: 3200 } },
  { id: 4, type: 'issue_resolved', message: 'Content dispute on Puma campaign resolved', actor: 'Admin', time: new Date(Date.now() - 47 * 60000).toISOString(), meta: {} },
  { id: 5, type: 'campaign_created', message: 'H&M Fall Collection campaign launched', actor: 'H&M Brand', time: new Date(Date.now() - 90 * 60000).toISOString(), meta: {} },
];

export function useActivityFeed() {
  const [events, setEvents] = useState(SEED_EVENTS);

  const handleEvent = useCallback((data) => {
    if (!data?.type || !data?.message) return;
    setEvents((prev) => {
      const next = [{ ...data, id: Date.now(), time: data.time || new Date().toISOString() }, ...prev];
      return next.slice(0, MAX_EVENTS);
    });
  }, []);

  useAdminWebSocket({ onEvent: handleEvent, channel: 'admin-activity' });

  return { events };
}

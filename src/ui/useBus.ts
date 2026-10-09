import { useEffect } from 'react';
import { bus, type BusEvents } from '../game/bus';

export function useBus<K extends keyof BusEvents>(event: K, handler: (payload: BusEvents[K]) => void) {
  useEffect(() => bus.on(event, handler), [event, handler]);
}

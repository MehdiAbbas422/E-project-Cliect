import { useEffect } from 'react'

// Purpose: Subscribes a page component to live "data changed" events pushed by
// the server (via Socket.IO) so lists refresh without a manual reload.
// The `handler` receives the event detail, e.g. { scope, expoId }.
export const useRealtime = (handler) => {
  useEffect(() => {
    const listener = (event) => handler(event.detail)
    window.addEventListener('eventsphere:changed', listener)
    return () => window.removeEventListener('eventsphere:changed', listener)
  }, [handler])
}

export default useRealtime

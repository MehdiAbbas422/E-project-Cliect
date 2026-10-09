import { useEffect } from 'react'

// Purpose: Subscribes a page component to live "data changed" events from the
// server (Socket.IO push, or polling on serverless hosts) so lists refresh
// without a manual reload. The `handler` receives detail, e.g. { scope, expoId }.
export const useRealtime = (handler) => {
  useEffect(() => {
    const listener = (event) => handler(event.detail)
    window.addEventListener('eventsphere:changed', listener)
    return () => window.removeEventListener('eventsphere:changed', listener)
  }, [handler])
}

export default useRealtime

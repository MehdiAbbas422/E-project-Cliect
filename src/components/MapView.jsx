import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28]
  })

/**
 * MapView — read-only map used on the detail pages so anyone who wants to
 * see an expo location can view it on a map instead of reading plain text.
 */
const MapView = ({ lat, lng, location }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !lat || !lng) return
    const map = L.map(containerRef.current, { scrollWheelZoom: false, dragging: true })
      .setView([lat, lng], 14)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    L.marker([lat, lng], { icon: pinIcon() }).addTo(map).bindPopup(location || 'Location').openPopup()
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 200)
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  if (!lat || !lng) return null

  return (
    <div className="map-box">
      <div ref={containerRef} className="leaflet-container" />
    </div>
  )
}

export default MapView

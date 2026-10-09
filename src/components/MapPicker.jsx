import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28]
  })

const DEFAULT_CENTER = [24, 12]
const DEFAULT_ZOOM = 3

/**
 * MapPicker — replaces the plain "location" text input.
 * The user can type / search a place (Nominatim geocoding) or simply click
 * the map; the selected address + coordinates are reported through onChange
 * as { location, lat, lng }.
 */
const MapPicker = ({ value = {}, onChange, placeholder = 'Search a city, venue or address…' }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const coordsRef = useRef({ lat: value.lat, lng: value.lng })

  const [query, setQuery] = useState(value.location || '')
  const [searching, setSearching] = useState(false)
  const [status, setStatus] = useState(
    value.lat && value.lng ? `Pinned at ${Number(value.lat).toFixed(5)}, ${Number(value.lng).toFixed(5)}` : 'Click the map or search for a place to drop the pin.'
  )

  const emit = (lat, lng, location) => {
    coordsRef.current = { lat, lng }
    if (location !== undefined) setQuery(location)
    onChange({ location, lat, lng })
  }

  const placeMarker = (lat, lng, zoomTo = false) => {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) markerRef.current.setLatLng([lat, lng])
    else markerRef.current = L.marker([lat, lng], { icon: pinIcon() }).addTo(map)
    if (zoomTo) map.setView([lat, lng], 13)
    setStatus(`Pinned at ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`)
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const start = value.lat && value.lng ? [value.lat, value.lng] : DEFAULT_CENTER
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(start, value.lat ? 13 : DEFAULT_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      placeMarker(lat, lng)
      setStatus('Looking up address…')
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        const data = await r.json()
        emit(lat, lng, data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      } catch {
        emit(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
    })
    mapRef.current = map
    if (value.lat && value.lng) placeMarker(value.lat, value.lng)
    setTimeout(() => map.invalidateSize(), 200)
    return () => { map.remove(); mapRef.current = null; markerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || value.lat == null || value.lng == null) return

    placeMarker(value.lat, value.lng, true)
    window.setTimeout(() => map.invalidateSize(), 200)
  }, [value.lat, value.lng])

  const search = async (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setStatus('Searching…')
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`)
      const data = await r.json()
      if (!data.length) {
        setStatus('No matching place found — try a more specific search.')
      } else {
        const { lat, lon, display_name } = data[0]
        placeMarker(Number(lat), Number(lon), true)
        emit(Number(lat), Number(lon), display_name)
        setStatus(`Selected: ${display_name}`)
      }
    } catch {
      setStatus('Search failed — check your connection or click the map instead.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="map-picker">
      <div className="bar">
        <input
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); onChange({ ...coordsRef.current, location: e.target.value }) }}
        />
        <button type="button" onClick={search} disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
      </div>
      <div ref={containerRef} className="leaflet-container" />
      <div className="status">{status}</div>
    </div>
  )
}

export default MapPicker

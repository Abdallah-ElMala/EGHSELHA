import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

// Default center: Sheikh Zayed / 6th of October
const DEFAULT_LAT = 30.0226
const DEFAULT_LNG = 31.0031

function isLegacyNasrCity(lat, lng) {
  return Math.abs(lat - 30.0561) < 0.002 && Math.abs(lng - 31.3414) < 0.002
}

function isValidCoord(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) > 0.1 &&
    Math.abs(lng) > 0.1
  )
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const CUSTOMER_PIN_ICON = L.divIcon({
  className: 'eghselha-customer-pin',
  html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
    <div style="background:#0f766e;color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);margin-bottom:3px;">Your Car</div>
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#0f766e" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
})

const TECH_PIN_ICON = L.divIcon({
  className: 'eghselha-tech-pin',
  html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
    <div style="background:#0b6bcb;color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);margin-bottom:3px;">Technician</div>
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#0b6bcb" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
})

export default function LiveTrackingMap({ booking }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const status = String(booking?.status || '').toUpperCase()
  const isAtCar = ['ARRIVED', 'WASHING', 'COMPLETED'].includes(status)

  // Determine customer vehicle coordinates (prefer booking's saved parking coords)
  const rawCustLat = Number(booking?.parkingLatitude)
  const rawCustLng = Number(booking?.parkingLongitude)
  const hasRealCustCoords = isValidCoord(rawCustLat, rawCustLng) && !isLegacyNasrCity(rawCustLat, rawCustLng)
  const custLat = hasRealCustCoords ? rawCustLat : DEFAULT_LAT
  const custLng = hasRealCustCoords ? rawCustLng : DEFAULT_LNG

  // Determine technician live coordinates
  const rawTechLat = Number(booking?.technicianLatitude)
  const rawTechLng = Number(booking?.technicianLongitude)
  const hasRealTechCoords = isValidCoord(rawTechLat, rawTechLng) && !isLegacyNasrCity(rawTechLat, rawTechLng)

  // If arrived/washing, technician is at the customer's car; otherwise use live GPS or nearby dispatch offset
  const techLat = isAtCar
    ? custLat
    : hasRealTechCoords
      ? rawTechLat
      : custLat + 0.011
  const techLng = isAtCar
    ? custLng
    : hasRealTechCoords
      ? rawTechLng
      : custLng + 0.012

  const distKm = isAtCar ? 0 : haversineKm(techLat, techLng, custLat, custLng)
  const etaMins = isAtCar ? 0 : Math.max(2, Math.round((distKm / 30) * 60))

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [custLat, custLng],
      zoom: 15,
      minZoom: 11,
      maxZoom: 18
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const custMarker = L.marker([custLat, custLng], { icon: CUSTOMER_PIN_ICON }).addTo(map)
    custMarker.bindPopup(`<b>Your Vehicle</b><br/>${booking?.address || 'Sheikh Zayed / 6th of October'}`)

    if (!isAtCar) {
      const techMarker = L.marker([techLat, techLng], { icon: TECH_PIN_ICON }).addTo(map)
      techMarker.bindPopup(`<b>${booking?.technicianName || 'Technician'}</b><br/>Status: ${booking?.status || 'On The Way'}`)

      const routeLine = L.polyline(
        [
          [techLat, techLng],
          [custLat, custLng]
        ],
        {
          color: '#0b6bcb',
          weight: 3,
          dashArray: '8 6',
          opacity: 0.85
        }
      ).addTo(map)

      map.fitBounds(routeLine.getBounds(), { padding: [48, 48], maxZoom: 15 })
    } else {
      map.setView([custLat, custLng], 16)
    }

    mapInstanceRef.current = map
    setTimeout(() => map.invalidateSize(), 150)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [custLat, custLng, techLat, techLng, isAtCar, booking?.address, booking?.technicianName, booking?.status])

  const googleMapsUrl = isAtCar
    ? `https://www.google.com/maps?q=${custLat},${custLng}`
    : `https://www.google.com/maps/dir/${techLat},${techLng}/${custLat},${custLng}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
      {/* Real Interactive Leaflet Map */}
      <div
        style={{
          height: '280px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          position: 'relative',
          background: '#e2e8f0'
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Live Status Strip + Google Maps Link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          padding: '10px 14px',
          borderRadius: '10px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {isAtCar ? (
            <MapPin size={16} color="#0f766e" style={{ flexShrink: 0 }} />
          ) : (
            <Navigation size={16} color="#0b6bcb" style={{ flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>
              {isAtCar
                ? `Technician is at your location (${booking?.address || 'Pinned Spot'})`
                : `En route · ~${distKm.toFixed(1)} km away (~${etaMins} min ETA)`}
            </b>
            <small style={{ fontSize: '10px', color: '#0369a1' }}>
              GPS: {custLat.toFixed(4)}, {custLng.toFixed(4)}
            </small>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="btn outline sm"
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          <ExternalLink size={12} /> Open in Google Maps
        </a>
      </div>
    </div>
  )
}

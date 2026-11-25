import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Navigation,
  Map as MapIcon,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Service coverage bounds: Sheikh Zayed & 6th of October City
const COVERAGE_BOUNDS = {
  minLat: 29.90,
  maxLat: 30.12,
  minLng: 30.85,
  maxLng: 31.08
}

export function isInsideServiceArea(lat, lng) {
  return (
    lat >= COVERAGE_BOUNDS.minLat &&
    lat <= COVERAGE_BOUNDS.maxLat &&
    lng >= COVERAGE_BOUNDS.minLng &&
    lng <= COVERAGE_BOUNDS.maxLng
  )
}

function getFallbackAreaName(lat, lng) {
  if (lat >= 30.015 && lng >= 30.95) {
    return `Sheikh Zayed City (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  }
  return `6th of October City (${lat.toFixed(4)}, ${lng.toFixed(4)})`
}

async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=en,ar`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
    clearTimeout(timer)
    if (!res.ok) return getFallbackAreaName(lat, lng)
    const data = await res.json()
    const a = data?.address || {}
    const parts = [
      a.road || a.pedestrian || a.residential || a.building || a.amenity,
      a.neighbourhood || a.suburb || a.quarter || a.city_district,
      a.city || a.town || a.state
    ].filter(Boolean)
    if (parts.length > 0) {
      return [...new Set(parts)].join(', ')
    }
    if (data?.display_name) {
      return data.display_name.split(',').slice(0, 3).join(', ').trim()
    }
    return getFallbackAreaName(lat, lng)
  } catch {
    return getFallbackAreaName(lat, lng)
  }
}

async function queryNominatim(q, signal) {
  // viewbox = left,top,right,bottom (minLng,maxLat,maxLng,minLat)
  const viewbox = `${COVERAGE_BOUNDS.minLng},${COVERAGE_BOUNDS.maxLat},${COVERAGE_BOUNDS.maxLng},${COVERAGE_BOUNDS.minLat}`
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&countrycodes=eg&addressdetails=1&limit=6&accept-language=en,ar`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const items = await res.json()
  if (!Array.isArray(items)) return []
  return items
    .map((item) => {
      const lat = parseFloat(item.lat)
      const lng = parseFloat(item.lon)
      const a = item.address || {}
      const primary =
        item.name ||
        a.road ||
        a.amenity ||
        a.neighbourhood ||
        a.suburb ||
        item.display_name?.split(',')[0]?.trim() ||
        q
      const secondaryParts = [
        a.road && a.road !== primary ? a.road : null,
        a.neighbourhood || a.suburb || a.quarter || a.city_district,
        a.city || a.town || (lat >= 30.015 && lng >= 30.95 ? 'Sheikh Zayed City' : '6th of October City')
      ].filter(Boolean)
      const secondary = [...new Set(secondaryParts)].join(', ')
      const fullLabel = secondary && !primary.includes(secondary) ? `${primary}, ${secondary}` : primary
      return {
        id: `nom-${item.place_id}`,
        primary,
        secondary,
        fullLabel,
        lat,
        lng
      }
    })
    .filter((r) => !Number.isNaN(r.lat) && !Number.isNaN(r.lng) && isInsideServiceArea(r.lat, r.lng))
}

async function queryPhoton(q, signal) {
  const bbox = `${COVERAGE_BOUNDS.minLng},${COVERAGE_BOUNDS.minLat},${COVERAGE_BOUNDS.maxLng},${COVERAGE_BOUNDS.maxLat}`
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=30.01&lon=30.97&bbox=${bbox}&limit=6`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const data = await res.json()
  const features = data?.features || []
  return features
    .map((f, idx) => {
      const [lng, lat] = f.geometry?.coordinates || []
      const p = f.properties || {}
      const primary = p.name || p.street || p.district || q
      const secondaryParts = [
        p.street && p.street !== primary ? p.street : null,
        p.district || p.locality,
        p.city || (lat >= 30.015 && lng >= 30.95 ? 'Sheikh Zayed City' : '6th of October City')
      ].filter(Boolean)
      const secondary = [...new Set(secondaryParts)].join(', ')
      const fullLabel = secondary ? `${primary}, ${secondary}` : primary
      return {
        id: `ph-${p.osm_id || idx}-${lat}`,
        primary,
        secondary,
        fullLabel,
        lat,
        lng
      }
    })
    .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number' && isInsideServiceArea(r.lat, r.lng))
}

async function searchPlacesInZone(rawQuery, signal) {
  const trimmed = rawQuery.trim()
  if (trimmed.length < 2) return []

  // 1. Try exact query in Nominatim bounded to Sheikh Zayed & 6th of October
  let results = await queryNominatim(trimmed, signal).catch(() => [])

  // 2. If user typed a building number or extra detail (e.g., "6 شارع الحصري" or "12 Arkan St"),
  // strip leading numbers/prefixes so we still find the street/area nearby
  if (results.length === 0) {
    const cleaned = trimmed
      .replace(/^[\d٠-٩]+\s*/, '')
      .replace(/\b(بجوار|جنب|أمام|امام|near|next to|building|villa|apt|عمارة|فيلا)\b/gi, '')
      .trim()
    if (cleaned.length >= 2 && cleaned !== trimmed) {
      results = await queryNominatim(cleaned, signal).catch(() => [])
    }
  }

  // 3. Fallback to Photon (Komoot) bounded to Sheikh Zayed & 6th of October
  if (results.length === 0) {
    const cleaned = trimmed.replace(/^[\d٠-٩]+\s*/, '').trim() || trimmed
    results = await queryPhoton(cleaned, signal).catch(() => [])
  }

  // Deduplicate results that are virtually identical coordinates
  const deduped = []
  for (const r of results) {
    const exists = deduped.some(
      (d) => Math.abs(d.lat - r.lat) < 0.0004 && Math.abs(d.lng - r.lng) < 0.0004
    )
    if (!exists) deduped.push(r)
  }
  return deduped.slice(0, 6)
}

const PIN_ICON = L.divIcon({
  className: 'eghselha-map-pin',
  html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-100%);">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#141415" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
})

export default function LocationPicker({
  value = '',
  latitude = null,
  longitude = null,
  onChange,
  error = ''
}) {
  const [locatingGps, setLocatingGps] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [mapOpen, setMapOpen] = useState(false)

  // Draft state inside map modal
  const [draftCoords, setDraftCoords] = useState(() =>
    latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 30.0226, lng: 31.0031 }
  )
  const [draftAddress, setDraftAddress] = useState(value || '')
  const [resolvingAddr, setResolvingAddr] = useState(false)
  const [outOfZone, setOutOfZone] = useState(false)

  // Live address search state inside modal
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchTouched, setSearchTouched] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const searchAbortRef = useRef(null)

  const selectPointInMap = async (lat, lng, presetLabel = null) => {
    const inside = isInsideServiceArea(lat, lng)
    setDraftCoords({ lat, lng })
    setOutOfZone(!inside)

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else if (mapInstanceRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: PIN_ICON, draggable: true }).addTo(mapInstanceRef.current)
      markerRef.current.on('dragend', (ev) => {
        const pos = ev.target.getLatLng()
        selectPointInMap(pos.lat, pos.lng)
      })
    }

    if (presetLabel) {
      setDraftAddress(presetLabel)
      setResolvingAddr(false)
      return
    }

    setResolvingAddr(true)
    const resolved = await reverseGeocode(lat, lng)
    setDraftAddress(resolved)
    setResolvingAddr(false)
  }

  // Debounced live search when user types in the map search box
  useEffect(() => {
    if (!mapOpen) return
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      setSearching(false)
      setSearchTouched(false)
      return
    }

    const timer = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller

      setSearching(true)
      setSearchTouched(true)
      setShowDropdown(true)
      try {
        const results = await searchPlacesInZone(q, controller.signal)
        if (!controller.signal.aborted) {
          setSearchResults(results)
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false)
        }
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery, mapOpen])

  // Initialize Leaflet map when modal opens
  useEffect(() => {
    if (!mapOpen || !mapContainerRef.current) return

    setSearchQuery('')
    setSearchResults([])
    setSearchTouched(false)
    setShowDropdown(false)

    const initLat = latitude && isInsideServiceArea(latitude, longitude) ? latitude : 30.0226
    const initLng = longitude && isInsideServiceArea(latitude, longitude) ? longitude : 31.0031

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Highlight Sheikh Zayed & 6th of October coverage area
    const zoneRect = L.rectangle(
      [
        [COVERAGE_BOUNDS.minLat, COVERAGE_BOUNDS.minLng],
        [COVERAGE_BOUNDS.maxLat, COVERAGE_BOUNDS.maxLng]
      ],
      {
        color: '#141415',
        weight: 2,
        dashArray: '6 4',
        fillColor: '#141415',
        fillOpacity: 0.06
      }
    ).addTo(map)

    zoneRect.bindTooltip('EGHSELHA Coverage: Sheikh Zayed & 6th of October', {
      sticky: false,
      direction: 'top'
    })

    const marker = L.marker([initLat, initLng], { icon: PIN_ICON, draggable: true }).addTo(map)
    marker.on('dragend', (ev) => {
      const pos = ev.target.getLatLng()
      selectPointInMap(pos.lat, pos.lng)
    })

    map.on('click', (e) => {
      setShowDropdown(false)
      selectPointInMap(e.latlng.lat, e.latlng.lng)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    setDraftCoords({ lat: initLat, lng: initLng })
    setOutOfZone(!isInsideServiceArea(initLat, initLng))
    if (!value) {
      setResolvingAddr(true)
      reverseGeocode(initLat, initLng).then((resolved) => {
        setDraftAddress(resolved)
        setResolvingAddr(false)
      })
    } else {
      setDraftAddress(value)
    }

    setTimeout(() => map.invalidateSize(), 150)

    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort()
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [mapOpen])

  const handleSelectSuggestion = (item) => {
    setShowDropdown(false)
    setSearchQuery(item.primary)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { duration: 0.7 })
    }
    selectPointInMap(item.lat, item.lng, item.fullLabel)
  }

  const handleUseCurrentLocation = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please search & pick your location on the map.')
      return
    }

    setLocatingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const resolved = await reverseGeocode(lat, lng)
        setLocatingGps(false)

        if (!isInsideServiceArea(lat, lng)) {
          setGpsError(
            `Detected location (${resolved}) is outside our Sheikh Zayed & 6th of October service area. Please search or pick a location inside the coverage zone on the map.`
          )
          return
        }

        onChange({ address: resolved, latitude: lat, longitude: lng })
      },
      (err) => {
        setLocatingGps(false)
        if (err.code === 1) {
          setGpsError('Location permission denied. Allow GPS access or search & pick your location on the map.')
        } else {
          setGpsError('Could not detect GPS location automatically. Please search & pick your location on the map.')
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  const handleConfirmMapLocation = () => {
    if (outOfZone || !draftAddress) return
    onChange({
      address: draftAddress,
      latitude: Number(draftCoords.lat.toFixed(6)),
      longitude: Number(draftCoords.lng.toFixed(6))
    })
    setGpsError('')
    setMapOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Action Buttons: GPS or Search/Map */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn primary sm"
          onClick={handleUseCurrentLocation}
          disabled={locatingGps}
          style={{ flex: 1, minWidth: '175px' }}
        >
          {locatingGps ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {locatingGps ? 'Detecting GPS...' : 'Use My Current Location'}
        </button>

        <button
          type="button"
          className="btn outline sm"
          onClick={() => {
            setGpsError('')
            setMapOpen(true)
          }}
          style={{ flex: 1, minWidth: '185px' }}
        >
          <MapIcon size={14} /> Search &amp; Pick on Map
        </button>
      </div>

      {/* Selected Location Read-Only Card */}
      {value ? (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
            <MapPin size={17} color="#141415" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: '12px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>
                {value}
              </b>
              {latitude && longitude && (
                <small style={{ fontSize: '10px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <CheckCircle2 size={11} /> GPS Verified ({Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}) · Sheikh Zayed / 6th of October
                </small>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn soft sm"
            onClick={() => setMapOpen(true)}
            style={{ flexShrink: 0 }}
          >
            Change
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: error ? '1.5px solid #ef4444' : '1px dashed #cbd5e1',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={15} color="#94a3b8" />
          <span>No location selected yet. Detect your GPS location or search &amp; pin your spot on the Sheikh Zayed / 6th of October map.</span>
        </div>
      )}

      {gpsError && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Search & Map Picker Modal */}
      {mapOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMapOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            backgroundColor: 'rgba(6, 12, 24, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '740px',
              maxHeight: '92vh',
              background: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(15, 15, 16, 0.35)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                background: '#0f0f10',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                  Search &amp; Select Location on Map
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#d49b4b' }}>
                  Search any street, compound, or landmark in Sheikh Zayed &amp; 6th of October, then fine-tune the pin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Autocomplete Search Bar */}
            <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 1000 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true)
                  }}
                  placeholder="Search street, district, or compound (e.g. El Hosary, Arkan Plaza, شارع الحصري, الحي السابع)..."
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                {searching ? (
                  <Loader2
                    size={16}
                    color="#141415"
                    className="animate-spin"
                    style={{ position: 'absolute', right: '12px' }}
                  />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setShowDropdown(false)
                      setSearchTouched(false)
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showDropdown && (searchResults.length > 0 || (searchTouched && !searching)) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% - 6px)',
                    left: '18px',
                    right: '18px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 1200
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          background: '#ffffff',
                          border: 'none',
                          borderBottom: idx < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                      >
                        <MapPin size={15} color="#141415" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.primary}
                          </div>
                          {item.secondary && (
                            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.secondary}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>
                      No matching places found inside Sheikh Zayed &amp; 6th of October. Try a nearby street or landmark name, or click directly on the map.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Map Canvas */}
            <div ref={mapContainerRef} style={{ width: '100%', height: '360px', background: '#e2e8f0' }} />

            {/* Selected Pin Readout & Actions */}
            <div style={{ padding: '16px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff' }}>
              {outOfZone ? (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>This pin is outside our Sheikh Zayed &amp; 6th of October coverage zone (dashed blue box). Please search or tap inside the zone.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '10px 14px', borderRadius: '10px' }}>
                  <MapPin size={18} color="#141415" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>
                      {resolvingAddr ? 'Resolving address...' : draftAddress || 'Search above or tap on map to pick a location'}
                    </b>
                    <small style={{ fontSize: '10px', color: '#92400e' }}>
                      Lat: {draftCoords.lat.toFixed(5)} · Lng: {draftCoords.lng.toFixed(5)} · Drag the pin or tap map to adjust exact spot
                    </small>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn outline" onClick={() => setMapOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn primary"
                  disabled={outOfZone || resolvingAddr || !draftAddress}
                  onClick={handleConfirmMapLocation}
                >
                  <CheckCircle2 size={15} /> Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

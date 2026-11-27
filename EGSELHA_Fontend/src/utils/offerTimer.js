// Persistent wall-clock 30-minute offer deadline tracker (survives route switches & tab close/reopen)
const STORAGE_KEY = 'eghselha_offer_deadlines_v1'
const OFFER_DURATION_MS = 30 * 60 * 1000 // 30 minutes

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore storage quota errors
  }
}

function parseUtcTimestamp(raw) {
  if (!raw) return NaN
  const str = String(raw).trim()
  if (!str) return NaN
  // Append 'Z' if backend returned an ISO datetime without timezone offset
  const normalized = /([zZ]|[+-]\d{2}:?\d{2})$/.test(str) ? str : `${str}Z`
  return new Date(normalized).getTime()
}

export function getOfferDeadlineMs(offer) {
  if (!offer?.id) return Date.now() + OFFER_DURATION_MS

  const now = Date.now()
  const rawServerExpiry = offer.expiresAtUtc || offer.expiresAt
  const parsedServer = parseUtcTimestamp(rawServerExpiry)

  const map = readMap()
  // If server gave a fresh future deadline (e.g. offer refreshed), always honor it over a stale expired cache
  if (!Number.isNaN(parsedServer) && parsedServer > now + 5000) {
    if (!map[offer.id] || map[offer.id] < now || Math.abs(map[offer.id] - parsedServer) > 60 * 1000) {
      map[offer.id] = parsedServer
      writeMap(map)
    }
    return map[offer.id]
  }

  if (map[offer.id] && map[offer.id] > now) {
    return map[offer.id]
  }

  const deadline = now + OFFER_DURATION_MS
  map[offer.id] = deadline
  // Prune stale entries older than 24h
  const cutoff = now - 24 * 60 * 60 * 1000
  for (const key of Object.keys(map)) {
    if (map[key] < cutoff) delete map[key]
  }
  writeMap(map)
  return deadline
}

export function getOfferRemainingSeconds(offer, nowMs = Date.now()) {
  if (!offer?.id) return 0
  const deadline = getOfferDeadlineMs(offer)
  return Math.max(0, Math.ceil((deadline - nowMs) / 1000))
}

export function clearOfferDeadline(offerId) {
  if (!offerId) return
  const map = readMap()
  if (map[offerId]) {
    delete map[offerId]
    writeMap(map)
  }
}

export function formatOfferCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

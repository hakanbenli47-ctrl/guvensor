"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Point = { lat: number; lng: number };
type Destination = Point & { label: string };
type SearchResult = Destination & { subtitle: string };
type LeafletLayer = {
  setLatLng?: (latlng: [number, number]) => LeafletLayer;
  setRadius?: (radius: number) => LeafletLayer;
  addTo?: (map: LeafletMap) => LeafletLayer;
  remove?: () => void;
};
type LeafletMap = {
  setView: (latlng: [number, number], zoom?: number, options?: Record<string, unknown>) => LeafletMap;
  on: (event: string, handler: (event: { latlng: Point }) => void) => LeafletMap;
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => LeafletMap;
  remove: () => void;
};
type LeafletApi = {
  map: (node: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
  divIcon: (options: Record<string, unknown>) => unknown;
  marker: (latlng: [number, number], options?: Record<string, unknown>) => LeafletLayer;
  circle: (latlng: [number, number], options?: Record<string, unknown>) => LeafletLayer;
  polyline: (latlngs: [number, number][], options?: Record<string, unknown>) => LeafletLayer;
  latLngBounds: (latlngs: [number, number][]) => unknown;
};

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const SPEED_OPTIONS = [
  { value: "live", label: "Anlık hız" },
  { value: "30", label: "30 km/sa" },
  { value: "50", label: "50 km/sa" },
  { value: "70", label: "70 km/sa" },
  { value: "90", label: "90 km/sa" },
  { value: "110", label: "110 km/sa" },
];

function haversine(a: Point, b: Point) {
  const r = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function formatDistance(meters: number | null) {
  if (meters == null || !Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function formatEta(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return "< 1 dk";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours} sa ${mins} dk` : `${hours} sa`;
}

function getSearchLabel(properties: Record<string, unknown>) {
  const name = String(properties.name || properties.street || properties.city || "Seçilen konum");
  const pieces = [properties.district, properties.city, properties.state, properties.country]
    .filter(Boolean)
    .map(String);
  return { name, subtitle: [...new Set(pieces)].join(" · ") };
}

export default function Home() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletLayer | null>(null);
  const accuracyCircleRef = useRef<LeafletLayer | null>(null);
  const destinationMarkerRef = useRef<LeafletLayer | null>(null);
  const routeLayerRef = useRef<LeafletLayer | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const currentPointRef = useRef<Point | null>(null);
  const previousFixRef = useRef<(Point & { time: number }) | null>(null);
  const destinationRef = useRef<Destination | null>(null);
  const lastRouteRequestRef = useRef<(Point & { time: number }) | null>(null);
  const routeBaseMetersRef = useRef<number | null>(null);
  const travelledSinceRouteRef = useRef(0);
  const lastTravelPointRef = useRef<Point | null>(null);
  const speedRef = useRef(0);

  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("Konum takibi henüz başlamadı");
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [remainingMeters, setRemainingMeters] = useState<number | null>(null);
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeNote, setRouteNote] = useState("Hedef seçildiğinde araç rotası hesaplanır");
  const [etaMode, setEtaMode] = useState("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  const etaSeconds = useMemo(() => {
    if (remainingMeters == null) return null;
    const chosenSpeed = etaMode === "live" ? speed : Number(etaMode);
    if (!chosenSpeed || chosenSpeed < 3) return null;
    return remainingMeters / ((chosenSpeed * 1000) / 3600);
  }, [remainingMeters, etaMode, speed]);

  async function calculateRoute(from: Point, to: Destination) {
    setRouteBusy(true);
    setRouteNote("Rota güncelleniyor…");
    lastRouteRequestRef.current = { ...from, time: Date.now() };
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Rota servisine ulaşılamadı");
      const data = await response.json();
      const route = data?.routes?.[0];
      if (!route) throw new Error("Bu hedef için araç rotası bulunamadı");

      const meters = Number(route.distance);
      routeBaseMetersRef.current = meters;
      travelledSinceRouteRef.current = 0;
      lastTravelPointRef.current = from;
      setRemainingMeters(meters);
      setRouteNote("Yol mesafesi canlı konuma göre güncelleniyor");

      const coords: [number, number][] = (route.geometry?.coordinates || []).map(
        (coordinate: [number, number]) => [coordinate[1], coordinate[0]],
      );
      const L = window.L;
      if (L && mapRef.current && coords.length) {
        routeLayerRef.current?.remove?.();
        routeLayerRef.current = L.polyline(coords, {
          color: "#38bdf8",
          weight: 6,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo?.(mapRef.current) || null;
        mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [44, 44], maxZoom: 16 });
      }
    } catch (error) {
      const direct = haversine(from, to);
      routeBaseMetersRef.current = direct;
      travelledSinceRouteRef.current = 0;
      lastTravelPointRef.current = from;
      setRemainingMeters(direct);
      setRouteNote(error instanceof Error ? `${error.message}. Kuş uçuşu mesafe gösteriliyor.` : "Rota alınamadı");
    } finally {
      setRouteBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const initMap = () => {
      if (cancelled || mapRef.current || !mapNodeRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(mapNodeRef.current, { zoomControl: true }).setView([39.0, 35.0], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap katkıda bulunanlar",
      }).addTo?.(map);
      map.on("click", (event) => {
        setDestination({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
          label: "Haritada seçilen hedef",
        });
        setSearchResults([]);
      });
      mapRef.current = map;
      setMapReady(true);
    };

    if (window.L) {
      initMap();
    } else {
      script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      script.onerror = () => setStatus("Harita yüklenemedi. İnternet bağlantısını kontrol et.");
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      mapRef.current?.remove();
      mapRef.current = null;
      if (script?.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !destination || !window.L || !mapRef.current) return;
    destinationMarkerRef.current?.remove?.();
    const icon = window.L.divIcon({
      className: "",
      html: '<div class="destination-pin"><span></span></div>',
      iconSize: [36, 44],
      iconAnchor: [18, 42],
    });
    destinationMarkerRef.current =
      window.L.marker([destination.lat, destination.lng], { icon }).addTo?.(mapRef.current) || null;

    const from = currentPointRef.current;
    if (from) void calculateRoute(from, destination);
  }, [destination, mapReady]);

  function stopTracking() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setStatus("Takip durduruldu");
  }

  function startTracking() {
    if (!window.isSecureContext) {
      setStatus("Konum takibi için sayfanın HTTPS üzerinden açılması gerekiyor.");
      return;
    }
    if (!("geolocation" in navigator)) {
      setStatus("Bu cihaz konum takibini desteklemiyor.");
      return;
    }

    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    setStatus("Konum izni bekleniyor…");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        const now = position.timestamp || Date.now();
        currentPointRef.current = point;
        setCurrentPoint(point);
        setAccuracy(position.coords.accuracy);
        setHeading(position.coords.heading != null && Number.isFinite(position.coords.heading) ? position.coords.heading : null);
        setTracking(true);
        setStatus("Canlı GPS takibi açık");

        const L = window.L;
        if (L && mapRef.current) {
          if (!userMarkerRef.current) {
            const icon = L.divIcon({
              className: "",
              html: '<div class="user-location"><span></span></div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            userMarkerRef.current = L.marker([point.lat, point.lng], { icon }).addTo?.(mapRef.current) || null;
          } else {
            userMarkerRef.current.setLatLng?.([point.lat, point.lng]);
          }
          if (!accuracyCircleRef.current) {
            accuracyCircleRef.current =
              L.circle([point.lat, point.lng], {
                radius: position.coords.accuracy,
                color: "#38bdf8",
                weight: 1,
                opacity: 0.35,
                fillColor: "#38bdf8",
                fillOpacity: 0.08,
              }).addTo?.(mapRef.current) || null;
          } else {
            accuracyCircleRef.current.setLatLng?.([point.lat, point.lng]);
            accuracyCircleRef.current.setRadius?.(position.coords.accuracy);
          }
        }

        const previousFix = previousFixRef.current;
        let rawSpeed = position.coords.speed != null && position.coords.speed >= 0 ? position.coords.speed * 3.6 : null;
        if (rawSpeed == null && previousFix) {
          const dt = (now - previousFix.time) / 1000;
          if (dt > 0.5 && dt < 30) {
            rawSpeed = (haversine(previousFix, point) / dt) * 3.6;
          }
        }
        previousFixRef.current = { ...point, time: now };
        if (rawSpeed != null && Number.isFinite(rawSpeed)) {
          if (rawSpeed < 1.5) rawSpeed = 0;
          if (rawSpeed < 300) {
            const smoothed = speedRef.current === 0 ? rawSpeed : speedRef.current * 0.58 + rawSpeed * 0.42;
            speedRef.current = smoothed;
            setSpeed(smoothed);
          }
        }

        const lastTravel = lastTravelPointRef.current;
        if (lastTravel && routeBaseMetersRef.current != null) {
          const step = haversine(lastTravel, point);
          if (step > 1 && step < 1000) travelledSinceRouteRef.current += step;
          setRemainingMeters(Math.max(0, routeBaseMetersRef.current - travelledSinceRouteRef.current));
        }
        lastTravelPointRef.current = point;

        const target = destinationRef.current;
        if (target) {
          const lastRoute = lastRouteRequestRef.current;
          const enoughTime = !lastRoute || Date.now() - lastRoute.time > 20000;
          const enoughMovement = !lastRoute || haversine(lastRoute, point) > 75;
          if (enoughTime && enoughMovement) void calculateRoute(point, target);
        }
      },
      (error) => {
        setTracking(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Konum izni kapalı. Tarayıcı ayarlarından konum iznini açmalısın.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("GPS konumu şu anda alınamıyor.");
        } else {
          setStatus("Konum alınırken zaman aşımı oldu. Tekrar dene.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 },
    );
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchError("En az 2 karakter yaz.");
      return;
    }
    setSearchBusy(true);
    setSearchError("");
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=tr`);
      if (!response.ok) throw new Error("Arama servisine ulaşılamadı");
      const data = await response.json();
      const results: SearchResult[] = (data.features || []).map((feature: { geometry: { coordinates: [number, number] }; properties: Record<string, unknown> }) => {
        const { name, subtitle } = getSearchLabel(feature.properties || {});
        return {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          label: name,
          subtitle,
        };
      });
      setSearchResults(results);
      if (!results.length) setSearchError("Sonuç bulunamadı. Haritadan hedef seçebilirsin.");
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Konum aranamadı");
    } finally {
      setSearchBusy(false);
    }
  }

  function chooseSearchResult(result: SearchResult) {
    setDestination({ lat: result.lat, lng: result.lng, label: result.label });
    setSearchQuery(result.label);
    setSearchResults([]);
    mapRef.current?.setView([result.lat, result.lng], 15, { animate: true });
  }

  function centerOnMe() {
    const point = currentPointRef.current;
    if (!point || !mapRef.current) return;
    mapRef.current.setView([point.lat, point.lng], 16, { animate: true });
  }

  function clearDestination() {
    setDestination(null);
    destinationRef.current = null;
    destinationMarkerRef.current?.remove?.();
    destinationMarkerRef.current = null;
    routeLayerRef.current?.remove?.();
    routeLayerRef.current = null;
    routeBaseMetersRef.current = null;
    travelledSinceRouteRef.current = 0;
    setRemainingMeters(null);
    setRouteNote("Hedef seçildiğinde araç rotası hesaplanır");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <div className="eyebrow"><span className={tracking ? "live-dot active" : "live-dot"} /> CANLI YOL TAKİBİ</div>
          <h1>Hızını gör. Hedefini seç. Ne zaman varacağını bil.</h1>
          <p>GPS konumun cihazından okunur; anlık hız, kalan yol ve tahmini varış süresi hareket ettikçe güncellenir.</p>
        </div>
        <div className="top-actions">
          {tracking ? (
            <button className="button secondary" onClick={stopTracking}>Takibi durdur</button>
          ) : (
            <button className="button primary" onClick={startTracking}>Konumumu kullan</button>
          )}
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="control-panel">
          <div className="status-card">
            <div className="status-row">
              <span className="status-label">GPS durumu</span>
              <span className={tracking ? "status-badge online" : "status-badge"}>{tracking ? "CANLI" : "BEKLİYOR"}</span>
            </div>
            <strong>{status}</strong>
            <div className="mini-grid">
              <div><span>Doğruluk</span><b>{accuracy == null ? "—" : `±${Math.round(accuracy)} m`}</b></div>
              <div><span>Yön</span><b>{heading == null ? "—" : `${Math.round(heading)}°`}</b></div>
            </div>
          </div>

          <div className="speed-card">
            <span className="card-kicker">ANLIK HIZ</span>
            <div className="speed-value"><strong>{Math.round(speed)}</strong><span>km/sa</span></div>
            <div className="speed-bar"><i style={{ width: `${Math.min(100, (speed / 140) * 100)}%` }} /></div>
            <span className="microcopy">GPS ölçümüne göre otomatik hesaplanır.</span>
          </div>

          <div className="field-group">
            <label htmlFor="eta-speed">Varış süresi hangi hıza göre hesaplansın?</label>
            <select id="eta-speed" value={etaMode} onChange={(event) => setEtaMode(event.target.value)}>
              {SPEED_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {etaMode === "live" && speed < 3 && <p className="hint">Anlık hız seçili. Hareket etmeye başlayınca süre görünür.</p>}
          </div>

          <div className="field-group destination-search">
            <label htmlFor="destination-search">Hedef ara</label>
            <form onSubmit={handleSearch} className="search-row">
              <input id="destination-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Örn. Antalya Otogar" autoComplete="off" />
              <button type="submit" disabled={searchBusy}>{searchBusy ? "…" : "Ara"}</button>
            </form>
            <p className="hint">İstersen haritada herhangi bir noktaya dokunarak da hedef seçebilirsin.</p>
            {searchError && <p className="error-text">{searchError}</p>}
            {!!searchResults.length && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <button key={`${result.lat}-${result.lng}-${index}`} onClick={() => chooseSearchResult(result)}>
                    <strong>{result.label}</strong><span>{result.subtitle || "Konum"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {destination && (
            <div className="destination-card">
              <div><span>HEDEF</span><strong>{destination.label}</strong></div>
              <button onClick={clearDestination}>Temizle</button>
            </div>
          )}
        </aside>

        <div className="map-column">
          <div className="map-wrap">
            <div ref={mapNodeRef} id="live-map" aria-label="Canlı konum ve hedef haritası" />
            <div className="map-hint">Haritaya dokun: hedef seç</div>
            <button className="locate-button" onClick={centerOnMe} disabled={!currentPoint} aria-label="Konumuma dön">⌖</button>
          </div>

          <div className="metric-grid">
            <div className="metric-card accent">
              <span>KALAN YOL</span>
              <strong>{formatDistance(remainingMeters)}</strong>
              <small>{routeBusy ? "Rota hesaplanıyor…" : routeNote}</small>
            </div>
            <div className="metric-card">
              <span>TAHMİNİ VARIŞ</span>
              <strong>{formatEta(etaSeconds)}</strong>
              <small>{etaMode === "live" ? `Anlık ${Math.round(speed)} km/sa ile` : `${etaMode} km/sa sabit hız ile`}</small>
            </div>
            <div className="metric-card">
              <span>KONUM</span>
              <strong className="coords">{currentPoint ? `${currentPoint.lat.toFixed(5)}, ${currentPoint.lng.toFixed(5)}` : "—"}</strong>
              <small>{tracking ? "GPS canlı" : "Konum takibi kapalı"}</small>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span>Hız ve varış süresi tahminidir; sürüş sırasında ekranla ilgilenme.</span>
        <span>Harita: OpenStreetMap · Rota: OSRM</span>
      </footer>
    </main>
  );
}

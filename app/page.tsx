"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Point = { lat: number; lng: number };
type Destination = Point & { label: string };
type SearchResult = Destination & { subtitle: string };
type VehicleType = "car" | "van" | "minibus";
type RadarPoint = Point & { id: number; maxSpeed: number | null; ref: string };
type RoadInfo = { name: string; highway: string; maxSpeed: number | null };
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
  interface Window { L?: LeafletApi; }
}

const SPEED_OPTIONS = [
  { value: "live", label: "Anlık hız" },
  { value: "30", label: "30 km/sa" },
  { value: "50", label: "50 km/sa" },
  { value: "70", label: "70 km/sa" },
  { value: "90", label: "90 km/sa" },
  { value: "110", label: "110 km/sa" },
];

const VEHICLES: Record<VehicleType, {
  label: string;
  short: string;
  limits: { urban: string; twoWay: string; divided: string; motorway: string };
}> = {
  car: { label: "Otomobil", short: "Otomobil", limits: { urban: "50", twoWay: "90", divided: "110", motorway: "130–140" } },
  van: { label: "Kamyonet", short: "Kamyonet", limits: { urban: "50", twoWay: "80", divided: "85", motorway: "95" } },
  minibus: { label: "Minibüs", short: "Minibüs", limits: { urban: "50", twoWay: "80", divided: "90", motorway: "100" } },
};

function haversine(a: Point, b: Point) {
  const r = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
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
  const pieces = [properties.district, properties.city, properties.state, properties.country].filter(Boolean).map(String);
  return { name, subtitle: [...new Set(pieces)].join(" · ") };
}

function parseMaxSpeed(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const match = String(value).match(/\d{2,3}/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return parsed > 0 && parsed <= 200 ? parsed : null;
}

function closestRouteIndex(point: Point, route: [number, number][]) {
  if (!route.length) return -1;
  const step = Math.max(1, Math.floor(route.length / 700));
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < route.length; index += step) {
    const distance = haversine(point, { lat: route[index][0], lng: route[index][1] });
    if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
  }
  if ((route.length - 1) % step !== 0) {
    const lastIndex = route.length - 1;
    const distance = haversine(point, { lat: route[lastIndex][0], lng: route[lastIndex][1] });
    if (distance < bestDistance) bestIndex = lastIndex;
  }
  return bestIndex;
}

function distanceToRoute(point: Point, route: [number, number][]) {
  if (!route.length) return Number.POSITIVE_INFINITY;
  const step = Math.max(1, Math.floor(route.length / 700));
  let best = Number.POSITIVE_INFINITY;
  for (let index = 0; index < route.length; index += step) {
    best = Math.min(best, haversine(point, { lat: route[index][0], lng: route[index][1] }));
  }
  return best;
}

export default function Home() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletLayer | null>(null);
  const accuracyCircleRef = useRef<LeafletLayer | null>(null);
  const destinationMarkerRef = useRef<LeafletLayer | null>(null);
  const routeLayerRef = useRef<LeafletLayer | null>(null);
  const radarMarkerRefs = useRef<LeafletLayer[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const currentPointRef = useRef<Point | null>(null);
  const previousFixRef = useRef<(Point & { time: number }) | null>(null);
  const destinationRef = useRef<Destination | null>(null);
  const lastRouteRequestRef = useRef<(Point & { time: number }) | null>(null);
  const routeBaseMetersRef = useRef<number | null>(null);
  const travelledSinceRouteRef = useRef(0);
  const lastTravelPointRef = useRef<Point | null>(null);
  const speedRef = useRef(0);
  const lastRadarFetchRef = useRef<(Point & { time: number }) | null>(null);
  const radarFetchBusyRef = useRef(false);

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
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [radarPoints, setRadarPoints] = useState<RadarPoint[]>([]);
  const [radarStatus, setRadarStatus] = useState("GPS açılınca rota çevresindeki sabit radarlar taranır");
  const [roadInfo, setRoadInfo] = useState<RoadInfo | null>(null);

  useEffect(() => { destinationRef.current = destination; }, [destination]);

  const etaSeconds = useMemo(() => {
    if (remainingMeters == null) return null;
    const chosenSpeed = etaMode === "live" ? speed : Number(etaMode);
    if (!chosenSpeed || chosenSpeed < 3) return null;
    return remainingMeters / ((chosenSpeed * 1000) / 3600);
  }, [remainingMeters, etaMode, speed]);

  const visibleRadarPoints = useMemo(() => {
    if (!routeCoords.length) return radarPoints;
    return radarPoints.filter((radar) => distanceToRoute(radar, routeCoords) <= 650);
  }, [radarPoints, routeCoords]);

  const upcomingRadars = useMemo(() => {
    if (!currentPoint) return [] as Array<RadarPoint & { distance: number; routeIndex: number }>;
    const currentRouteIndex = closestRouteIndex(currentPoint, routeCoords);
    return radarPoints
      .map((radar) => ({ ...radar, distance: haversine(currentPoint, radar), routeIndex: closestRouteIndex(radar, routeCoords), routeDistance: distanceToRoute(radar, routeCoords) }))
      .filter((radar) => {
        if (radar.distance > 20000) return false;
        if (!routeCoords.length) return true;
        return radar.routeDistance <= 650 && radar.routeIndex >= Math.max(0, currentRouteIndex - 5);
      })
      .sort((a, b) => routeCoords.length && a.routeIndex !== b.routeIndex ? a.routeIndex - b.routeIndex : a.distance - b.distance)
      .slice(0, 8);
  }, [currentPoint, radarPoints, routeCoords]);

  const nextRadar = upcomingRadars[0] || null;
  const selectedVehicle = VEHICLES[vehicleType];

  async function fetchRoadAndRadars(point: Point) {
    if (radarFetchBusyRef.current) return;
    radarFetchBusyRef.current = true;
    lastRadarFetchRef.current = { ...point, time: Date.now() };
    setRadarStatus("Sabit radar verisi güncelleniyor…");
    const query = `[out:json][timeout:14];(node["highway"="speed_camera"](around:20000,${point.lat},${point.lng});way["highway"](around:90,${point.lat},${point.lng}););out tags geom;`;
    const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
    try {
      let data: { elements?: Array<Record<string, unknown>> } | null = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { cache: "no-store" });
          if (!response.ok) continue;
          data = await response.json();
          break;
        } catch {}
      }
      if (!data) throw new Error("Radar veri servisine ulaşılamadı");
      const elements = data.elements || [];
      const radars: RadarPoint[] = [];
      const roads: Array<{ tags: Record<string, unknown>; geometry: Array<{ lat: number; lon: number }> }> = [];
      for (const element of elements) {
        const tags = (element.tags || {}) as Record<string, unknown>;
        if (element.type === "node" && tags.highway === "speed_camera") {
          const lat = Number(element.lat);
          const lng = Number(element.lon);
          if (Number.isFinite(lat) && Number.isFinite(lng)) radars.push({ id: Number(element.id), lat, lng, maxSpeed: parseMaxSpeed(tags.maxspeed), ref: String(tags.ref || "") });
        }
        if (element.type === "way" && Array.isArray(element.geometry)) roads.push({ tags, geometry: element.geometry as Array<{ lat: number; lon: number }> });
      }
      setRadarPoints(radars);
      setRadarStatus(radars.length ? `${radars.length} sabit radar kaydı yakında bulundu` : "Yakında kayıtlı sabit radar bulunamadı");
      let nearestRoad: { tags: Record<string, unknown>; distance: number } | null = null;
      for (const road of roads) {
        let distance = Number.POSITIVE_INFINITY;
        for (const vertex of road.geometry) distance = Math.min(distance, haversine(point, { lat: vertex.lat, lng: vertex.lon }));
        if (!nearestRoad || distance < nearestRoad.distance) nearestRoad = { tags: road.tags, distance };
      }
      if (nearestRoad && nearestRoad.distance <= 90) {
        setRoadInfo({ name: String(nearestRoad.tags.name || nearestRoad.tags.ref || "Bulunduğun yol"), highway: String(nearestRoad.tags.highway || ""), maxSpeed: parseMaxSpeed(nearestRoad.tags.maxspeed) });
      } else setRoadInfo(null);
    } catch (error) {
      setRadarStatus(error instanceof Error ? error.message : "Radar verisi alınamadı");
    } finally { radarFetchBusyRef.current = false; }
  }

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
      const coords: [number, number][] = (route.geometry?.coordinates || []).map((coordinate: [number, number]) => [coordinate[1], coordinate[0]]);
      setRouteCoords(coords);
      const L = window.L;
      if (L && mapRef.current && coords.length) {
        routeLayerRef.current?.remove?.();
        routeLayerRef.current = L.polyline(coords, { color: "#38bdf8", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo?.(mapRef.current) || null;
        mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [44, 44], maxZoom: 16 });
      }
      void fetchRoadAndRadars(from);
    } catch (error) {
      const direct = haversine(from, to);
      routeBaseMetersRef.current = direct;
      travelledSinceRouteRef.current = 0;
      lastTravelPointRef.current = from;
      setRouteCoords([]);
      setRemainingMeters(direct);
      setRouteNote(error instanceof Error ? `${error.message}. Kuş uçuşu mesafe gösteriliyor.` : "Rota alınamadı");
    } finally { setRouteBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;
    const initMap = () => {
      if (cancelled || mapRef.current || !mapNodeRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(mapNodeRef.current, { zoomControl: true }).setView([39.0, 35.0], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap katkıda bulunanlar" }).addTo?.(map);
      map.on("click", (event) => { setDestination({ lat: event.latlng.lat, lng: event.latlng.lng, label: "Haritada seçilen hedef" }); setSearchResults([]); });
      mapRef.current = map;
      setMapReady(true);
    };
    if (window.L) initMap();
    else {
      script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      script.onerror = () => setStatus("Harita yüklenemedi. İnternet bağlantısını kontrol et.");
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (watchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      if (script?.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !destination || !window.L || !mapRef.current) return;
    destinationMarkerRef.current?.remove?.();
    const icon = window.L.divIcon({ className: "", html: '<div class="destination-pin"><span></span></div>', iconSize: [36, 44], iconAnchor: [18, 42] });
    destinationMarkerRef.current = window.L.marker([destination.lat, destination.lng], { icon }).addTo?.(mapRef.current) || null;
    const from = currentPointRef.current;
    if (from) void calculateRoute(from, destination);
  }, [destination, mapReady]);

  useEffect(() => {
    radarMarkerRefs.current.forEach((layer) => layer.remove?.());
    radarMarkerRefs.current = [];
    if (!mapReady || !window.L || !mapRef.current) return;
    const L = window.L;
    for (const radar of visibleRadarPoints) {
      const icon = L.divIcon({ className: "", html: `<div class="radar-pin"><span>R</span>${radar.maxSpeed ? `<b>${radar.maxSpeed}</b>` : ""}</div>`, iconSize: [42, 48], iconAnchor: [21, 44] });
      const marker = L.marker([radar.lat, radar.lng], { icon }).addTo?.(mapRef.current);
      if (marker) radarMarkerRefs.current.push(marker);
    }
  }, [mapReady, visibleRadarPoints]);

  function stopTracking() {
    if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setTracking(false);
    setStatus("Takip durduruldu");
  }

  function startTracking() {
    if (!window.isSecureContext) { setStatus("Konum takibi için sayfanın HTTPS üzerinden açılması gerekiyor."); return; }
    if (!("geolocation" in navigator)) { setStatus("Bu cihaz konum takibini desteklemiyor."); return; }
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
            const icon = L.divIcon({ className: "", html: '<div class="user-location"><span></span></div>', iconSize: [32, 32], iconAnchor: [16, 16] });
            userMarkerRef.current = L.marker([point.lat, point.lng], { icon }).addTo?.(mapRef.current) || null;
          } else userMarkerRef.current.setLatLng?.([point.lat, point.lng]);
          if (!accuracyCircleRef.current) accuracyCircleRef.current = L.circle([point.lat, point.lng], { radius: position.coords.accuracy, color: "#38bdf8", weight: 1, opacity: 0.35, fillColor: "#38bdf8", fillOpacity: 0.08 }).addTo?.(mapRef.current) || null;
          else { accuracyCircleRef.current.setLatLng?.([point.lat, point.lng]); accuracyCircleRef.current.setRadius?.(position.coords.accuracy); }
        }
        const previousFix = previousFixRef.current;
        let rawSpeed = position.coords.speed != null && position.coords.speed >= 0 ? position.coords.speed * 3.6 : null;
        if (rawSpeed == null && previousFix) {
          const dt = (now - previousFix.time) / 1000;
          if (dt > 0.5 && dt < 30) rawSpeed = (haversine(previousFix, point) / dt) * 3.6;
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
        const lastRadar = lastRadarFetchRef.current;
        const radarDataOld = !lastRadar || Date.now() - lastRadar.time > 120000;
        const movedForRadar = !lastRadar || haversine(lastRadar, point) > 3000;
        if (radarDataOld || movedForRadar) void fetchRoadAndRadars(point);
      },
      (error) => {
        setTracking(false);
        if (error.code === error.PERMISSION_DENIED) setStatus("Konum izni kapalı. Tarayıcı ayarlarından konum iznini açmalısın.");
        else if (error.code === error.POSITION_UNAVAILABLE) setStatus("GPS konumu şu anda alınamıyor.");
        else setStatus("Konum alınırken zaman aşımı oldu. Tekrar dene.");
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 },
    );
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) { setSearchError("En az 2 karakter yaz."); return; }
    setSearchBusy(true);
    setSearchError("");
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=tr`);
      if (!response.ok) throw new Error("Arama servisine ulaşılamadı");
      const data = await response.json();
      const results: SearchResult[] = (data.features || []).map((feature: { geometry: { coordinates: [number, number] }; properties: Record<string, unknown> }) => {
        const { name, subtitle } = getSearchLabel(feature.properties || {});
        return { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0], label: name, subtitle };
      });
      setSearchResults(results);
      if (!results.length) setSearchError("Sonuç bulunamadı. Haritadan hedef seçebilirsin.");
    } catch (error) { setSearchError(error instanceof Error ? error.message : "Konum aranamadı"); }
    finally { setSearchBusy(false); }
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
    setRouteCoords([]);
    setRemainingMeters(null);
    setRouteNote("Hedef seçildiğinde araç rotası hesaplanır");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <div className="eyebrow"><span className={tracking ? "live-dot active" : "live-dot"} /> CANLI YOL + RADAR TAKİBİ</div>
          <h1>Hızını gör. Rotanı izle. Yaklaşan sabit radarı bil.</h1>
          <p>GPS konumu, rota, araç türüne göre yasal hız referansı ve OpenStreetMap’te kayıtlı sabit hız kameraları hareket ettikçe güncellenir.</p>
        </div>
        <div className="top-actions">{tracking ? <button className="button secondary" onClick={stopTracking}>Takibi durdur</button> : <button className="button primary" onClick={startTracking}>Konumumu kullan</button>}</div>
      </section>

      <section className="dashboard-grid">
        <aside className="control-panel">
          <div className="status-card">
            <div className="status-row"><span className="status-label">GPS durumu</span><span className={tracking ? "status-badge online" : "status-badge"}>{tracking ? "CANLI" : "BEKLİYOR"}</span></div>
            <strong>{status}</strong>
            <div className="mini-grid"><div><span>Doğruluk</span><b>{accuracy == null ? "—" : `±${Math.round(accuracy)} m`}</b></div><div><span>Yön</span><b>{heading == null ? "—" : `${Math.round(heading)}°`}</b></div></div>
          </div>

          <div className="vehicle-card">
            <span className="card-kicker">ARAÇ TÜRÜ</span>
            <div className="vehicle-tabs" role="group" aria-label="Araç türü seç">
              {(Object.keys(VEHICLES) as VehicleType[]).map((key) => <button key={key} className={vehicleType === key ? "active" : ""} onClick={() => setVehicleType(key)}>{VEHICLES[key].short}</button>)}
            </div>
            <div className="limit-grid"><div><span>Şehir içi</span><b>{selectedVehicle.limits.urban}</b></div><div><span>Çift yön</span><b>{selectedVehicle.limits.twoWay}</b></div><div><span>Bölünmüş</span><b>{selectedVehicle.limits.divided}</b></div><div><span>Otoyol</span><b>{selectedVehicle.limits.motorway}</b></div></div>
            <p className="hint">KGM genel yasal hız tablosu. Yol üzerindeki trafik işareti ve özel düzenlemeler önceliklidir.</p>
          </div>

          <div className={`radar-card ${nextRadar && nextRadar.distance <= 2000 ? "warning" : ""}`}>
            <div className="status-row"><span className="card-kicker">YAKLAŞAN SABİT RADAR</span><span className="radar-count">{upcomingRadars.length}</span></div>
            {nextRadar ? <><div className="radar-distance">{formatDistance(nextRadar.distance)}</div><div className="radar-meta"><span>{nextRadar.maxSpeed ? `Kayıtlı limit ${nextRadar.maxSpeed} km/sa` : "Radar limiti kayıtta yok"}</span><span>{selectedVehicle.label} seçili</span></div></> : <strong className="radar-empty">Rota üzerinde yaklaşan kayıtlı sabit radar yok.</strong>}
            <p className="hint">{radarStatus}</p>
          </div>

          <div className="speed-card">
            <span className="card-kicker">ANLIK HIZ</span>
            <div className="speed-value"><strong>{Math.round(speed)}</strong><span>km/sa</span></div>
            <div className="speed-bar"><i style={{ width: `${Math.min(100, (speed / 140) * 100)}%` }} /></div>
            <div className="current-road"><span>{roadInfo?.name || "Yol bilgisi bekleniyor"}</span><b>{roadInfo?.maxSpeed ? `${roadInfo.maxSpeed} km/sa` : "—"}</b></div>
            <span className="microcopy">Yol limiti yalnızca OpenStreetMap kaydında varsa gösterilir.</span>
          </div>

          <div className="field-group">
            <label htmlFor="eta-speed">Varış süresi hangi hıza göre hesaplansın?</label>
            <select id="eta-speed" value={etaMode} onChange={(event) => setEtaMode(event.target.value)}>{SPEED_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            {etaMode === "live" && speed < 3 && <p className="hint">Anlık hız seçili. Hareket etmeye başlayınca süre görünür.</p>}
          </div>

          <div className="field-group destination-search">
            <label htmlFor="destination-search">Hedef ara</label>
            <form onSubmit={handleSearch} className="search-row"><input id="destination-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Örn. Antalya Otogar" autoComplete="off" /><button type="submit" disabled={searchBusy}>{searchBusy ? "…" : "Ara"}</button></form>
            <p className="hint">İstersen haritada herhangi bir noktaya dokunarak da hedef seçebilirsin.</p>
            {searchError && <p className="error-text">{searchError}</p>}
            {!!searchResults.length && <div className="search-results">{searchResults.map((result, index) => <button key={`${result.lat}-${result.lng}-${index}`} onClick={() => chooseSearchResult(result)}><strong>{result.label}</strong><span>{result.subtitle || "Konum"}</span></button>)}</div>}
          </div>

          {destination && <div className="destination-card"><div><span>HEDEF</span><strong>{destination.label}</strong></div><button onClick={clearDestination}>Temizle</button></div>}
        </aside>

        <div className="map-column">
          <div className="map-wrap">
            <div ref={mapNodeRef} id="live-map" aria-label="Canlı konum, hedef ve sabit radar haritası" />
            <div className="map-hint">Haritaya dokun: hedef seç</div>
            {nextRadar && nextRadar.distance <= 5000 && <div className={nextRadar.distance <= 2000 ? "radar-overlay urgent" : "radar-overlay"}><span>RADAR</span><strong>{formatDistance(nextRadar.distance)}</strong><small>{nextRadar.maxSpeed ? `${nextRadar.maxSpeed} km/sa kayıtlı limit` : "Sabit radar kaydı"}</small></div>}
            <button className="locate-button" onClick={centerOnMe} disabled={!currentPoint} aria-label="Konumuma dön">⌖</button>
          </div>

          <div className="metric-grid">
            <div className="metric-card accent"><span>KALAN YOL</span><strong>{formatDistance(remainingMeters)}</strong><small>{routeBusy ? "Rota hesaplanıyor…" : routeNote}</small></div>
            <div className="metric-card"><span>TAHMİNİ VARIŞ</span><strong>{formatEta(etaSeconds)}</strong><small>{etaMode === "live" ? `Anlık ${Math.round(speed)} km/sa ile` : `${etaMode} km/sa sabit hız ile`}</small></div>
            <div className="metric-card"><span>RADAR</span><strong>{nextRadar ? formatDistance(nextRadar.distance) : "—"}</strong><small>{nextRadar ? `${upcomingRadars.length} yaklaşan sabit radar kaydı` : radarStatus}</small></div>
            <div className="metric-card"><span>KONUM</span><strong className="coords">{currentPoint ? `${currentPoint.lat.toFixed(5)}, ${currentPoint.lng.toFixed(5)}` : "—"}</strong><small>{tracking ? "GPS canlı" : "Konum takibi kapalı"}</small></div>
          </div>
        </div>
      </section>

      <footer><span>Sabit radar verisi topluluk haritasına bağlıdır; mobil/aktif polis radarını telefon doğrudan algılayamaz. Sürüş sırasında ekranla ilgilenme.</span><span>Harita: OpenStreetMap · Rota: OSRM · Radar: OSM/Overpass</span></footer>
    </main>
  );
}

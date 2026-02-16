// Capas
let map;
let provincesLayer;
let provinceMarkersGroup;
let battlesLayer;
let clansLayer;
let battleClusterGroup;
let clanClusterGroup;

// Colores por clan (para polígonos de provincias si existieran)
const clanColors = {
  "Takeda": "#ef4444",
  "Uesugi": "#3b82f6",
  "Oda": "#f59e0b",
  "Tokugawa": "#10b981",
  "Default": "#9ca3af"
};

// Iconos por defecto (usar rutas correctas y tamaños más visibles)
const icons = {
  province: L.icon({ iconUrl: "/img/icons/clans.svg", iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] }),
  battle:   L.icon({ iconUrl: "/img/icons/battles.svg", iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20] })
};

// UI
const UI = {
  showBattles: document.getElementById("showBattles"),
  showAllClans: document.getElementById("showAllClans"),
  loader: document.getElementById("loader"),
  empty: document.getElementById("emptyMsg")
};

// Utilidades
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}
function centroidOfFeature(feature) {
  const g = feature.geometry; if (!g) return null;
  let coords = null;
  if (g.type === "Polygon") coords = g.coordinates?.[0];
  else if (g.type === "MultiPolygon") coords = g.coordinates?.[0]?.[0];
  if (!Array.isArray(coords) || !coords.length) return null;
  let sx = 0, sy = 0; coords.forEach(([x, y]) => { sx += x; sy += y; });
  return [sx / coords.length, sy / coords.length];
}

// Provincias
async function loadProvinces() {
  UI.loader?.classList.add("show");
  UI.empty && (UI.empty.style.display = "none");

  const data = await fetchJSON(`/api/provinces`).catch(() => ({ type: "FeatureCollection", features: [] }));

  UI.loader?.classList.remove("show");

  if (provincesLayer) provincesLayer.remove();
  if (provinceMarkersGroup) { provinceMarkersGroup.clearLayers(); provinceMarkersGroup.remove(); }
  provinceMarkersGroup = L.layerGroup().addTo(map);

  provincesLayer = L.geoJSON(data, {
    // Neutral style: no colored fills and minimal stroke (restaurado)
    style: f => ({ color: "#6b7280", weight: 1.0, fillOpacity: 0 }),
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      // Simplified popup: only show name and era (no clan badge, no crest)
      layer.bindPopup(`<strong>${p.name || "Desconocido"}</strong><br/>Era: <span class="badge">${p.era || "—"}</span>`);
      layer.on("mouseover", () => layer.setStyle({ weight: 3 }));
      layer.on("mouseout", () => layer.setStyle({ weight: 1.0 }));
      const c = centroidOfFeature(feature);
      if (c) {
        const mk = L.marker([c[1], c[0]], { icon: icons.province });
        mk.bindPopup(layer.getPopup().getContent());
        provinceMarkersGroup.addLayer(mk);
      }
    }
  }).addTo(map);

  const hasData = provincesLayer.getLayers().length > 0;
  UI.empty && (UI.empty.style.display = hasData ? "none" : "block");

  try { if (hasData) map.fitBounds(provincesLayer.getBounds(), { padding: [20, 20] }); } catch {}
}

// Batallas (ahora con clustering y filtrado por clan)
async function loadBattles() {
  const clanFilter = (document.getElementById('filterClan')?.value || "").trim();
  const qs = clanFilter ? `?clan=${encodeURIComponent(clanFilter)}` : '';
  const list = await fetchJSON(`/api/battles${qs}`).catch(() => []);

  if (battleClusterGroup) { battleClusterGroup.clearLayers(); if (map && map.hasLayer(battleClusterGroup)) map.removeLayer(battleClusterGroup); }
  battleClusterGroup = L.markerClusterGroup();

  list.forEach(b => {
    let geom = null;
    try {
      if (typeof b.geoJson === 'string' && b.geoJson) geom = JSON.parse(b.geoJson);
      else if (typeof b.geoJson === 'object') geom = b.geoJson;
    } catch(e){ geom = null; }
    if (!geom) return;
    let latlng = null;
    if (geom.type === 'Point' && Array.isArray(geom.coordinates)) latlng = [geom.coordinates[1], geom.coordinates[0]];
    else if (geom.type === 'Feature' && geom.geometry && geom.geometry.type === 'Point') latlng = [geom.geometry.coordinates[1], geom.geometry.coordinates[0]];
    else if (geom.type === 'FeatureCollection' && geom.features && geom.features.length && geom.features[0].geometry && geom.features[0].geometry.type === 'Point') latlng = [geom.features[0].geometry.coordinates[1], geom.features[0].geometry.coordinates[0]];
    if (!latlng) return;
    const marker = L.marker(latlng, { icon: icons.battle });
    // attach id for later lookup
    marker._battleId = b.id;
    const clanNames = (b.clans || []).map(c => c.name).join(', ');
    const popup = `<strong>${b.name || 'Desconocido'}</strong><br/>${b.date || ''}<br/>Era: <span class="badge">${b.era || '—'}</span><br/>Clanes: ${clanNames}`;
    marker.bindPopup(popup);
    battleClusterGroup.addLayer(marker);
  });

  if (battleClusterGroup.getLayers().length) battleClusterGroup.addTo(map);
  battlesLayer = battleClusterGroup;
}

// Clanes: mostrar todos como puntos
async function loadAllClans() {
  const fc = await fetchJSON("/api/clans/geo").catch(() => ({ type: "FeatureCollection", features: [] }));
  if (clansLayer) clansLayer.remove();

  if (clanClusterGroup) { clanClusterGroup.clearLayers(); if (map && map.hasLayer(clanClusterGroup)) map.removeLayer(clanClusterGroup); }
  clanClusterGroup = L.markerClusterGroup();
  L.geoJSON(fc, {
    pointToLayer: (f, latlng) => {
      const p = f.properties || {};
      const crest = p.crestUrl && p.crestUrl.length ? p.crestUrl : "/img/icons/clans.svg";
      return L.marker(latlng, { icon: L.icon({ iconUrl: crest, iconSize: [36,36], iconAnchor: [18,18], popupAnchor: [0,-18] }) });
    },
    onEachFeature: (f, layer) => {
      const p = f.properties || {};
      const crest = p.crestUrl ? `<br/><img src="${p.crestUrl}" alt="mon" style="height:28px;margin-top:4px"/>` : "";
      layer.bindPopup(
        `<strong>${p.name || ""}</strong><br/>` +
        `Provincia: <span class="badge">${p.provinceOrigin || "—"}</span><br/>` +
        `Era: <span class="badge">${p.era || "—"}</span>${crest}`
      );
      clanClusterGroup.addLayer(layer);
    }
  });
  if (clanClusterGroup.getLayers().length) clanClusterGroup.addTo(map);
  clansLayer = clanClusterGroup;
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const japanBounds = L.latLngBounds([[30.0, 128.0], [46.0, 146.0]]);
  map = L.map("map", { zoomControl: true, maxBounds: japanBounds, maxBoundsViscosity: 1.0 });

  // Base
  const cfgMeta = document.querySelector('meta[name="maptiler-key"]');
  const key = cfgMeta?.getAttribute("content") || "";
  if (key) {
    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}&language=es`, {
      attribution: '© OpenStreetMap | © <a href="https://www.maptiler.com/">MapTiler</a>', maxZoom: 19, noWrap: true
    }).addTo(map);
  } else {
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap | © <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 19, noWrap: true
    }).addTo(map);
  }

  // Position map to Japan but DO NOT load any data by default.
  map.setView([36.0, 138.0], 5);
  map.setMinZoom(5);

  // Populate filter selects (clans)
  (async function populateFilters(){
    try{
      const clans = await fetchJSON('/api/clans').catch(()=>[]);
      const sel = document.getElementById('filterClan');
      if(sel){
        sel.innerHTML = '<option value="">(Todos)</option>' + clans.map(c=>`<option value="${c}">${c}</option>`).join('');
        sel.addEventListener('change', ()=>{
          if(document.getElementById('showBattles')?.checked) loadBattles();
        });
      }
    }catch(e){console.warn('populateFilters failed', e)}
  })();

  // If a battleId is provided in the URL, load battles and focus it
  try{
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('battleId');
    if(focusId){
      // ensure battles checkbox is checked and load battles
      if(UI.showBattles) UI.showBattles.checked = true;
      await loadBattles();
      // find marker and open
      const layers = battleClusterGroup ? battleClusterGroup.getLayers() : [];
      for(const m of layers){
        if(m && m._battleId && String(m._battleId) === String(focusId)){
          map.setView(m.getLatLng(), 10);
          m.openPopup();
          break;
        }
      }
    }
  }catch(e){/* ignore */}

  // Toggle directo para capas
  UI.showBattles?.addEventListener("change", async () => {
    if (UI.showBattles.checked) await loadBattles();
    else if (battlesLayer) { battlesLayer.remove(); battlesLayer = null; }
  });
  UI.showAllClans?.addEventListener("change", async () => {
    if (UI.showAllClans.checked) await loadAllClans();
    else if (clansLayer) { clansLayer.remove(); clansLayer = null; }
  });
});
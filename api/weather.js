// Daily forecast for the trip's park area, fetched from the US National Weather Service (api.weather.gov).
// Usage: /api/weather   (defaults to Anaheim, CA)   or /api/weather?lat=33.81&lng=-117.92
// Returns { t, src: "nws", srcT (when the forecast was issued), days: { "YYYY-MM-DD": { hi, lo, pop, wind, txt } } } with temperatures in °C and wind in km/h.
// Vercel's CDN caches the answer for 1 hour.

const UA = "theme-park-planner (github.com/sriharanmuthyala/theme-park-planner)";
const toC = (f) => Math.round(((f - 32) * 5) / 9 * 10) / 10;

async function getJSON(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/geo+json" } });
  if (!r.ok) throw new Error(`NWS returned ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const lat = Number(q.lat || 33.81), lng = Number(q.lng || -117.92);
  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    res.status(400).json({ error: "Invalid lat/lng" });
    return;
  }
  try {
    const pt = await getJSON(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`);
    const url = pt && pt.properties && pt.properties.forecast;
    if (!url) throw new Error("No forecast for this location");
    const fc = await getJSON(url);
    const days = {};
    for (const p of (fc.properties && fc.properties.periods) || []) {
      const key = String(p.startTime || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      const d = days[key] || (days[key] = {});
      let f = p.temperature;
      if (typeof f === "number" && p.temperatureUnit === "C") f = (f * 9) / 5 + 32;
      if (typeof f === "number") {
        if (p.isDaytime) d.hi = toC(f);
        else d.lo = toC(f);
      }
      if (p.isDaytime || !d.txt) d.txt = p.shortForecast || d.txt;
      const pop = p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value;
      if (typeof pop === "number") d.pop = Math.max(d.pop || 0, pop);
      const mph = String(p.windSpeed || "").match(/\d+/g);
      if (mph) {
        const kmh = Math.round(Math.max(...mph.map(Number)) * 1.609);
        d.wind = Math.max(d.wind || 0, kmh);
      }
    }
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=1800");
    const srcT = (fc.properties && (fc.properties.updateTime || fc.properties.generatedAt)) || "";
    res.status(200).json({ t: Date.now(), src: "nws", srcT, days });
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || "Couldn't reach the weather service") });
  }
};

// Live wait times for one park, fetched from Queue-Times.com.
// Usage: /api/waits?park=16   (16 = Disneyland Park, 17 = Disney California Adventure)
// Vercel's CDN caches each park's answer for 5 minutes, matching how often Queue-Times updates.
// Data: Powered by Queue-Times.com (https://queue-times.com/)

module.exports = async (req, res) => {
  const park = String((req.query && req.query.park) || "");
  if (!/^\d{1,5}$/.test(park)) {
    res.status(400).json({ error: "Add ?park=<number>, for example ?park=16" });
    return;
  }
  try {
    const r = await fetch(`https://queue-times.com/parks/${park}/queue_times.json`, {
      headers: { "User-Agent": "theme-park-planner (github.com/sriharanmuthyala/theme-park-planner)" },
    });
    if (!r.ok) {
      res.status(r.status === 404 ? 404 : 502).json({ error: `Queue-Times returned ${r.status}` });
      return;
    }
    const data = await r.json();
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "Couldn't reach Queue-Times" });
  }
};

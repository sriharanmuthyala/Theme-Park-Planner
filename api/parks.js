// List of every park Queue-Times covers, grouped by operator.
// Cached for 24 hours because the list rarely changes.
// Data: Powered by Queue-Times.com (https://queue-times.com/)

module.exports = async (req, res) => {
  try {
    const r = await fetch("https://queue-times.com/parks.json", {
      headers: { "User-Agent": "theme-park-planner (github.com/sriharanmuthyala/theme-park-planner)" },
    });
    if (!r.ok) {
      res.status(502).json({ error: `Queue-Times returned ${r.status}` });
      return;
    }
    const data = await r.json();
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: "Couldn't reach Queue-Times" });
  }
};

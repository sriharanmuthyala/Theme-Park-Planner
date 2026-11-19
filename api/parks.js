// The parks this planner covers: Disneyland Park (16) and Disney California Adventure (17).
// Names come from Queue-Times' park list, with a built-in fallback. Cached for 24 hours.
// Data: Powered by Queue-Times.com (https://queue-times.com/)

const ALLOWED = [16, 17];
const FALLBACK = [{
  id: 0, name: "Disneyland Resort",
  parks: [
    { id: 16, name: "Disneyland", country: "United States", timezone: "America/Los_Angeles" },
    { id: 17, name: "Disney California Adventure", country: "United States", timezone: "America/Los_Angeles" },
  ],
}];

module.exports = async (req, res) => {
  let out = FALLBACK;
  try {
    const r = await fetch("https://queue-times.com/parks.json", {
      headers: { "User-Agent": "theme-park-planner (github.com/sriharanmuthyala/theme-park-planner)" },
    });
    if (r.ok) {
      const groups = (await r.json())
        .map((g) => ({ ...g, parks: (g.parks || []).filter((p) => ALLOWED.includes(p.id)) }))
        .filter((g) => g.parks.length);
      if (groups.length) out = groups;
    }
  } catch (e) {}
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");
  res.status(200).json(out);
};

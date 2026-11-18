# Theme Park Planner

A single-page trip planner for theme park days, with live ride wait times for any park that Queue-Times covers.

Live wait times: **Powered by [Queue-Times.com](https://queue-times.com/)**

## What's in the repo

| File | What it does |
| --- | --- |
| `index.html` | The whole app: day plans, maps, ride booking tracker, planner, manual and the **Live waits** tab |
| `api/waits.js` | Fetches live waits for one park from Queue-Times (`/api/waits?park=16`), cached for 5 minutes |
| `api/parks.js` | Fetches the list of all parks (`/api/parks`), cached for 24 hours |

The app calls `/api/...` on its own site, so live waits need hosting that runs those functions, such as Vercel. On GitHub Pages the plans still work but live waits won't load.

## Deploy on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, then import `theme-park-planner`.
3. Leave Framework Preset as **Other** and every setting as it is. Click **Deploy**.

Every push to `main` redeploys automatically.

## Saving

Edits save in the browser you use (local storage), so each device keeps its own copy.

## Disclaimer

Unofficial fan-made planner. Not affiliated with, endorsed by or sponsored by any theme park or park operator. Park and attraction names are used only to describe real places.



# Aspect × forest type: early-winter microclimate and topsoil

**Group 4** · Amatul Jameel, Waleed Ramzan, Mohammed Abakar Hasan Abdalrahman, Pramodya Kumarage
Landscape Ecology Project Seminar 2026/27 · Prof. Dr. Daniela Sauer, Dr. Stephen Asabere · Faculty of Geosciences and Geography, University of Göttingen

Four forest plots on one contour line of the hill in the Forest Botanical Garden, Göttingen: north- and south-facing, coniferous and deciduous. This repository is a small static website for the project (no build step, no server code).

## Pages

| File | Page | What it does |
|---|---|---|
| `index.html` | Overview | Main question, hypotheses H1 and H2 with research questions and reasons, study site, timeline |
| `causal-map.html` | Cause–effect map | Mulder-style ring of 27 factors, processes and variables with signed arrows; follow effects and causes along every chain, trace two boxes, show the chains of each hypothesis, list feedback loops |
| `simulator.html` | Simulator | Real terrain (1 m DGM) in 3D with the four plots, the sun over the logging period and your live location; direct sun per plot for every day |
| `predictions.html` | Predictions | Layered chart from design factors through processes to measured variables and instruments; for each variable the predicted 2 × 2 pattern and effects, and, once `data/results.js` is filled in, the measured values and whether they match |
| `methods.html` | Methods | Parameters and reasons, sensor stack, pH and buffer ranges, texture with auger cores, field days, analysis plan, instruments, references |

Every page has a **Dark mode** toggle in the top bar. Light is the default; the choice is remembered in the browser.

## Structure

```
group4-landscape-ecology/
├── index.html
├── causal-map.html
├── simulator.html
├── predictions.html
├── methods.html
├── README.md
├── .nojekyll                  (optional; tells GitHub Pages to serve files as they are)
├── assets/
│   ├── css/style.css          shared styles for all pages (light and dark)
│   ├── js/overview.js         hill cross-section on the overview page
│   ├── js/causal-map.js       boxes, arrows, hypotheses and the map tools
│   ├── js/simulator.js        terrain, plots, sun and direct-sun calculation
│   ├── js/predictions.js      predictions per variable and the layered chart
│   └── vendor/                three.js r128 and OrbitControls (MIT licence, see LICENSE-three.txt)
└── data/
    ├── dgm.js                 terrain grid (3 m) used by the simulator
    └── results.js             measured plot means, filled in after the fieldwork
```

The folders `assets` and `data` must be uploaded with all their files and keep their names and their place next to the HTML files.

## Publish on GitHub Pages

**Cleanest way (recommended after a broken upload):** delete the old repository (Settings → General → scroll to *Danger Zone* → Delete this repository) and create it again with the same name, so no old files are left behind. The website address stays the same.

1. On github.com create a new **public** repository (on a free account GitHub Pages works only for public repositories).
2. Unzip the download. Open the `group4-landscape-ecology` folder so you see the five `.html` files, `README.md` and the folders `assets` and `data`.
3. In the new repository click **uploading an existing file** (or **Add file → Upload files**). Select **everything inside the folder** — the five `.html` files, `README.md`, `assets` and `data` — and drag it into the upload area. Use Chrome, Edge or Firefox: they upload folders with their contents.
4. Before you commit, check the list under the upload area: it must contain files like `assets/js/simulator.js`, `assets/vendor/three.min.js` and `data/dgm.js`. Then click **Commit changes**.
5. Go to **Settings → Pages**. Under *Build and deployment* choose **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, and click **Save**.
6. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/` (the Pages settings show the exact link).

Using git instead of the web upload:

```
cd group4-landscape-ecology
git init
git add .
git commit -m "Group 4 project site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

### Check after uploading

- The repository’s main page lists `assets`, `data`, the five `.html` files and `README.md`.
- On the website, the top bar shows **Dark mode** with a toggle, and switching it changes the colours at once.
- The simulator shows the 3D knoll; the cause–effect map shows the ring of boxes.
- If a red bar at the top of a page says that files did not load, those files are missing from the repository: upload them again into the right folder. Then reload the page with Ctrl+Shift+R (Cmd+Shift+R on a Mac), because browsers keep old files for a few minutes.

## Preview on your own computer

Double-click `index.html`. All pages work straight from the folder, without a server. The fonts come from Google Fonts when you are online; offline, system fonts are used.

## Editing

- **Hypotheses:** the table in `index.html` and the `HYP` list in `assets/js/causal-map.js`. Keep the wording identical in both. If a prediction changes, also update `VARS` in `assets/js/predictions.js`.
- **Results:** after the fieldwork, replace `null` in `data/results.js` with the plot means (or `[mean, spread]`). The Predictions page shows them next to the predictions and marks each effect ✓ or ✗ by its sign. This is a comparison of four stands, not a significance test.
- **Boxes and arrows of the map:** the `NODES` and `EDGES` lists at the top of `assets/js/causal-map.js`. Signs: `'+'` increases, `'-'` decreases, `'0'` changes the strength of another effect, `'x'` removed by the design.
- **Plot positions:** `PLOTS_UTM` near the top of `assets/js/simulator.js`, as `[Easting, Northing]` in UTM zone 32N (from your GPS). The current values are the field positions measured by GPS on 21 Nov 2026 (the latitude and longitude are in a comment above the list). When you change them, also raise the `KEY` name (for example `g4-sim-plots-v2` to `-v3`) so browsers drop plots moved by hand. Plots moved with the **Move** button are remembered only in that browser; use **Copy coordinates** and paste the numbers into `PLOTS_UTM` so everyone sees them.
- **After changing a CSS or JS file:** raise the `?v=` number where the HTML files load it (for example from `?v=4` to `?v=5`), so visitors’ browsers fetch the new version instead of an old copy.

## Data and credits

- **Terrain** (`data/dgm.js`): the 1 m digital ground model of the Forest Botanical Garden from the course files, block-averaged to 3 m. Its metadata does not name the provider. Lower Saxony’s 1 m DGM is published by LGLN as open geodata under CC BY 4.0, which allows publishing with attribution and a note that the data were changed. **Before making the repository public, confirm with Dr. Asabere that the file is LGLN’s DGM1 and may be shared.** If it came from somewhere else, change the terrain line in the footer of `simulator.html`, or remove `data/dgm.js` (the simulator then shows a message instead of the 3D model).
- **three.js r128** (MIT licence), in `assets/vendor/` with its licence file.
- **Site description and climate:** University of Göttingen, Forest Botanical Garden pages. **Climate normals:** Deutscher Wetterdienst. Full references are on the Methods page.
- **Simulator:** direct sun is calculated from the terrain and the sun position for a clear sky, before the canopy; clouds and the canopy reduce it further.

## Licence

No licence file is included, so others may view but not reuse the content by default. Add one if the group wants reuse, for example CC BY 4.0 for the texts and MIT for the code.

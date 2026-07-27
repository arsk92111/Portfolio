# Arshad Ali — 3D Developer Portfolio

A premium, JSON-driven, 3D developer portfolio built with plain **HTML5, CSS3, vanilla JavaScript and Bootstrap-free custom components**. No React/Vue/Angular — every byte of markup you see is generated at runtime from a single JSON file.

Live signature element: a rotating wireframe icosahedron "core" with orbiting nodes (Three.js), representing a stack of technologies orbiting a central system — with a pure-CSS 3D cube fallback if WebGL/Three.js isn't available.

---

## 1. Overview

- **Design language:** black background, orange/green/yellow accent system, terminal & Python-syntax section labels (`if Experience:`, `def AboutMe():`, `class Skills:`).
- **Typography:** Space Grotesk (display), Inter (body), JetBrains Mono (code/labels).
- **4 visual templates** sharing one data source: **Default**, **Books**, **Resume**, **Restaurant**.
- **Light/Dark mode** with animated sun/moon toggle, persisted in `localStorage`.
- Fully responsive, accessible, and content is 100% driven by `data/portfolio.json`.

## 2. Features

- Floating, centered glassmorphism navbar (not edge-to-edge)
- Canvas starfield/particle background with mouse parallax
- Three.js 3D hero scene with CSS-fallback if WebGL is unavailable
- Scroll-spy navigation, scroll progress bar, back-to-top button
- Scroll-reveal animations, project card 3D tilt, custom cursor (desktop)
- Project filtering by category
- Template selector (top-right) + theme toggle, both persisted
- Graceful error screen if `portfolio.json` fails to load
- Semantic HTML, `aria-label`s, visible focus states, `prefers-reduced-motion` respected

## 3. Technologies

| Purpose            | Tool                                  |
|---------------------|----------------------------------------|
| Structure           | HTML5                                  |
| Styling             | CSS3 (custom properties, no framework) |
| Behavior            | Vanilla JavaScript (ES6, IIFE modules) |
| 3D                  | Three.js r128 (CDN), CSS 3D fallback   |
| Icons               | Google Material Symbols                |
| Data                | JSON                                   |

## 4. Folder Structure

```
Portfolio/
├── index.html                 # Single-page app shell
├── README.md
├── data/
│   └── portfolio.json         # ALL content lives here
├── Templates/                 # Reference/documentation partials
│   ├── Header.html            # Snapshot of the navbar markup
│   ├── Footer.html            # Snapshot of the footer markup
│   └── Portfolio.html         # Snapshot of the <main> section markup
├── files/
│   └── Arshad_Ali_Cover_Letter.pdf
└── Static/
    ├── CSS/
    │   ├── themes.css         # Color tokens, dark/light variables
    │   ├── style.css          # Layout + components + template skins
    │   ├── animations.css     # Keyframes & motion utilities
    │   └── responsive.css     # Breakpoints
    ├── JS/
    │   ├── data-loader.js     # Fetches portfolio.json, error screen
    │   ├── renderer.js        # Renders every section from JSON
    │   ├── navigation.js      # Mobile menu, scroll-spy, progress bar
    │   ├── themes.js          # Theme + template switching/localStorage
    │   ├── particles.js       # Canvas starfield
    │   ├── three-scene.js     # 3D hero scene + CSS fallback
    │   ├── animations.js      # Reveal-on-scroll, tilt, cursor, typewriter
    │   └── app.js             # Boot sequence
    ├── Images/                # Add your photos/screenshots here
    └── Icons/                 # Reserved for any custom SVG icons
```

> `Templates/*.html` are **documented reference snapshots**, not server includes — `index.html` is the single source of truth the browser actually loads. They exist so the markup for each region is easy to find, read, and reuse if you later move this to a templating server.

## 5. How to Run

Because the app `fetch()`es `data/portfolio.json`, most browsers will **block that request over `file://`**. Run it through any static server:

```bash
# Python 3
cd Portfolio
python -m http.server 8080
# then open http://localhost:8080

# or Node
npx serve .
```

If the JSON can't be loaded, the site shows a clear on-screen error instead of a blank page.

## 6. How JSON Powers the Site

`Static/JS/app.js` runs on load:

1. `DataLoader.load()` fetches `data/portfolio.json`.
2. `Renderer.renderAll(data)` builds the navbar, hero, experience timeline, about section, skills, project grid, contact block and footer directly from that object — nothing is hardcoded in `index.html` except empty containers with `id`s.
3. `Themes.init()` / `Navigation.init()` / `Particles.init()` / `ThreeScene.init()` / `Animations.init()` wire up interactivity.

Change the JSON → refresh the page → the site updates. No HTML editing required.

### Add a project
Edit `data/portfolio.json` → `projects.items`, append an object:

```json
{
  "id": 10,
  "name": "My New Project",
  "category": ["Django", "API"],
  "description": "One or two sentences on what it does.",
  "github": "https://github.com/you/repo",
  "live": "https://your-live-url.com",
  "liveVisible": true
}
```
It appears automatically in the grid and in filter results for any category listed in `projects.filters`.

### Add an experience entry
Add an object to `experience.items` with `company`, `timeFrame`, `role`, `description`, and a `projects` array of `{ name, icon, detail }`. `icon` values are [Google Material Symbols](https://fonts.google.com/icons) names.

### Add/change skills
Add to `skills.categories[].skills` as `{ "name": "...", "icon": "material_symbol_name" }`.

### Change personal info
- Name/role/intro: `hero`
- Bio paragraphs: `about.paragraphs` (only `<strong>`, `<em>`, `<b>`, `<i>`, `<br>` tags are allowed — the renderer strips anything else for safety)
- Contact details: `contact`
- Social links: `socialLinks`
- Resume/cover letter files: `hero.resumeFile`, `hero.coverLetterFile`, `about.buttons[].fileUrl` — point these at real files inside `files/`

### Change navigation
Edit the `navigation` array — label + `target` (must match a `<section id="...">` in `index.html`).

## 7. Themes & Colors

All colors are CSS variables defined in `Static/CSS/themes.css`:

```css
--orange: #ff7a29;
--green:  #35d07f;
--yellow: #f4c95d;
```

Dark/light-specific tokens (`--bg`, `--text`, `--border`, etc.) live under `[data-theme="dark"]` / `[data-theme="light"]` in the same file. Change a value once and it updates everywhere.

## 8. Adding a New Template

Templates are pure CSS skins keyed off `body[data-template="id"]` — they reuse the exact same DOM the Default template renders.

1. Add an entry to `templates` in `portfolio.json`:
   ```json
   { "id": "cyberpunk", "label": "Cyberpunk", "icon": "bolt" }
   ```
2. Add a `body[data-template="cyberpunk"] { ... }` block at the bottom of `Static/CSS/style.css` overriding whatever components should look different (backgrounds, borders, radii, fonts).
3. Done — it shows up in the template dropdown automatically and persists via `localStorage`.

## 9. Deployment

Any static host works (no backend required): Vercel, Netlify, GitHub Pages, Cloudflare Pages. Just deploy the `Portfolio/` folder as-is; `index.html` is the entry point.

## 10. Browser Requirements & Performance Notes

- Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Requires WebGL for the live 3D scene; automatically falls back to a CSS 3D cube otherwise.
- Particle count scales down on small viewports and is capped at 220 stars.
- `prefers-reduced-motion` disables the particle animation loop, card-tilt, and custom cursor.
- Fonts and Three.js load from CDNs — for fully offline use, vendor them locally and update the `<link>`/`<script>` tags in `index.html`.

## 11. Known Placeholders

- `files/Arshad_Ali_Django_2026.pdf` is **not included** — drop your actual resume PDF at that path (or update `hero.resumeFile` in the JSON) to make the download button work.
- `files/Arshad_Ali_Cover_Letter.pdf` is included and wired up already.
- Profile/project screenshots are intentionally represented with icons/emoji rather than `<img>` placeholders pointing at files that don't exist yet. Drop real images into `Static/Images/` and add `<img>` rendering in `renderer.js` wherever you'd like them to appear.

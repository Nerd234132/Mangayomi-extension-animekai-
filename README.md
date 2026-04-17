# 🎌 Mangayomi – AnimeKai Extension Repository

A custom source repository for the [Mangayomi](https://github.com/kodjodevf/mangayomi) app that provides anime extensions for **AnimeKai** — a free, ad-free, HD anime streaming site with sub & dub support.

---

## 📦 Available Extensions

| Name      | Version | Language | Type  | NSFW  | Cloudflare |
|-----------|---------|----------|-------|-------|------------|
| AnimeKai  | 1.0.0   | EN       | Anime | ❌ No | ❌ No      |

---

## 🚀 Setup Instructions

### Step 1 — Fork & host this repo

1. Fork this repository to your own GitHub account.
2. In the forked repo, go to **Settings → Pages** and set the source to the `main` branch / `root` folder. GitHub Pages will serve your files at:
   ```
   https://YOUR_USERNAME.github.io/mangayomi-animekai-repo/
   ```
3. Open `anime_index.json` and replace `YOUR_USERNAME` in the `sourceCodeUrl` field with your actual GitHub username.

### Step 2 — Add the repo to Mangayomi

In the Mangayomi app:

```
More → Settings → Browse → Add Repository (Anime)
```

Paste in your anime index URL:
```
https://raw.githubusercontent.com/YOUR_USERNAME/mangayomi-animekai-repo/main/anime_index.json
```

> **Tip:** You can also use the GitHub Pages URL if you enabled GitHub Pages:
> `https://YOUR_USERNAME.github.io/mangayomi-animekai-repo/anime_index.json`

### Step 3 — Install the AnimeKai extension

1. Go to **Browse → Anime Extensions** in Mangayomi.
2. Find **AnimeKai** in the list and tap **Install**.
3. Once installed, it will appear in **Browse → Anime Sources**.

---

## 🗂️ Repository Structure

```
mangayomi-animekai-repo/
│
├── anime_index.json              ← Anime extension catalogue (add this to Mangayomi)
├── index.json                    ← Manga catalogue (empty – anime only repo)
├── README.md
│
└── javascript/
    └── anime/
        └── src/
            └── en/
                └── animekai.js   ← AnimeKai scraper extension (JavaScript)
```

---

## ⚙️ Extension Details

### AnimeKai (`animekai.js`)

| Field          | Value                        |
|----------------|------------------------------|
| Source URL     | `https://animekai.to`        |
| Language       | English (`en`)               |
| Type           | Anime (`itemType: 1`)        |
| NSFW           | No                           |
| Has Cloudflare | No                           |
| Min App Ver    | 0.5.0                        |

**Features:**
- 🔍 Search anime by title
- 📺 Browse popular & latest anime
- 🎬 Episode list with sub/dub detection
- 📡 HLS / MP4 video stream extraction via AnimeKai's AJAX API

---

## 🛠️ Updating the Extension

If AnimeKai changes their website structure:

1. Edit `javascript/anime/src/en/animekai.js` to fix the selectors / API calls.
2. Bump the `version` field in `anime_index.json` (e.g. `1.0.0` → `1.0.1`).
3. Commit & push. Mangayomi users will see the update notification next time they open the app.

---

## 🧩 Adding More Anime Extensions

To add another anime source (e.g., Aniwatch, AnimeGG):

1. Create a new JS file in `javascript/anime/src/en/yoursite.js`.
2. Add a new entry object to `anime_index.json` following the same schema.
3. Generate a unique `id` — you can use any large unique integer (e.g., use an online hash calculator on the site name).

### Extension JSON Schema

```json
{
  "name": "SiteName",
  "id": 1234567890,
  "baseUrl": "https://yoursite.com",
  "lang": "en",
  "typeSource": "single",
  "iconUrl": "https://www.google.com/s2/favicons?sz=256&domain=https://yoursite.com/",
  "dateFormat": "",
  "dateFormatLocale": "",
  "isNsfw": false,
  "hasCloudflare": false,
  "sourceCodeUrl": "https://raw.githubusercontent.com/YOUR_USERNAME/mangayomi-animekai-repo/main/javascript/anime/src/en/yoursite.js",
  "apiUrl": "",
  "version": "1.0.0",
  "isManga": false,
  "itemType": 1,
  "isFullData": false,
  "appMinVerReq": "0.5.0",
  "additionalParams": "",
  "sourceCodeLanguage": 1,
  "notes": ""
}
```

### JS Extension Required Functions

Every JS extension must export these async functions:

| Function             | Description                                      |
|----------------------|--------------------------------------------------|
| `getPopular(page)`   | Returns popular anime list + `hasNextPage`       |
| `getLatestUpdates(page)` | Returns recently updated anime               |
| `search(query, page, filters)` | Search results                        |
| `getDetail(url)`     | Full anime details + episode list                |
| `getVideoList(url)`  | Video sources for an episode                     |
| `getFilterList()`    | Filter options (can return `[]`)                 |

---

## 📋 Notes

- Extensions only act as a browser fetching publicly available content — no content is hosted here.
- If AnimeKai is down or changes its domain, update `baseUrl` in `anime_index.json` and bump the version.
- This repo is anime-only. The `index.json` (manga) is intentionally empty.

---

## 📄 License

Apache License 2.0 — see [LICENSE](LICENSE).
Based on the [mangayomi-extensions](https://github.com/kodjodevf/mangayomi-extensions) project by Moustapha Kodjo Amadou.

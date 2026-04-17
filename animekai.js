// AnimeKai Extension for Mangayomi
// Source: https://animekai.to
// itemType: 1 (anime)

const baseUrl = source.baseUrl; // https://animekai.to

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildHeaders() {
  return {
    "Referer": baseUrl + "/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };
}

function parseSearchResults(html) {
  const items = [];
  const regex = /<div class="film-detail"[\s\S]*?<a[^>]+href="([^"]+)"[^>]*title="([^"]+)"[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    items.push({
      name: m[2].trim(),
      link: m[1].startsWith("http") ? m[1] : baseUrl + m[1],
      imageUrl: m[3].startsWith("http") ? m[3] : baseUrl + m[3]
    });
  }
  return items;
}

// ─── Extension Entry Points ──────────────────────────────────────────────────

async function getPopular(page) {
  const url = `${baseUrl}/home?page=${page}`;
  const res = await fetch(url, { headers: buildHeaders() });
  const html = await res.text();

  const items = parseSearchResults(html);
  // Try to detect if there's a next page
  const hasNext = html.includes('class="page-next"') || html.includes('rel="next"');

  return {
    list: items,
    hasNextPage: hasNext
  };
}

async function getLatestUpdates(page) {
  const url = `${baseUrl}/latest?page=${page}`;
  const res = await fetch(url, { headers: buildHeaders() });
  const html = await res.text();

  const items = parseSearchResults(html);
  const hasNext = html.includes('class="page-next"') || html.includes('rel="next"');

  return {
    list: items,
    hasNextPage: hasNext
  };
}

async function search(query, page, filters) {
  const url = `${baseUrl}/search?keyword=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url, { headers: buildHeaders() });
  const html = await res.text();

  const items = parseSearchResults(html);
  const hasNext = html.includes('class="page-next"') || html.includes('rel="next"');

  return {
    list: items,
    hasNextPage: hasNext
  };
}

async function getDetail(url) {
  const res = await fetch(url, { headers: buildHeaders() });
  const html = await res.text();

  // Title
  const titleMatch = html.match(/<h2[^>]*class="[^"]*film-name[^"]*"[^>]*>([^<]+)<\/h2>/);
  const name = titleMatch ? titleMatch[1].trim() : "";

  // Description
  const descMatch = html.match(/<div[^>]*class="[^"]*film-description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Thumbnail
  const imgMatch = html.match(/<img[^>]+class="[^"]*film-poster[^"]*"[^>]+(?:src|data-src)="([^"]+)"/);
  const imageUrl = imgMatch ? imgMatch[1] : "";

  // Genres
  const genreRegex = /<a[^>]+href="[^"]*\/genre\/[^"]*"[^>]*>([^<]+)<\/a>/g;
  const genres = [];
  let gm;
  while ((gm = genreRegex.exec(html)) !== null) {
    genres.push(gm[1].trim());
  }

  // Status
  const statusMatch = html.match(/Status[\s\S]*?<span[^>]*>([^<]+)<\/span>/);
  const statusText = statusMatch ? statusMatch[1].trim().toLowerCase() : "";
  const status = statusText.includes("finish") || statusText.includes("complet") ? 1 : 0;

  // Episodes – AnimeKai uses a data-id on the detail page to load episodes via XHR
  const idMatch = html.match(/data-id="([^"]+)"/);
  const animeId = idMatch ? idMatch[1] : "";

  const episodes = [];
  if (animeId) {
    const epRes = await fetch(`${baseUrl}/ajax/episode/list/${animeId}`, { headers: buildHeaders() });
    const epData = await epRes.json();
    const epHtml = epData.html || "";

    const epRegex = /<a[^>]+data-id="(\d+)"[^>]+title="([^"]+)"[^>]*>/g;
    let em;
    let epNum = 1;
    while ((em = epRegex.exec(epHtml)) !== null) {
      episodes.push({
        name: em[2].trim(),
        url: `${baseUrl}/ajax/episode/sources?id=${em[1]}`,
        dateUpload: null,
        epNum: epNum++
      });
    }
  }

  return {
    name,
    imageUrl,
    description: desc,
    genres,
    status,
    episodes
  };
}

async function getVideoList(episodeUrl) {
  const res = await fetch(episodeUrl, { headers: buildHeaders() });
  const data = await res.json();

  const videos = [];

  // data.link is typically the direct embed or HLS url
  if (data && data.link) {
    videos.push({
      url: data.link,
      originalUrl: data.link,
      quality: "Default"
    });
  }

  // Some responses return a sources array
  if (data && Array.isArray(data.sources)) {
    for (const src of data.sources) {
      videos.push({
        url: src.file || src.url,
        originalUrl: src.file || src.url,
        quality: src.label || src.quality || "Auto"
      });
    }
  }

  return videos;
}

async function getFilterList() {
  return [];
}

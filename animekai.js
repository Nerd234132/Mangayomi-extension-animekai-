const mangayomiSources = [
  {
    "name": "AnimeKai",
    "lang": "en",
    "id": 1873640291,
    "baseUrl": "https://animekai.to",
    "apiUrl": "",
    "iconUrl": "https://www.google.com/s2/favicons?sz=256&domain=https://animekai.to/",
    "typeSource": "single",
    "itemType": 1,
    "version": "1.0.2",
    "pkgPath": "animekai.js"
  }
];

class DefaultExtension extends MProvider {
  constructor() {
    super();
    this.client = new Client();
  }

  getHeaders() {
    return {
      "Referer": this.source.baseUrl + "/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
  }

  async requestDoc(url) {
    const res = await this.client.get(url, this.getHeaders());
    return new Document(res.body);
  }

  async requestText(url) {
    const res = await this.client.get(url, this.getHeaders());
    return res.body;
  }

  async requestJson(url) {
    const res = await this.client.get(url, this.getHeaders());
    return JSON.parse(res.body);
  }

  parseAnimeList(doc) {
    const list = [];
    const items = doc.select(".flw-item");
    for (const item of items) {
      const a = item.selectFirst(".film-name a");
      const img = item.selectFirst(".film-poster img");
      if (!a) continue;
      const name = a.text.trim();
      const link = this.source.baseUrl + a.getHref;
      const imageUrl = img ? (img.attr("data-src") || img.getSrc) : "";
      list.push({ name, imageUrl, link });
    }
    return list;
  }

  async getPopular(page) {
    const url = `${this.source.baseUrl}/top-airing?page=${page}`;
    const doc = await this.requestDoc(url);
    const list = this.parseAnimeList(doc);
    const hasNextPage = doc.selectFirst(".page-item.active + .page-item") !== null;
    return { list, hasNextPage };
  }

  get supportsLatest() {
    return true;
  }

  async getLatestUpdates(page) {
    const url = `${this.source.baseUrl}/recently-updated?page=${page}`;
    const doc = await this.requestDoc(url);
    const list = this.parseAnimeList(doc);
    const hasNextPage = doc.selectFirst(".page-item.active + .page-item") !== null;
    return { list, hasNextPage };
  }

  async search(query, page, filters) {
    const url = `${this.source.baseUrl}/search?keyword=${encodeURIComponent(query)}&page=${page}`;
    const doc = await this.requestDoc(url);
    const list = this.parseAnimeList(doc);
    const hasNextPage = doc.selectFirst(".page-item.active + .page-item") !== null;
    return { list, hasNextPage };
  }

  async getDetail(url) {
    const doc = await this.requestDoc(url);

    const name = doc.selectFirst(".film-name") ? doc.selectFirst(".film-name").text.trim() : "";
    const description = doc.selectFirst(".film-description .text") ? doc.selectFirst(".film-description .text").text.trim() : "";
    const imageUrl = doc.selectFirst(".film-poster img") ? doc.selectFirst(".film-poster img").attr("src") : "";

    const genreEls = doc.select(".item-list a[href*='/genre/']");
    const genre = genreEls.map(el => el.text.trim());

    const statusEl = doc.selectFirst(".item-title:contains('Status') .name");
    const statusText = statusEl ? statusEl.text.trim().toLowerCase() : "";
    const status = statusText.includes("finish") || statusText.includes("complet") ? 1 : 0;

    const animeIdEl = doc.selectFirst("#anime-id");
    const dataIdEl = doc.selectFirst("[data-id]");
    const animeId = animeIdEl ? animeIdEl.attr("value") : (dataIdEl ? dataIdEl.attr("data-id") : "");

    const chapters = [];
    if (animeId) {
      try {
        const epData = await this.requestJson(
          `${this.source.baseUrl}/ajax/episode/list/${animeId}`
        );
        const epHtml = epData.html || epData.result || "";
        const epDoc = new Document(epHtml);
        const epItems = epDoc.select("a[data-id]");
        let epNum = 1;
        for (const ep of epItems) {
          const epId = ep.attr("data-id");
          const epTitle = ep.attr("title") || ep.text.trim() || ("Episode " + epNum);
          chapters.push({
            name: epTitle,
            url: `${this.source.baseUrl}/ajax/episode/sources?id=${epId}`,
            scanlator: ""
          });
          epNum++;
        }
      } catch (e) {}
    }

    return { name, description, status, genre, imageUrl, chapters, link: url };
  }

  async getVideoList(url) {
    const videos = [];
    try {
      const data = await this.requestJson(url);
      if (data.link) {
        videos.push({ url: data.link, originalUrl: data.link, quality: "Default" });
      }
      if (Array.isArray(data.sources)) {
        for (const src of data.sources) {
          const videoUrl = src.file || src.url || "";
          if (videoUrl) {
            videos.push({ url: videoUrl, originalUrl: videoUrl, quality: src.label || src.quality || "Auto" });
          }
        }
      }
      if (data.result && typeof data.result === "object" && data.result.link) {
        videos.push({ url: data.result.link, originalUrl: data.result.link, quality: "Default" });
      }
    } catch (e) {}
    return videos;
  }

  getSourcePreferences() {
    return [];
  }
}

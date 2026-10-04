# AR. Blog System Architecture & Documentation

The Blog System is a high-performance, SEO/AEO/GEO-optimized publishing engine designed to host and serve articles, research papers, and technical insights within the AR. Abhinav Ranjan portfolio.

---

## 📂 Directory Structure

All blog components are located in `frontend/blogs/`, `frontend/data/`, and `frontend/logic/`:

| Path | Purpose |
|---|---|
| `frontend/blogs/index.html` | The main **Blogs & Insights** hub for browsing all blog entries. |
| `frontend/blogs/content/*.html` | Dedicated, standalone, pre-rendered static HTML pages for each blog post. |
| `frontend/blogs/post.html` | Universal dynamic post fallback renderer. |
| `frontend/data/blogs.json` | The central database (title, slug, date, author, category, image, tags, excerpt). |
| `frontend/logic/blog_library.js` | The JavaScript engine that orchestrates dynamic index card generation, real-time search, category filtering, and metadata hydration. |
| `sitemap-blogs.xml` | Dedicated XML sitemap indexed exclusively for the active blog post articles. |

---

## 🚀 Active Blog Post Short Names & Slugs

The active blog articles are stored in `frontend/blogs/content/` with these short, clean filenames:

| Slug / Filename | Canonical URL | Category |
|---|---|---|
| `ar-honorific-origin.html` | `https://abhinavranjan.qzz.io/frontend/blogs/content/ar-honorific-origin.html` | Research / Leadership |
| `past-life.html` | `https://abhinavranjan.qzz.io/frontend/blogs/content/past-life.html` | Research / Biography |
| `agroscan-ai.html` | `https://abhinavranjan.qzz.io/frontend/blogs/content/agroscan-ai.html` | Innovation |

---

## 🔍 SEO, AEO, GEO & AI Optimization

The blog system incorporates multi-layered discovery optimizations:

1. **Pre-rendered HTML**: Each active article page in `content/` contains its complete text pre-rendered in HTML so search engine crawlers and AI bots index the full text without needing JavaScript execution.
2. **JSON-LD BlogPosting Schema**: Full schema in every article including `headline`, `description`, `image`, `datePublished`, `author`, `publisher`, and `mainEntityOfPage`.
3. **OpenGraph & Twitter Cards**: High-resolution social sharing cards with large images and canonical tags.
4. **Clean URL Rewrites**: Configured via `_redirects` (`/blogs/:slug -> /frontend/blogs/content/:slug.html`).
5. **AI Knowledge Protocol (`llms.txt`)**: Root `llms.txt` file providing structured LLM context and direct citation paths for Generative Search engines.
6. **Dual Sitemaps**: Main site URLs in `sitemap.xml`, blog articles isolated in `sitemap-blogs.xml`.

---

## 🛠️ Adding a New Blog Post

1. Create the new static article page in `frontend/blogs/content/your-short-slug.html` following the standard template.
2. Add a corresponding entry in `frontend/data/blogs.json` with the new slug and category.
3. Add the new URL and image metadata to `sitemap-blogs.xml`.
4. The blog card will automatically appear in the Blogs hub (`frontend/blogs/index.html`) with interactive search and category filtering.

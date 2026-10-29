# Public page discovery

The dictionary search UI loads words with JavaScript. Its HTML now links to
`/dictionary`, which lists every initial letter. Each `/dictionary/:letter`
page serves up to 100 definitions in the initial HTML, with ordinary pagination
links such as `/dictionary/a?page=2`. Every word page links to its browse page
and neighbouring entries. The Orisa directory also contains all publication
links in its initial HTML.

All public word and Orisa URLs retain their existing canonical addresses at
`https://www.onisese.ng`. Private documents and administration routes retain
their access restrictions and robots rules.

Run `npm test` and `npm run seo:check` before deployment. After updating
dictionary or Orisa data, run `npm run seo:generate` and commit the generated
discovery links and sitemap changes. These tests use local fixtures and do not
submit notifications to search engines.

After deployment:

1. Check `/dictionary`, `/dictionary/a?page=2`, `/word/wura`, `/orisas.html`,
   and `/orisa/aje` on the live canonical domain. They should return 200, show
   their content with JavaScript disabled, and have matching canonical URLs.
2. Confirm `/sitemap.xml` includes `sitemap-pages.xml`,
   `sitemap-dictionary.xml`, and `sitemap-browse.xml`.
3. Submit `https://www.onisese.ng/sitemap.xml` in the `onisese.ng` Google
   Search Console property. Use URL Inspection's live test for a few affected
   URLs and request indexing of representative pages.

The Search Engine Indexing GitHub workflow also uses this canonical domain.
Its manual run selects all sitemap URLs; scheduled runs select recently
modified entries. `INDEX_DRY_RUN=1 INDEX_MODE=all node scripts/seo-indexer.mjs`
reads live sitemaps without submitting notifications. Real notifications go to
IndexNow participating engines; they do not request Google indexing.

“Discovered – currently not indexed” means Google knows a URL but has not yet
crawled it. “Crawled – currently not indexed” means Google fetched the page but
has not selected it for indexing. Crawlable links help discovery and navigation;
they do not guarantee Google's crawl schedule or inclusion. The redirect and
alternate-canonical categories can be expected for duplicate URL variants.
If URLs remain excluded after deployment and recrawling, use the affected URL
examples and live response evidence to investigate hosting restrictions and
content quality. Do not fabricate fuller definitions or change dates merely to
make pages appear newly updated.

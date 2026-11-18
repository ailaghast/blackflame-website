# Black Flame: blackflamegames.com

The home page of the BLACK FLAME™ game series by Emberfish Games. It's a static site with no build step, no cookies and no analytics, hosted on GitHub Pages.

```
docs/          the published site (GitHub Pages serves this folder)
  index.html   the page
  404.html     the not-found page
  CNAME        blackflamegames.com
  assets/      css, js, fonts (self-hosted, OFL), img (WebP), video
redirect/      optional mini-site that sends blackflamegame.com to blackflamegames.com (see step 5)
tools/         Node scripts that build the images/video and take screenshots (npm install inside tools/)
assets-src/    Codex-generated source art (the black flame, abyss vista, slabs) and the prompts used
mockups/       the A/B/C design mockups (not published)
```

## Preview locally

```
cd tools
npm install
node serve.js          # http://localhost:8787
node shoot-site.js     # desktop and mobile screenshots in tools/_review/, and it re-renders docs/og-image.jpg
```

`node build-site-assets.js` regenerates everything in `docs/assets/img`, `docs/assets/video` and the favicons from the press kit and the Steam capsule folders in `D:\Trabalho\Jogos\HTBF`.

## Hosting

- Repo: https://github.com/ailaghast/blackflame-website. GitHub Pages deploys from branch `main`, folder `/docs`, with custom domain `blackflamegames.com`. Every push to `main` republishes the site in about 30 seconds.
- Both domains are registered at **Squarespace Domains** (domains.squarespace.com).

### DNS for blackflamegames.com (Squarespace)

In Squarespace, go to *Domains → blackflamegames.com → DNS → DNS Settings*:

1. Delete the **Squarespace Defaults** record group (the parking A records and `www → ext-sq.squarespace.com`).
2. Add these custom records:
   | Host | Type  | Data |
   |------|-------|------|
   | @    | A     | 185.199.108.153 |
   | @    | A     | 185.199.109.153 |
   | @    | A     | 185.199.110.153 |
   | @    | A     | 185.199.111.153 |
   | @    | AAAA  | 2606:50c0:8000::153 |
   | @    | AAAA  | 2606:50c0:8001::153 |
   | @    | AAAA  | 2606:50c0:8002::153 |
   | @    | AAAA  | 2606:50c0:8003::153 |
   | www  | CNAME | ailaghast.github.io |

   GitHub redirects `www.blackflamegames.com` to the bare domain on its own.
3. **Verify the domain** so nobody else can claim it on GitHub Pages: open GitHub *profile Settings → Pages → Add a domain*, enter `blackflamegames.com`, and add the TXT record GitHub shows (host `_github-pages-challenge-ailaghast`) in Squarespace. Then click *Verify*.
4. Once DNS has propagated (usually minutes, sometimes a few hours), GitHub issues the HTTPS certificate. Then tick **Enforce HTTPS** in the repo's *Settings → Pages*.

### blackflamegame.com → blackflamegames.com

In Squarespace, go to *Domains → blackflamegame.com → Domain Forwarding* (under DNS). Add a rule for `@` and one for `www`, each forwarding to `https://blackflamegames.com` as a **permanent (301)** redirect, with path forwarding on if offered.

Fallback, if forwarding isn't available: push the `redirect/` folder to a second repo, enable Pages on it with custom domain `blackflamegame.com`, and use the same DNS records as above.

## Notes

- **Trademark.** The mark appears as a standalone series brand, with ™, in the hero, the nav and the footer notice. Once the site is live, submit the URL to the Internet Archive (web.archive.org/save) so there's a dated public record of use.
- **Trailer.** The YouTube player (youtube-nocookie) only loads when someone clicks *Watch the trailer*, so the page has no third-party requests until then.
- **Copy and dates** are in `docs/index.html`; release and demo dates come from the fact sheet dated November 17, 2026.

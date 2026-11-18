# Black Flame: blackflamegame.com

The home page of the BLACK FLAME™ game series by Emberfish Games. It's a static site with no build step, no cookies and no analytics, hosted on GitHub Pages.

```
docs/          the published site (GitHub Pages serves this folder)
  index.html   the page
  404.html     the not-found page
  CNAME        blackflamegame.com
  assets/      css, js, fonts (self-hosted, OFL), img (WebP), video
redirect/      optional mini-site that sends blackflamegames.com to blackflamegame.com (see step 5)
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

## Deploy (one-time setup)

1. **Repository.** Create a GitHub repository, for example `blackflame-website`, and push this folder to it. On a free GitHub plan, Pages only works on public repositories.
2. **Pages.** In the repo, go to *Settings → Pages → Build and deployment*, choose *Deploy from a branch*, then pick branch `main` and folder `/docs`. Under *Custom domain*, enter `blackflamegame.com`; the `docs/CNAME` file already contains it.
3. **DNS for blackflamegame.com**, at your domain registrar:
   | Type  | Host | Value |
   |-------|------|-------|
   | A     | @    | 185.199.108.153 |
   | A     | @    | 185.199.109.153 |
   | A     | @    | 185.199.110.153 |
   | A     | @    | 185.199.111.153 |
   | AAAA  | @    | 2606:50c0:8000::153 |
   | AAAA  | @    | 2606:50c0:8001::153 |
   | AAAA  | @    | 2606:50c0:8002::153 |
   | AAAA  | @    | 2606:50c0:8003::153 |
   | CNAME | www  | `<your-github-username>.github.io` |

   GitHub redirects `www.blackflamegame.com` to the bare domain on its own.
4. **HTTPS and domain verification.** Once DNS has propagated, which can take up to a day, tick *Enforce HTTPS* in Settings → Pages. Also verify the domain under your GitHub account (*Settings → Pages → Add a verified domain*, which needs one TXT record). Verification stops anyone else from claiming the domain on GitHub Pages.
5. **blackflamegames.com → blackflamegame.com.** The best option is your registrar's *URL forwarding / redirect*: a permanent 301 to `https://blackflamegame.com`, with path forwarding, set for both `@` and `www`. If the registrar can't do that, push the `redirect/` folder to a second GitHub repo and enable Pages on it with the custom domain `blackflamegames.com`, using the same DNS records as in step 3.

## Notes

- **Trademark.** The mark appears as a standalone series brand, with ™, in the hero, the nav and the footer notice. Once the site is live, submit the URL to the Internet Archive (web.archive.org/save) so there's a dated public record of use.
- **Trailer.** The YouTube player (youtube-nocookie) only loads when someone clicks *Watch the trailer*, so the page has no third-party requests until then.
- **Copy and dates** are in `docs/index.html`; release and demo dates come from the fact sheet dated November 17, 2026.

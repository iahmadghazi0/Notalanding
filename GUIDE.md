# NOTA landing v7: plain-words guide

You have two zips.

## A. Just put the site online (nothing to install)
Use `nota-landing-v7-dist.zip`. It is the finished site.
1. Unzip it. You get index.html, an assets folder, a photos folder and a few images.
2. On github.com click + then New repository. Name it nota-site, choose Public, Create repository.
3. Click "uploading an existing file". Select everything inside the unzipped folder (not the folder itself) and drag it in. Wait for all files to upload, then Commit changes.
4. Settings, then Pages. Under Build and deployment choose Deploy from a branch, main, /root, Save.
5. After a minute the link shows at the top: https://YOUR-USERNAME.github.io/nota-site/

The paths are relative, so it works on any repository name.

## B. Change the site and rebuild it (source zip)
1. Install Node.js (the LTS version) from nodejs.org.
2. Open a terminal inside the unzipped source folder.
3. Run `npm install` (once).
4. Run `npm run dev` to preview while editing (it prints a local address).
5. Run `npm run build`. The finished site appears in the `dist` folder. Upload the contents of `dist` as in part A.

## Where things are
- index.html: the page text.
- src/style.css: all styling.
- src/main.ts: scrolling, intro and reveal motion (GSAP, Lenis).
- src/hero3d.ts: the 3D hero (Three.js). If WebGL is not available the page falls back to a flat NOTA mark.
- public/photos: images. Add photos/portrait.jpg for your portrait.
- public/nota-logo.png: the real NOTA logo.

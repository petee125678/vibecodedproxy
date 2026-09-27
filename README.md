# Openhouse

A small, good-looking web proxy you host yourself. Type an address on the
landing page, and Openhouse fetches that page on its own connection and
hands it back to you — so a site blocked by a school, office, or café
network still opens, as long as wherever *this server* lives can reach it.

It's built on [unblocker](https://github.com/nfriedly/node-unblocker), an
open-source proxy engine, with a custom front end.

## Before you deploy: worth knowing

- **This has to live on a server, not just be a file you open.** Proxying
  only works because a real server fetches pages on your behalf — that's
  the whole trick. So the steps below deploy it to a free host that gives
  it a permanent public URL.
- **Best for reading, not for logging in.** News, wikis, docs, and blogs
  come through cleanly. Google/Facebook-style single-sign-on logins and
  heavy single-page apps generally resist proxies. Video sites like
  YouTube are unreliable.
- **`unblocker` is AGPL-3.0 licensed.** Fine for personal use. If you ever
  make your deployment public and widely used by others, the AGPL expects
  you to make the source available to your users — this repo already is,
  so you're covered either way.

## Option A — Glitch (fastest, no GitHub needed)

1. Go to [glitch.com](https://glitch.com) and sign in (email or GitHub —
   either works, it's free).
2. Click **New Project → Import from GitHub**, *or*, if you'd rather not
   use GitHub at all, click **New Project → glitch-hello-node** to get a
   blank Node project, then delete its default files and use the editor's
   **Upload** button (top-left, next to the file list) to add every file
   from this folder (`server.js`, `package.json`, and the `public/`
   folder with `index.html`, `style.css`, `app.js`).
3. Glitch installs dependencies and starts the app automatically. Click
   **Preview** (or **Share → Live site**) to get your permanent URL —
   something like `https://your-project-name.glitch.me`.
4. That's it. Visit that URL from any network and use the address bar on
   the page.

Glitch's free tier sleeps the app after a few minutes of no traffic; it
wakes back up (takes a few seconds) the next time someone visits.

## Option B — Render (a bit more setup, more robust)

Render needs your code in a Git repository first.

1. Create a free [GitHub](https://github.com) account if you don't have
   one. Make a new repository, then use GitHub's **"Add file → Upload
   files"** button in the browser to upload everything in this folder
   (no command line needed).
2. Go to [render.com](https://render.com), sign in with GitHub, and click
   **New → Web Service**. Pick the repository you just created.
3. Render should auto-detect Node. Confirm these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Click **Create Web Service**. After the first deploy finishes (a
   minute or two), Render gives you a permanent URL like
   `https://openhouse-xxxx.onrender.com`.

Render's free tier also sleeps after inactivity and takes ~30-60 seconds
to wake up on the next visit — normal for free hosting.

## Running it locally (to preview before you deploy)

```
npm install
npm start
```

Then open `http://localhost:8080`. Note that running it on your own
laptop does **not** get you past a network's blocks, since your laptop is
still on that same restricted network — the point of Options A/B above is
that the server lives somewhere else entirely.

## Files

```
server.js        the proxy server (Express + unblocker)
public/
  index.html     the landing page
  style.css      its styling
  app.js         address-bar + theme-toggle behavior
package.json     dependencies and start script
```

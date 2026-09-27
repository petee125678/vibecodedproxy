// Openhouse — a small self-hosted web proxy.
//
// This server does two jobs:
//   1. Serves the pretty front-end (public/) — the address-bar page.
//   2. Runs the actual proxy under /proxy/<url>, which fetches the target
//      site server-side and rewrites its links/assets so browsing continues
//      to flow through this server.
//
// The proxying itself is handled by the battle-tested `unblocker` library —
// there's no reason to hand-roll HTML/CSS link rewriting when a well-used
// open-source engine already does it well.

const path = require("path");
const express = require("express");
const Unblocker = require("unblocker");

const PORT = process.env.PORT || 8080;

const app = express();

const unblocker = new Unblocker({
  prefix: "/proxy/",
  // Rewrites <script>/XHR calls in proxied pages so they route back through
  // this proxy too, instead of hitting the real site directly.
  clientScripts: true,
  responseMiddleware: [
    // Sites that send a strict Referrer-Policy header (common on
    // JS-heavy sites) stop the browser from telling us, on the *next*
    // request, which proxied page a client-side redirect came from.
    // Without that referrer, unblocker's own link-recovery can't work
    // out where a root-relative link (e.g. "/login/") was supposed to
    // go, and the request 404s. Dropping the header keeps referrers
    // flowing so that recovery keeps working.
    function relaxReferrerPolicy(data) {
      if (data.headers) {
        delete data.headers["referrer-policy"];
      }
    },
  ],
});

// Unblocker must be one of the very first middleware so it can intercept
// /proxy/* requests before anything else touches them.
app.use(unblocker);

// Everything else (the landing page) is a plain static site.
app.use(express.static(path.join(__dirname, "public")));

// Anything that reaches this point is a request unblocker couldn't place
// (no /proxy/ prefix, no usable referrer to recover from, no matching
// static file) — most often a proxied site's own internal link or asset
// that got requested outside the proxy path. Show something clearer than
// Express's bare "Cannot GET" error.
app.use((req, res) => {
  res.status(404).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Page not found — Openhouse</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #15130f; color: #f4ecdd;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
  .box { max-width: 440px; text-align: center; }
  h1 { font-size: 1.3rem; margin-bottom: 8px; }
  p { color: #ac9f8a; line-height: 1.5; }
  code { background: #272119; padding: 2px 6px; border-radius: 4px; }
  a { color: #d9a441; }
</style></head>
<body><div class="box">
  <h1>Couldn't follow that link</h1>
  <p>The site you were on sent your browser to <code>${req.originalUrl}</code> in a way this proxy
  couldn't trace back to the original site — usually a sign of a heavy JavaScript app or a
  login wall that resists proxying.</p>
  <p><a href="/">&larr; Back to Openhouse</a></p>
</div></body></html>`);
});

const server = app.listen(PORT, () => {
  console.log(`Openhouse is running at http://localhost:${PORT}`);
});

// Required so unblocker can also proxy WebSocket connections.
server.on("upgrade", unblocker.onUpgrade);

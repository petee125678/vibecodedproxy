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
});

// Unblocker must be one of the very first middleware so it can intercept
// /proxy/* requests before anything else touches them.
app.use(unblocker);

// Everything else (the landing page) is a plain static site.
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log(`Openhouse is running at http://localhost:${PORT}`);
});

// Required so unblocker can also proxy WebSocket connections.
server.on("upgrade", unblocker.onUpgrade);

(function () {
  "use strict";

  var form = document.getElementById("go-form");
  var input = document.getElementById("url-input");
  var hint = document.getElementById("form-hint");
  var themeToggle = document.getElementById("theme-toggle");

  // ---- theme toggle (remembers the visitor's choice) ----
  try {
    var saved = localStorage.getItem("openhouse-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (e) {
    /* private browsing or blocked storage — fall back to system theme */
  }

  themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next;
    if (!current) {
      next = prefersDark ? "light" : "dark";
    } else {
      next = current === "dark" ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("openhouse-theme", next);
    } catch (e) {
      /* ignore */
    }
  });

  // ---- turn whatever the visitor typed into a real, proxyable URL ----
  function toTargetUrl(raw) {
    var value = raw.trim();
    if (!value) return null;

    // Already a full URL.
    if (/^https?:\/\//i.test(value)) return value;

    // Looks like a bare domain (has a dot, no spaces) — assume https.
    if (!/\s/.test(value) && value.indexOf(".") !== -1) {
      return "https://" + value;
    }

    // Otherwise treat it as a search.
    return "https://duckduckgo.com/html/?q=" + encodeURIComponent(value);
  }

  function openThroughProxy(url) {
    window.location.href = "/proxy/" + url;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var target = toTargetUrl(input.value);
    if (!target) {
      hint.hidden = false;
      hint.textContent = "Type a web address first, like example.com.";
      return;
    }
    hint.hidden = true;
    openThroughProxy(target);
  });

  // ---- shortcut pills ----
  document.querySelectorAll(".pill[data-url]").forEach(function (pill) {
    pill.addEventListener("click", function (event) {
      event.preventDefault();
      openThroughProxy(pill.getAttribute("data-url"));
    });
  });
})();

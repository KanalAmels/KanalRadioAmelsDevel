
/* Kanal-Radio Amels – Zentrale Menüsteuerung */

document.addEventListener("DOMContentLoaded", async function () {

  const menuContainer = document.getElementById("menu-container");

  if (!menuContainer) {
    return;
  }

  try {

    // Projekt-Stammverzeichnis automatisch ermitteln
    // Funktioniert in Daily, Devel und auf anderen Servern

    const menuScript = Array.from(document.scripts).find(function (script) {
      return script.src &&
        new URL(script.src).pathname.endsWith("/menu.js");
    });

    if (!menuScript) {
      throw new Error("Pfad zur menu.js konnte nicht ermittelt werden");
    }

    const projectRoot = new URL("./", menuScript.src);

    // Zentrales Menü aus dem eigenen Projekt laden

    const menuURL = new URL("menu.html", projectRoot);
    const response = await fetch(menuURL);

    if (!response.ok) {
      throw new Error("Menü konnte nicht geladen werden");
    }

    const menuHTML = await response.text();

    menuContainer.innerHTML = `
      <button
        class="menu"
        id="menu-button"
        type="button"
        aria-expanded="false"
        aria-controls="menu-dropdown">
        Menü ☰
      </button>
      ${menuHTML}
    `;

    const menuButton = document.getElementById("menu-button");
    const menuDropdown = document.getElementById("menu-dropdown");

    // Alle internen Menülinks auf das eigene Projekt beziehen

    menuDropdown.querySelectorAll("a").forEach(function (link) {

      const originalPath = link.getAttribute("href");

      if (!originalPath) {
        return;
      }

      // Bisherige Daily-Links in projektrelative Links umwandeln

      const relativePath = originalPath.replace(
        /^\/KanalRadioAmelsDaily\//,
        ""
      );

      if (relativePath !== originalPath) {
        link.href = new URL(relativePath, projectRoot).href;
      }

    });

    // Einheitliche Pfadprüfung
    // Erkennt sowohl Ordner-URLs als auch index.html

    function normalizePath(path) {

      return path
        .replace(/index\.html$/, "")
        .replace(/\/+$/, "") + "/";

    }

    // Aktuellen Sender automatisch markieren

    const currentPath = normalizePath(window.location.pathname);

    let activeDecade = null;

    menuDropdown.querySelectorAll("a").forEach(function (link) {

      const linkPath = normalizePath(link.pathname);

      if (linkPath === currentPath) {

        link.setAttribute("aria-current", "page");

        // Zugehöriges Jahrzehnt ebenfalls markieren

        const parentDecade = link.closest(".menu-decade");

        if (parentDecade) {

          parentDecade.classList.add("menu-active-decade");

          // Aktuelles Jahrzehnt für automatisches Öffnen merken

          activeDecade = parentDecade;

        }

      }

    });

    // Formatierung für den aktiven Sender
    // und das zugehörige Jahrzehnt dauerhaft sicherstellen

    if (!document.getElementById("kanalradio-menu-active-style")) {

      const activeStyle = document.createElement("style");

      activeStyle.id = "kanalradio-menu-active-style";

      activeStyle.textContent = `
        #menu-dropdown a[aria-current="page"] {
          font-weight: bold !important;
          color: #facc15 !important;
        }

        #menu-dropdown .menu-active-decade > summary {
          font-weight: bold !important;
          color: #facc15 !important;
        }

        #menu-dropdown .menu-decade[open] > summary {
          font-weight: bold !important;
          color: #facc15 !important;
        }
      `;

      document.head.appendChild(activeStyle);

    }

    // Immer nur ein Jahrzehnt gleichzeitig aufklappen

    const decades = menuDropdown.querySelectorAll(".menu-decade");

    decades.forEach(function (decade) {

      decade.addEventListener("toggle", function () {

        if (!decade.open) {
          return;
        }

        decades.forEach(function (other) {

          if (other !== decade) {
            other.open = false;
          }

        });

      });

    });

    // Aktuelles Jahrzehnt automatisch aufklappen
    // Dadurch wird beim Öffnen des Menüs auch der
    // aktive Radio-Mix oder Dance-Mix sofort sichtbar

    if (activeDecade) {
      activeDecade.open = true;
    }

    // Menü öffnen und schließen

    function closeMenu() {

      menuDropdown.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");

    }

    menuButton.addEventListener("click", function () {

      const isOpen = menuDropdown.classList.toggle("open");

      menuButton.setAttribute("aria-expanded", String(isOpen));

    });

    // Schließen beim Klick außerhalb

    document.addEventListener("click", function (event) {

      if (!menuContainer.contains(event.target)) {
        closeMenu();
      }

    });

    // Schließen mit Escape

    document.addEventListener("keydown", function (event) {

      if (
        event.key === "Escape" &&
        menuDropdown.classList.contains("open")
      ) {

        closeMenu();
        menuButton.focus();

      }

    });

  } catch (error) {

    console.error("Kanal-Radio Menüfehler:", error);
    menuContainer.textContent = "Menü nicht verfügbar";

  }

});

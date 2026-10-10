/* Ladenfenster – gemeinsames Skript für alle Seiten.
   Jeder Teil prüft selbst, ob seine Elemente auf der Seite vorkommen. */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Damit :active auf iOS sofort beim Berühren greift
  document.addEventListener("touchstart", function () {}, { passive: true });

  /* ---------- Navigation ---------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Menü schließen" : "Menü öffnen";
    menu.classList.toggle("is-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (menu.classList.contains("is-open") && !header.contains(event.target)) {
        setMenu(false);
      }
    });

    window.matchMedia("(min-width: 768px)").addEventListener("change", function () {
      setMenu(false);
    });
  }

  // Kante unter der Glas-Leiste erst, wenn Inhalt darunter liegt
  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Startseite: Live-Status im Handy (Café Ennsblick, erfunden) ---------- */
  const status = document.querySelector("[data-open-status]");
  if (status) {
    // Öffnungszeiten in Minuten ab Mitternacht, Index = Wochentag (0 = Sonntag)
    const hours = [
      [9 * 60, 14 * 60],
      [7 * 60 + 30, 18 * 60],
      [7 * 60 + 30, 18 * 60],
      [7 * 60 + 30, 18 * 60],
      [7 * 60 + 30, 18 * 60],
      [7 * 60 + 30, 18 * 60],
      [8 * 60, 17 * 60],
    ];
    const fmt = function (min) {
      return Math.floor(min / 60) + ":" + String(min % 60).padStart(2, "0");
    };
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const [open, close] = hours[day];
    const text = status.querySelector("[data-open-text]");

    if (minutes >= open && minutes < close) {
      text.textContent = "Jetzt geöffnet bis " + fmt(close);
    } else if (minutes < open) {
      text.textContent = "Öffnet heute um " + fmt(open);
      status.classList.add("is-closed");
    } else {
      text.textContent = "Geschlossen, morgen ab " + fmt(hours[(day + 1) % 7][0]);
      status.classList.add("is-closed");
    }

    const todayRow = document.querySelector('[data-days~="' + day + '"]');
    if (todayRow) todayRow.classList.add("is-today");
  }

  /* ---------- Referenzen: Detail-Fenster ---------- */
  const dialogs = document.querySelectorAll(".ref-dialog");
  if (dialogs.length && typeof HTMLDialogElement === "function") {
    let lastTrigger = null;
    const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

    // Hintergrund ein- und ausblenden; ältere Browser ohne pseudoElement überspringen das
    const fadeBackdrop = function (dialog, from, to, duration) {
      try {
        dialog.animate([{ opacity: from }, { opacity: to }], {
          duration: duration,
          easing: "ease",
          fill: "forwards",
          pseudoElement: "::backdrop",
        });
      } catch (e) {}
    };

    const openDialog = function (dialog, trigger) {
      lastTrigger = trigger;
      dialog.classList.remove("is-closing");
      // Reste vom letzten Schließen (fill: forwards) entfernen
      dialog.getAnimations({ subtree: true }).forEach(function (a) {
        a.cancel();
      });
      dialog.showModal();

      // Das Fenster wächst aus dem angeklickten Element heraus
      const from = trigger.getBoundingClientRect();
      const to = dialog.getBoundingClientRect();
      const originX = from.left + from.width / 2 - to.left;
      const originY = from.top + from.height / 2 - to.top;
      dialog.style.transformOrigin = originX + "px " + originY + "px";

      const frames = reduceMotion.matches
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "scale(0.9)" },
            { opacity: 1, transform: "scale(1)" },
          ];
      dialog.openAnim = dialog.animate(frames, {
        duration: reduceMotion.matches ? 150 : 340,
        easing: easeOut,
      });
      fadeBackdrop(dialog, 0, 1, reduceMotion.matches ? 150 : 260);
    };

    const closeDialog = function (dialog) {
      if (dialog.classList.contains("is-closing")) return;
      dialog.classList.add("is-closing");

      let done = false;
      const finish = function () {
        if (done) return;
        done = true;
        dialog.close();
        dialog.classList.remove("is-closing");
      };

      fadeBackdrop(dialog, 1, 0, reduceMotion.matches ? 120 : 180);

      // Wird während des Öffnens geschlossen: dieselbe Animation rückwärts,
      // ab der Stelle, an der sie gerade ist. Kein Sprung zurück auf 100 %.
      const running = dialog.openAnim;
      if (running && running.playState === "running") {
        running.onfinish = finish;
        running.playbackRate = -1.6;
      } else {
        // Gleicher Weg zurück, aber schneller als beim Öffnen
        const frames = reduceMotion.matches
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(0.95)" },
            ];
        dialog.animate(frames, {
          duration: reduceMotion.matches ? 120 : 180,
          easing: easeOut,
          fill: "forwards",
        }).onfinish = finish;
      }
      // Falls der Browser Animationen pausiert (z. B. Tab im Hintergrund)
      setTimeout(finish, 400);
    };

    document.querySelectorAll("[data-open-dialog]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const dialog = document.getElementById(trigger.dataset.openDialog);
        if (dialog) openDialog(dialog, trigger);
      });
    });

    dialogs.forEach(function (dialog) {
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeDialog(dialog);
      });
      dialog.addEventListener("click", function (event) {
        // Klick auf den abgedunkelten Hintergrund schließt
        if (event.target === dialog) closeDialog(dialog);
      });
      dialog.querySelectorAll("[data-close-dialog]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          closeDialog(dialog);
        });
      });
      dialog.addEventListener("close", function () {
        if (lastTrigger) lastTrigger.focus();
      });
    });
  }

  /* ---------- Pakete: Wartung fürs erste Jahr ---------- */
  const upkeepSwitch = document.getElementById("upkeep-switch");
  if (upkeepSwitch) {
    const monthly = Number(upkeepSwitch.dataset.monthly) || 29;
    // Schreibweise wie auf der Seite: "1.038 €" statt "€ 1.038"
    const euro = {
      format: function (n) {
        // de-DE, weil de-AT je nach Browser mit Leerzeichen gruppiert
        return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
      },
    };

    // Eine gemeinsame Ansage statt drei einzelner Live-Bereiche
    const upkeepStatus = document.getElementById("upkeep-status");

    const render = function (announce) {
      const on = upkeepSwitch.checked;
      const parts = [];
      document.querySelectorAll("[data-plan-price]").forEach(function (el) {
        const base = Number(el.dataset.planPrice);
        const sub = el.querySelector(".plan-sub");
        const name = el.closest(".plan").querySelector("h2").textContent;
        const total = euro.format(base + monthly * 12);
        if (on) {
          sub.innerHTML = "Erstes Jahr mit Wartung: <strong>" + total + "</strong>";
        } else {
          sub.textContent = "Einmalig, Fixpreis";
        }
        // Kurzes Scharfstellen zeigt, dass sich die Zeile geändert hat
        if (announce) {
          sub.animate(
            reduceMotion.matches
              ? [{ opacity: 0.4 }, { opacity: 1 }]
              : [
                  { opacity: 0.3, filter: "blur(3px)", transform: "translateY(3px)" },
                  { opacity: 1, filter: "blur(0)", transform: "none" },
                ],
            { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
          );
        }
        parts.push(name + " " + total);
      });
      if (upkeepStatus && announce) {
        upkeepStatus.textContent = on
          ? "Erstes Jahr mit Wartung: " + parts.join(", ") + "."
          : "Wieder die Einmalpreise ohne Wartung.";
      }
    };

    upkeepSwitch.addEventListener("change", function () {
      render(true);
    });
    render(false);
  }

  /* ---------- Kontakt: Prüfung beim Ausfüllen ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const confirmBox = document.getElementById("confirm");

    const rules = {
      name: function (v) {
        if (!v) return "Bitte geben Sie Ihren Namen an.";
        if (v.length < 2) return "Der Name ist zu kurz.";
        return "";
      },
      betrieb: function (v) {
        return v ? "" : "Bitte geben Sie den Namen Ihres Betriebs an.";
      },
      email: function (v) {
        if (!v) return "Bitte geben Sie Ihre E-Mail-Adresse an.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
          return "Diese E-Mail-Adresse sieht unvollständig aus, z. B. name@betrieb.at.";
        return "";
      },
      telefon: function (v) {
        if (!v) return "";
        if (!/^[+0-9 ()/-]{6,}$/.test(v))
          return "Bitte nur Ziffern, Leerzeichen und + / - verwenden.";
        return "";
      },
      branche: function (v) {
        return v ? "" : "Bitte wählen Sie eine Branche.";
      },
      nachricht: function (v) {
        if (!v) return "Schreiben Sie uns kurz, worum es geht.";
        if (v.length < 20)
          return "Noch " + (20 - v.length) + " Zeichen, damit wir genug Anhaltspunkte haben.";
        return "";
      },
    };

    const fieldOf = function (input) {
      return input.closest(".field");
    };

    const check = function (input) {
      const rule = rules[input.name];
      if (!rule) return true;
      const message = rule(input.value.trim());
      const field = fieldOf(input);
      const error = field.querySelector(".field-error");
      const hasValue = input.value.trim() !== "";

      error.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
      field.classList.toggle("is-invalid", Boolean(message));
      field.classList.toggle("is-valid", !message && hasValue);
      return !message;
    };

    const inputs = Array.from(form.querySelectorAll("input, select, textarea")).filter(
      function (el) {
        return rules[el.name];
      }
    );

    inputs.forEach(function (input) {
      // Erst nach dem Verlassen des Felds prüfen, danach bei jeder Eingabe
      input.addEventListener("blur", function () {
        if (input.value.trim() !== "" || input.dataset.touched) {
          input.dataset.touched = "1";
          check(input);
        }
      });
      input.addEventListener("input", function () {
        if (input.dataset.touched) check(input);
      });
      input.addEventListener("change", function () {
        if (input.tagName === "SELECT") {
          input.dataset.touched = "1";
          check(input);
        }
      });
    });

    // Paket aus der Adresse übernehmen, z. B. kontakt.html?paket=standard
    const wanted = new URLSearchParams(window.location.search).get("paket");
    if (wanted) {
      const radio = form.querySelector('input[name="paket"][value="' + CSS.escape(wanted) + '"]');
      if (radio) radio.checked = true;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let firstInvalid = null;
      inputs.forEach(function (input) {
        input.dataset.touched = "1";
        if (!check(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const name = form.elements.name.value.trim();
      confirmBox.querySelector("[data-confirm-name]").textContent = name;
      form.hidden = true;
      confirmBox.hidden = false;
      confirmBox.querySelector("h2").focus();
    });

    confirmBox.querySelector("[data-reset]").addEventListener("click", function () {
      form.reset();
      inputs.forEach(function (input) {
        delete input.dataset.touched;
        const field = fieldOf(input);
        field.classList.remove("is-invalid", "is-valid");
        field.querySelector(".field-error").textContent = "";
        input.removeAttribute("aria-invalid");
      });
      confirmBox.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
})();

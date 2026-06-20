/* =========================================================
   I am listening — gallery + audio player
   Vanilla JS. Data comes from data.js (window.GALLERY_DATA),
   so the page works by simply opening index.html — no server.
   ========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    gallery: $("gallery"),
    audio: $("audioPlayer"),
    player: $("player"),
    playToggle: $("playToggle"),
    progress: $("progressBar"),
    current: $("currentTime"),
    duration: $("duration"),
    thumb: $("nowThumb"),
    intro: $("intro"),
    enterBtn: $("enterBtn"),
    aboutBtn: $("aboutBtn"),
    lightbox: $("lightbox"),
    lightboxImg: $("lightboxImg"),
    lightboxName: $("lightboxName"),
    lightboxClose: $("lightboxClose"),
  };

  let activeFrame = null; // the <button> of the portrait now playing
  let isSeeking = false;  // true while the user drags the progress bar

  /* ---------- Helpers ---------- */
  const fmtTime = (secs) => {
    if (!Number.isFinite(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ---------- Build the gallery ---------- */
  function renderGallery(items) {
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const frame = document.createElement("button");
      frame.type = "button";
      frame.className = "frame";
      frame.style.setProperty("--i", index);
      frame.setAttribute("aria-label", `${item.name || `Portrait ${index + 1}`} — see and listen`);

      const img = document.createElement("img");
      img.src = `portraits/${item.photo}`;
      img.alt = item.name || `Portrait ${index + 1}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => frame.classList.add("is-error"), { once: true });

      const eq = document.createElement("span");
      eq.className = "frame__eq";
      eq.setAttribute("aria-hidden", "true");
      eq.innerHTML = "<i></i><i></i><i></i>";

      frame.append(img, eq);
      frame.addEventListener("click", () => openPortrait(frame, item, index));
      fragment.appendChild(frame);
    });

    els.gallery.appendChild(fragment);
    els.gallery.setAttribute("aria-busy", "false");
  }

  /* ---------- Open a portrait (enlarge + play) ---------- */
  function openPortrait(frame, item, index) {
    // Enlarge
    els.lightboxImg.src = `portraits/${item.photo}`;
    els.lightboxImg.alt = item.name || `Portrait ${index + 1}`;
    els.lightboxName.textContent = item.name || "";
    openLightbox();

    // Play their song (unless re-opening the one already playing)
    if (frame === activeFrame && els.audio.src) return;

    if (activeFrame) activeFrame.classList.remove("is-playing");
    activeFrame = frame;
    frame.classList.add("is-playing");

    els.thumb.src = `portraits/${item.photo}`;
    els.thumb.alt = item.name || "";

    revealPlayer();
    els.audio.src = encodeURI(item.song);
    els.audio.play().catch(() => {/* gesture/autoplay quirks are non-fatal */ });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox() {
    els.lightbox.hidden = false;
    requestAnimationFrame(() => els.lightbox.classList.add("is-open"));
  }
  function closeLightbox() {
    els.lightbox.classList.remove("is-open");
    // music keeps playing; just hide the enlarged view after the fade
    setTimeout(() => { els.lightbox.hidden = true; }, 400);
  }

  /* ---------- Playback ---------- */
  function togglePlay() {
    if (!els.audio.src) return;
    if (els.audio.paused) els.audio.play().catch(() => {});
    else els.audio.pause();
  }

  function revealPlayer() {
    els.player.hidden = false;
    requestAnimationFrame(() => els.player.classList.add("is-visible"));
  }

  function setSeek(pct) {
    els.progress.value = pct;
    els.progress.style.setProperty("--seek", `${pct}%`);
  }

  /* ---------- Audio events ---------- */
  function bindAudio() {
    const a = els.audio;

    a.addEventListener("loadedmetadata", () => {
      els.duration.textContent = fmtTime(a.duration);
      setSeek(0);
    });

    a.addEventListener("timeupdate", () => {
      els.current.textContent = fmtTime(a.currentTime);
      if (!isSeeking && Number.isFinite(a.duration) && a.duration > 0) {
        setSeek((a.currentTime / a.duration) * 100);
      }
    });

    a.addEventListener("play", () => {
      els.player.classList.remove("is-paused");
      els.player.classList.add("is-playing-anim");
      els.playToggle.setAttribute("aria-label", "Pause");
      if (activeFrame) activeFrame.classList.add("is-playing");
    });
    a.addEventListener("pause", () => {
      els.player.classList.add("is-paused");
      els.player.classList.remove("is-playing-anim");
      els.playToggle.setAttribute("aria-label", "Play");
    });
    a.addEventListener("ended", () => {
      els.player.classList.add("is-paused");
      els.player.classList.remove("is-playing-anim");
    });
    a.addEventListener("error", () => {
      els.duration.textContent = "—";
      els.current.textContent = "unavailable";
      els.player.classList.add("is-paused");
      els.player.classList.remove("is-playing-anim");
      if (activeFrame) activeFrame.classList.add("is-error");
    });

    // --- Seek: keep the bar under the user's control while dragging ---
    const previewSeek = () => {
      isSeeking = true;
      setSeek(els.progress.value);
      if (Number.isFinite(a.duration)) {
        els.current.textContent = fmtTime((els.progress.value / 100) * a.duration);
      }
    };
    const commitSeek = () => {
      if (Number.isFinite(a.duration)) {
        a.currentTime = (els.progress.value / 100) * a.duration;
      }
      isSeeking = false;
    };
    // `input` fires continuously (mouse, touch, keyboard); `change` fires when released.
    els.progress.addEventListener("input", previewSeek);
    els.progress.addEventListener("change", commitSeek);
    // pointerup safety net in case `change` is missed mid-drag
    els.progress.addEventListener("pointerup", commitSeek);

    els.playToggle.addEventListener("click", togglePlay);
  }

  /* ---------- Intro / about / lightbox controls ---------- */
  function bindOverlays() {
    let seen = false;
    try { seen = sessionStorage.getItem("iam:entered") === "1"; } catch (_) {}
    if (seen) els.intro.classList.add("is-hidden");

    const dismissIntro = () => {
      els.intro.classList.add("is-hidden");
      try { sessionStorage.setItem("iam:entered", "1"); } catch (_) {}
    };
    els.enterBtn.addEventListener("click", dismissIntro);
    els.aboutBtn.addEventListener("click", () => els.intro.classList.remove("is-hidden"));

    els.lightboxClose.addEventListener("click", closeLightbox);
    els.lightbox.addEventListener("click", (e) => {
      if (e.target === els.lightbox) closeLightbox(); // click backdrop to close
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (els.lightbox.classList.contains("is-open")) closeLightbox();
      else if (!els.intro.classList.contains("is-hidden")) dismissIntro();
    });
  }

  /* ---------- Keyboard: space toggles play (outside form fields) ---------- */
  function bindKeys() {
    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (e.code === "Space" && !typing && els.audio.src && els.intro.classList.contains("is-hidden")) {
        e.preventDefault();
        togglePlay();
      }
    });
  }

  /* ---------- Boot ---------- */
  function showLoadError() {
    els.gallery.setAttribute("aria-busy", "false");
    els.gallery.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--muted);font-family:var(--mono);font-size:.8rem;letter-spacing:.04em">The gallery could not be loaded. Check that data.js is present.</p>';
  }

  function init() {
    bindAudio();
    bindOverlays();
    bindKeys();

    const data = window.GALLERY_DATA;
    const items = data && Array.isArray(data.items) ? data.items : null;
    if (!items || !items.length) {
      console.error("No gallery data found (window.GALLERY_DATA).");
      return showLoadError();
    }
    renderGallery(items);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

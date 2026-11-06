/* ============================================
   07.11 — script.js
   Semua data yang bisa kamu ganti ada di CONFIG.
   ============================================ */

const CONFIG = {
  name: "Lian Safitri",
  nickname: "Lian",
  senderNickname: "daw bisa semua",
  birthday: "07 November",
  releaseAt: "2026-11-06T17:00:00.000Z", // 07 Nov 2026 00:00 WIB
  adminPassword: "adam", // ganti password admin di sini
  secretPassword: "liansafitri", // password rahasia, huruf kecil semua dibandingkan otomatis
  secretMessage: "hay princesss imup. kalau kamu berhasil ngetik nama ini dan ngebuka pesan ini, artinya kamu emang ditakdirkan buat baca isi kepala dan hati gweh yang sebenarnya. Jujur, selama ini aku selalu nunggu—bukan cuma buat sekadar jadi 'kakak' atau tempat ngobrol pas gabut, tapi buat bener-bener ada di sisi kamu lebih dari itu. Makasih ya udah jadi bagian paling seru di hari-hariku. Kurang-kurangin galaknya, aku takut awokwakaokw, dan... let's see where this goes, shall we?",
  diaryText: "hei. sebelum kamu lanjut ke bawah, aku cuma mau bilang — semua ini aku buat sendiri, baca pelan-pelan, khusus untuk kamu. aku buat ini dan mempersiapkan semuanya dari awal aku mengenalmu selama kurang lebih 6 bulan ini aku mempersiapkan semuanya...",
  song: {
    title: "Beautiful",
    artist: "Bazzi",
    src: "assets/music/mix.mp3",
    cover: "assets/music/cover.jpg"
  },
  photos: [
    { src: "assets/images/1.png", caption: "first date woilah jir..." },
    { src: "assets/images/2.jpeg", caption: "hujan pas joging di pemda..." },
    { src: "assets/images/3.jpg", caption: "innerchild gua bisa tercapai" },
    { src: "assets/images/4.jpg", caption: "photobooth pertama aku (eum maybe kita)..." },
    { src: "assets/images/5.jpg", caption: "ini waktu dia abis nangis gays..." },
    { src: "assets/images/6.jpg", caption: "ini aku kangen berat 2 bulan gak ketemu" },
    { src: "assets/images/7.jpg", caption: "maliosewu date when yah bersandar ahay..." }
    // tambahkan foto lain di sini: { src: "assets/images/foto-04.jpg", caption: "..." }
  ],
  intro: {
    song: "assets/music/birthday.mp3",   // lagu pertama (overlay). Kalau file tidak ada, dimainkan melodi Happy Birthday bawaan
    voice: "",                            // opsional: rekaman suaramu, mis. "assets/music/ucapan.mp3". Kosong = suara bawaan browser
    speech: "Selamat ulang tahun, {name}", // teks yang dibacakan kalau voice kosong
    waitSeconds: 10                       // berapa detik sebelum tombol "lihat website" muncul
  },
  flowerImages: [
    // isi dengan path PNG bunga kamu, contoh: "assets/flowers/petal-01.png"
    // dibiarkan kosong = pakai fallback bentuk kelopak CSS
  ]
};

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  // refresh: selalu mulai dari awal (countdown/intro), bukan di tengah halaman
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.querySelectorAll("[data-name]").forEach(el => el.textContent = CONFIG.name);
  document.querySelector("[data-song-title]").textContent = CONFIG.song.title;
  document.querySelector("[data-song-artist]").textContent = CONFIG.song.artist;
  document.querySelector("[data-diary-date]").textContent = CONFIG.birthday;
  const cover = $("music-cover");
  cover.addEventListener("error", () => { cover.style.display = "none"; }); // cover.jpg belum ada -> lingkaran polos
  cover.src = CONFIG.song.cover;
  $("bg-audio").src = CONFIG.song.src;

  initClock();
  initPageOpen();
  initSectionTransitions();
  initScrollReveal();
  const spawnPetal = initFlowers();
  initPartyDeco();
  initFlowerBursts(spawnPetal);
  initParallax();
  initTypewriter();
  initNotes();
  initAlbum();
  initLightbox();
  initVideoFrame();
  initSecret();
  initEnvelope();
  const music = initMusicPlayer();
  initRestart();
  initReleaseGate(() => initIntro(music));
});

/* ---------- kilatan kamera (dipakai intro & album) ---------- */
function cineFlash(soft){
  if (REDUCED) return;
  const el = $("cine-flash");
  if (!el) return;
  el.classList.toggle("soft", !!soft);
  el.classList.remove("go");
  void el.offsetWidth; // restart animasi
  el.classList.add("go");
}

/* ---------- clock (diary meta) ---------- */
function initClock(){
  const el = document.querySelector("[data-diary-time]");
  const fmt = () => new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
  el.textContent = fmt();
  setInterval(() => { if (!document.hidden) el.textContent = fmt(); }, 30000);
}

/* ---------- opening page-turn ---------- */
function initPageOpen(){
  const btn = $("open-book-btn");
  const fold = document.querySelector(".page-fold");
  btn.addEventListener("click", () => {
    if (fold.classList.contains("opening")) return;
    fold.classList.add("opening");
    document.body.classList.add("book-open");
    setTimeout(() => {
      $("diary").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
    }, 500);
    setTimeout(() => fold.classList.remove("opening"), 1250); // bisa dipencet lagi setelah restart
  });
}

/* ---------- section = "scene": datang dengan gerak kamera masing-masing ---------- */
function initSectionTransitions(){
  const sections = document.querySelectorAll(".section:not(.landing)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.target.classList.toggle("in-view", entry.isIntersecting));
  }, { threshold: 0.05 }); // rendah supaya section tinggi di HP tetap muncul
  sections.forEach(s => io.observe(s));
}

/* ---------- scroll reveal: jeda dihitung per "batch" yang muncul bersamaan ---------- */
function initScrollReveal(){
  const io = new IntersectionObserver((entries) => {
    const vis = entries.filter(e => e.isIntersecting)
      .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    vis.forEach((entry, k) => {
      const sec = entry.target.closest(".section");
      const step = sec && sec.dataset.stagger ? +sec.dataset.stagger : 90;
      entry.target.style.transitionDelay = (REDUCED ? 0 : k * step) + "ms";
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { threshold: .25, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ---------- typewriter for diary ---------- */
function initTypewriter(){
  const el = $("diary-typewriter");
  const text = CONFIG.diaryText;
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)){
      io.disconnect();
      if (REDUCED){ el.textContent = text; el.classList.add("done"); }
      else typeText(el, text, 28);
    }
  }, { threshold:.5 });
  io.observe(el);
}
function typeText(el, text, speed){
  let i = 0;
  el.textContent = "";
  el.classList.remove("done");
  (function step(){
    if (i < text.length){
      i++;
      el.textContent = text.slice(0, i);
      setTimeout(step, speed);
    } else {
      el.classList.add("done");
    }
  })();
}

/* ---------- flower particles (ringan, dibatasi, berhenti saat tab tersembunyi) ---------- */
function initFlowers(){
  const field = $("flower-field");
  const MAX_PETALS = window.innerWidth < 640 ? 7 : 14;
  const SPAWN_INTERVAL = window.innerWidth < 640 ? 2600 : 1800;
  let count = 0;

  function spawn(){
    if (count >= MAX_PETALS || document.hidden) return;
    const petal = document.createElement("div");
    petal.className = "petal" + (CONFIG.flowerImages.length ? "" : " fallback");
    if (CONFIG.flowerImages.length){
      const img = CONFIG.flowerImages[Math.floor(Math.random() * CONFIG.flowerImages.length)];
      petal.style.setProperty("--petal-img", `url(${img})`);
    }
    const size = 14 + Math.random() * 14;
    const duration = 10 + Math.random() * 8;
    const drift = (Math.random() - 0.5) * 160;
    const rotateEnd = (Math.random() - 0.5) * 360;
    petal.style.left = (Math.random() * window.innerWidth) + "px";
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    field.appendChild(petal);
    count++;

    const anim = petal.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${drift * 0.3}px, ${window.innerHeight * 0.3}px) rotate(${rotateEnd * 0.3}deg)`, opacity: .85, offset:.15 },
      { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${rotateEnd}deg)`, opacity: 0 }
    ], { duration: duration * 1000, easing: "ease-in-out" });
    anim.onfinish = () => { petal.remove(); count--; };
  }

  if (!REDUCED){
    // kelopak baru hanya muncul setelah website terbuka (tidak di balik countdown/intro)
    setInterval(() => { if (document.body.classList.contains("site-ready")) spawn(); }, SPAWN_INTERVAL);
  }
  return spawn;
}

/* ---------- party deco: cake, balloons, scattered flower doodles ---------- */
function initPartyDeco(){
  const markup = `
    <svg class="deco-balloon deco-balloon-1" viewBox="0 0 40 70" width="34" height="60" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="24" rx="18" ry="22" fill="var(--dusty)" stroke="var(--maroon)" stroke-width="1"/>
      <polygon points="17,46 23,46 20,52" fill="var(--dusty)"/>
      <path d="M20 52 C 14 58, 26 62, 20 68" stroke="var(--ink-soft)" stroke-width="1" fill="none"/>
    </svg>
    <svg class="deco-balloon deco-balloon-2" viewBox="0 0 40 70" width="30" height="52" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="24" rx="18" ry="22" fill="var(--blush)" stroke="var(--maroon)" stroke-width="1"/>
      <polygon points="17,46 23,46 20,52" fill="var(--blush)"/>
      <path d="M20 52 C 26 58, 14 62, 20 68" stroke="var(--ink-soft)" stroke-width="1" fill="none"/>
    </svg>
    <svg class="deco-balloon deco-balloon-3" viewBox="0 0 40 70" width="26" height="46" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="24" rx="18" ry="22" fill="var(--gold)" stroke="var(--maroon)" stroke-width="1" opacity=".9"/>
      <polygon points="17,46 23,46 20,52" fill="var(--gold)" opacity=".9"/>
      <path d="M20 52 C 14 58, 26 62, 20 68" stroke="var(--ink-soft)" stroke-width="1" fill="none"/>
    </svg>
    <svg class="deco-cake" viewBox="0 0 100 90" width="86" height="78" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="10" x2="30" y2="24" stroke="var(--rose)" stroke-width="2"/>
      <line x1="50" y1="5" x2="50" y2="24" stroke="var(--rose)" stroke-width="2"/>
      <line x1="70" y1="10" x2="70" y2="24" stroke="var(--rose)" stroke-width="2"/>
      <path d="M28 10c0-3 2-5 2-7 0 2 2 4 2 7-1 2-3 2-4 0z" fill="var(--gold)"/>
      <path d="M48 5c0-3 2-5 2-7 0 2 2 4 2 7-1 2-3 2-4 0z" fill="var(--gold)"/>
      <path d="M68 10c0-3 2-5 2-7 0 2 2 4 2 7-1 2-3 2-4 0z" fill="var(--gold)"/>
      <rect x="22" y="24" width="56" height="20" rx="2" fill="var(--blush)" stroke="var(--maroon)" stroke-width="1.4"/>
      <path d="M22 31 Q30 27 38 31 T54 31 T70 31 T78 31" stroke="var(--maroon)" stroke-width="1.1" fill="none"/>
      <rect x="10" y="44" width="80" height="28" rx="2" fill="var(--paper)" stroke="var(--maroon)" stroke-width="1.4"/>
      <path d="M10 53 Q20 49 30 53 T50 53 T70 53 T90 53" stroke="var(--maroon)" stroke-width="1.1" fill="none"/>
      <ellipse cx="50" cy="75" rx="46" ry="4" fill="var(--dusty)" opacity=".45"/>
    </svg>
    <svg class="deco-flower deco-flower-1" viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <g fill="var(--rose)" opacity=".85"><circle cx="20" cy="10" r="7"/><circle cx="20" cy="30" r="7"/><circle cx="10" cy="20" r="7"/><circle cx="30" cy="20" r="7"/></g>
      <circle cx="20" cy="20" r="6" fill="var(--gold)"/>
    </svg>
    <svg class="deco-flower deco-flower-2" viewBox="0 0 40 40" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <g fill="var(--dusty)" opacity=".85"><circle cx="20" cy="10" r="7"/><circle cx="20" cy="30" r="7"/><circle cx="10" cy="20" r="7"/><circle cx="30" cy="20" r="7"/></g>
      <circle cx="20" cy="20" r="6" fill="var(--paper)"/>
    </svg>
    <svg class="deco-flower deco-flower-3" viewBox="0 0 40 40" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="var(--gold)" opacity=".8"><circle cx="20" cy="10" r="7"/><circle cx="20" cy="30" r="7"/><circle cx="10" cy="20" r="7"/><circle cx="30" cy="20" r="7"/></g>
      <circle cx="20" cy="20" r="6" fill="var(--maroon)"/>
    </svg>
  `;
  ["landing-deco", "final-deco"].forEach(id => {
    const el = $(id);
    if (el) el.innerHTML = markup;
  });
}

/* burst kelopak saat pembuka & penutup muncul */
function initFlowerBursts(spawnPetal){
  let finalBurst = false;
  const burst = () => { for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 140); };

  document.addEventListener("site-ready", () => setTimeout(burst, 500), { once:true });

  const finalEl = $("final");
  if (finalEl){
    const io = new IntersectionObserver((entries) => {
      if (!finalBurst && entries.some(e => e.isIntersecting)){
        finalBurst = true; burst(); io.disconnect();
      }
    }, { threshold:.3 });
    io.observe(finalEl);
  }
}

/* ---------- parallax halus: satu listener, hanya saat landing terlihat ---------- */
function initParallax(){
  const landing = $("landing");
  if (!landing || REDUCED) return;
  let ticking = false, visible = true;
  const update = () => { landing.style.setProperty("--sy", Math.min(window.scrollY, 600)); ticking = false; };
  const onScroll = () => { if (visible && !ticking){ ticking = true; requestAnimationFrame(update); } };
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(landing);
  window.addEventListener("scroll", onScroll, { passive:true });
}

/* ---------- sticky notes (mouse, sentuh, keyboard) ---------- */
function initNotes(){
  document.querySelectorAll(".sticky-note").forEach(note => {
    const toggle = () => {
      const open = note.classList.toggle("open");
      note.setAttribute("aria-expanded", String(open));
    };
    note.addEventListener("click", toggle);
    note.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); }
    });
  });
}

/* ---------- photo album: tumpukan polaroid, swipe, lightbox ---------- */
let albumIndex = 0;
function initAlbum(){
  const wrap = $("polaroid-wrap");
  const section = $("album");
  const photos = CONFIG.photos || [];
  const total = photos.length;
  const pad = (n) => String(n).padStart(2, "0");
  $("album-total").textContent = pad(total);

  if (!total){                      // album kosong: sembunyikan panggung, tidak ada error
    section.classList.add("is-empty");
    $("album-index").textContent = pad(0);
    $("album-prev").disabled = $("album-next").disabled = true;
    return;
  }

  // sudut istirahat tiap foto: tetap, natural, tidak acak ulang setiap render
  const rest = (i) => (((i * 37) % 7) - 3) * 0.9;
  const cards = photos.map((p, i) => {
    const el = document.createElement("div");
    el.className = "polaroid";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", `${i + 1} / ${total}: ${p.caption}`);
    const img = document.createElement("img");
    img.src = p.src; img.alt = p.caption; img.draggable = false;
    if (i > 0) img.loading = "lazy";
    img.addEventListener("error", () => el.classList.add("img-failed"));
    const cap = document.createElement("p");
    cap.className = "polaroid-caption";
    cap.textContent = p.caption;
    el.append(img, cap);
    wrap.appendChild(el);
    return el;
  });

  function layout(){
    cards.forEach((el, i) => {
      const off = (i - albumIndex + total) % total;
      const r = rest(i);
      const slots = [
        { x: 0,  y: 0,  r: r,       s: 1 },
        { x: 9,  y: 7,  r: r + 4,   s: .965 },
        { x: -9, y: 12, r: r - 5,   s: .93 }
      ];
      const s = slots[Math.min(off, 2)];
      el.style.setProperty("--x", s.x + "px");
      el.style.setProperty("--y", s.y + "px");
      el.style.setProperty("--r", s.r + "deg");
      el.style.setProperty("--s", s.s);
      el.style.zIndex = total - off;
      el.classList.toggle("is-top", off === 0);
      el.classList.toggle("is-back", off !== 0);
      el.classList.toggle("is-far", off > 2);
      el.tabIndex = off === 0 ? 0 : -1;
      el.setAttribute("aria-hidden", off === 0 ? "false" : "true");
    });
    $("album-index").textContent = pad(albumIndex + 1);
  }

  let lastGo = 0;
  function go(dir, fromUser = true){
    if (total < 2) return;
    const now = performance.now();
    if (now - lastGo < 260) return;           // tombol ditekan beruntun: abaikan, tidak macet
    lastGo = now;
    const out = cards[albumIndex];
    const from = REDUCED ? null : getComputedStyle(out).transform;
    albumIndex = (albumIndex + dir + total) % total;
    layout();
    if (!REDUCED){
      // kartu yang lepas meluncur ke samping dulu, lalu turun ke tumpukan belakang
      const sx = dir > 0 ? -1 : 1;
      const keepOnTop = total + 1;
      out.style.zIndex = keepOnTop;
      out.animate([
        { transform: from },
        { transform: `translate3d(${sx * 62}%,-4%,0) rotate(${sx * 11}deg)`, offset: .45 }
      ], { duration: 420, easing: "cubic-bezier(.22,.61,.36,1)" });
      setTimeout(() => { if (+out.style.zIndex === keepOnTop) layout(); }, 230);
    }
    if (fromUser) cineFlash(true);
  }

  $("album-prev").addEventListener("click", () => go(-1));
  $("album-next").addEventListener("click", () => go(1));
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("is-top")){
      e.preventDefault(); openLightbox(photos[albumIndex]);
    }
  });

  // ----- swipe / drag / tap (pointer events: sentuh & mouse) -----
  let drag = null;
  wrap.addEventListener("pointerdown", (e) => {
    const top = e.target.closest(".polaroid.is-top");
    if (!top || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, t0: performance.now(), el: top, moved: false };
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved){
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8){ drag = null; return; } // gesture scroll vertikal
      if (Math.abs(dx) < 8) return;
      drag.moved = true;
      drag.el.classList.add("dragging");
      try { wrap.setPointerCapture(e.pointerId); } catch(_){}
    }
    drag.dx = dx;
    drag.el.style.setProperty("--x", dx + "px");
    drag.el.style.setProperty("--r", (rest(albumIndex) + dx / 14) + "deg");
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    d.el.classList.remove("dragging");
    if (d.moved){
      if (Math.abs(d.dx) > 56) go(d.dx < 0 ? 1 : -1);
      else layout();
    } else if (e.type === "pointerup" && performance.now() - d.t0 < 450){
      openLightbox(photos[albumIndex]);      // sentuhan singkat = perbesar foto
    }
  };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", (e) => { endDrag(e); layout(); });

  layout();

  // ----- foto "diletakkan" satu per satu saat album pertama kali terlihat -----
  if (!REDUCED){
    wrap.classList.add("pending");
    const io = new IntersectionObserver((entries) => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      wrap.classList.remove("pending");
      [...cards].reverse().forEach((el, k) => {
        el.style.animationDelay = (k * 220) + "ms";
        el.classList.add("drop");
        el.addEventListener("animationend", () => { el.classList.remove("drop"); el.style.animationDelay = ""; }, { once:true });
      });
    }, { threshold:.3 });
    io.observe(section);
  }
}

/* ---------- lightbox ---------- */
let lightboxReturnFocus = null;
function initLightbox(){
  const box = $("lightbox");
  box.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
}
function openLightbox(photo){
  if (!photo) return;
  const box = $("lightbox");
  lightboxReturnFocus = document.activeElement;
  $("lightbox-img").src = photo.src;
  $("lightbox-img").alt = photo.caption;
  $("lightbox-caption").textContent = photo.caption;
  box.classList.add("active");
  box.setAttribute("aria-hidden", "false");
  cineFlash(true);
}
function closeLightbox(){
  const box = $("lightbox");
  if (!box.classList.contains("active")) return;
  box.classList.remove("active");
  box.setAttribute("aria-hidden", "true");
  if (lightboxReturnFocus && lightboxReturnFocus.focus) lightboxReturnFocus.focus({ preventScroll:true });
}

/* ---------- video memory (film-frame play button) ---------- */
function initVideoFrame(){
  const video = $("memory-video");
  const btn = $("video-play-btn");
  if (!video || !btn) return;
  const stage = btn.closest(".film-stage");
  const frame = stage.closest(".film-frame");
  const setPlaying = (on) => { stage.classList.toggle("is-playing", on); frame.classList.toggle("is-playing", on); };

  // sesuaikan tinggi frame dengan rasio asli video (landscape, portrait, apapun)
  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight){
      stage.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  });

  btn.addEventListener("click", () => {
    video.controls = true;
    setPlaying(true);
    video.play().catch(() => { setPlaying(false); });
  });
  video.addEventListener("play", () => setPlaying(true));
  video.addEventListener("pause", () => { if (video.currentTime === 0 || video.ended) setPlaying(false); });
  video.addEventListener("ended", () => setPlaying(false));

  // musik website diam selama video jalan, nyala lagi setelah video berhenti
  // (hanya kalau musiknya memang sedang menyala sebelum video dipencet)
  const bgAudio = $("bg-audio");
  let bgWasPlaying = false;
  video.addEventListener("play", () => {
    if (bgAudio && !bgAudio.paused){ bgWasPlaying = true; bgAudio.pause(); }
  });
  const resumeBgAudio = () => {
    if (bgWasPlaying && bgAudio) bgAudio.play().catch(() => {});
    bgWasPlaying = false;
  };
  video.addEventListener("pause", resumeBgAudio);
  video.addEventListener("ended", resumeBgAudio);
}

/* ---------- secret message ---------- */
function initSecret(){
  const input = $("secret-input");
  const btn = $("secret-btn");
  const error = $("secret-error");
  const unlockBox = $("secret-unlock");
  const section = $("secret");
  const box = input.closest(".secret-box");
  $("secret-message").textContent = CONFIG.secretMessage;

  // keyboard virtual HP: pastikan kolom tetap terlihat
  input.addEventListener("focus", () => {
    setTimeout(() => input.scrollIntoView({ block:"center", behavior: REDUCED ? "auto" : "smooth" }), 320);
  });

  function tryUnlock(){
    const val = input.value.trim().toLowerCase();
    if (val === CONFIG.secretPassword.toLowerCase()){
      error.textContent = "";
      input.disabled = true;
      btn.disabled = true;
      input.blur();
      section.classList.add("unlocked");
      cineFlash(true);
      setTimeout(() => unlockBox.classList.add("open"), REDUCED ? 0 : 450);
    } else {
      error.textContent = "coba lagi...";
      box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
    }
  }
  btn.addEventListener("click", tryUnlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
}

/* ---------- envelope / letter ---------- */
function initEnvelope(){
  const envelope = $("envelope");
  const letter = $("letter-paper");
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    envelope.classList.add("open");
    envelope.setAttribute("aria-expanded", "true");
    setTimeout(() => letter.classList.add("open"), REDUCED ? 0 : 650);
  };
  envelope.addEventListener("click", open);
  envelope.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
  });
}

/* ---------- music player ---------- */
function initMusicPlayer(){
  const player = $("music-player");
  const toggle = $("music-toggle");
  const icon = $("music-icon");
  const audio = $("bg-audio");
  const fill = $("music-progress-fill");

  player.addEventListener("mouseenter", () => player.classList.add("expanded"));
  player.addEventListener("mouseleave", () => { if (audio.paused) player.classList.remove("expanded"); });

  toggle.addEventListener("click", () => {
    player.classList.add("expanded");
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  // ikon & label selalu mengikuti keadaan audio yang sebenarnya
  audio.addEventListener("play", () => {
    icon.innerHTML = "&#10073;&#10073;"; player.classList.add("playing"); toggle.setAttribute("aria-label", "pause music");
  });
  audio.addEventListener("pause", () => {
    icon.innerHTML = "&#9658;"; player.classList.remove("playing"); toggle.setAttribute("aria-label", "play music");
  });
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
  });

  // dipakai intro overlay: lagu kedua mulai setelah klik tombol masuk
  return {
    audio,
    start(){
      player.classList.add("expanded");
      return audio.play().catch(() => {});
    }
  };
}

/* ---------- restart ---------- */
function initRestart(){
  $("restart-btn").addEventListener("click", () => {
    cineFlash(true);
    window.scrollTo({ top:0, behavior: REDUCED ? "auto" : "smooth" });
  });
}


/* ============================================
   INTRO OVERLAY
   kue + api bergerak + suara + ucapan  ->  (tunggu 10 detik)  ->  tombol
   ->  balon terbang  ->  masuk website, lagu 1 berhenti, lagu 2 mulai
   ============================================ */

// Happy Birthday (domain publik) — dimainkan lewat WebAudio kalau assets/music/birthday.mp3 belum ada
const BDAY_MELODY = [
  [392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],
  [392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],
  [392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,2],
  [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]
];

function balloonSVG(color, w){
  return `<svg viewBox="0 0 40 70" width="${w}" height="${Math.round(w * 1.75)}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="24" rx="18" ry="22" fill="${color}" stroke="rgba(59,44,46,.35)" stroke-width="1"/>
    <ellipse cx="13" cy="15" rx="4" ry="6" fill="#fff" opacity=".3"/>
    <polygon points="17,46 23,46 20,52" fill="${color}"/>
    <path d="M20 52 C14 58,26 62,20 68" stroke="rgba(246,221,226,.8)" stroke-width="1" fill="none"/>
  </svg>`;
}

function fadeVolume(audio, from, to, ms, done){
  const t0 = performance.now();
  (function step(now){
    const k = Math.min(1, (now - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step); else if (done) done();
  })(t0);
}

// iOS Safari mengabaikan audio.volume -> tidak bisa crossfade, jadi pindah lagu langsung
function volumeSettable(){
  const a = new Audio(); a.volume = .5; return a.volume === .5;
}

function initIntro(music){
  const intro = document.getElementById("intro");
  const finish = () => {
    const b = document.body;
    b.classList.remove("intro-active");
    b.classList.add("site-ready");
    if (b.classList.contains("rec-start")){   // bilah letterbox terbuka: "kamera mulai merekam"
      b.classList.remove("rec-start");
      b.classList.add("rec-end");
      setTimeout(() => b.classList.remove("rec-end"), 2300);
    }
    document.dispatchEvent(new Event("site-ready"));
  };
  if (!intro){ finish(); return; }

  const audio = document.getElementById("intro-audio");
  const wait = document.getElementById("intro-wait");
  const waitFill = document.getElementById("intro-wait-fill");
  const enterBtn = document.getElementById("intro-enter");
  const balloonBox = document.getElementById("intro-balloons");
  const canFade = volumeSettable();
  const cfg = CONFIG.intro;

  let soundStarted = false, entered = false, synth = null, voiceAudio = null;

  // ----- candles + flames (5 lilin, tiap api punya ritme kedip sendiri) -----
  document.getElementById("intro-candles").innerHTML = [75, 92.5, 110, 127.5, 145].map((x, i) => `
    <rect x="${x - 2.5}" y="46" width="5" height="22" rx="1" fill="${i % 2 ? "var(--gold)" : "var(--rose)"}"/>
    <line x1="${x}" y1="46" x2="${x}" y2="42" stroke="var(--dusty)" stroke-width="1"/>
    <g transform="translate(${x},42)">
      <circle class="flame-glow" cy="-9" r="16" fill="url(#flameGlow)" style="--d:${(i * .17).toFixed(2)}s"/>
      <g class="flame" style="--d:${(i * .13).toFixed(2)}s">
        <path d="M0 0C-5-6-4-13 0-20C4-13 5-6 0 0Z" fill="#F2B24C"/>
        <path d="M0-1C-2-4-1.5-8 0-12C1.5-8 2-4 0-1Z" fill="#FFF3CC"/>
      </g>
    </g>`).join("");

  // ----- tombol muncul -----
  const revealButton = () => intro.classList.add("ready");
  setTimeout(revealButton, 20000); // jaga-jaga kalau suara tidak pernah dinyalakan

  // ----- ucapan: rekaman suara sendiri kalau ada, kalau tidak pakai speech synthesis -----
  function greet(){
    setTimeout(() => {
      if (entered) return;
      if (cfg.voice){
        voiceAudio = new Audio(cfg.voice);
        voiceAudio.play().catch(() => speak());
      } else speak();
    }, 700);
  }
  function speak(){
    if (!("speechSynthesis" in window)) return;
    try{
      const u = new SpeechSynthesisUtterance(cfg.speech.replace("{name}", CONFIG.name));
      u.lang = "id-ID"; u.rate = .92; u.pitch = 1.1;
      const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("id"));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch(e){}
  }

  // dipanggil sekali begitu suara benar-benar menyala: mulai hitung 10 detik
  function onSoundStart(){
    if (soundStarted) return;
    soundStarted = true;
    intro.classList.add("sound-on");
    greet();
    waitFill.style.transitionDuration = cfg.waitSeconds + "s";
    wait.classList.add("running");
    setTimeout(revealButton, cfg.waitSeconds * 1000);
  }

  // ----- melodi cadangan (WebAudio) kalau birthday.mp3 belum ada -----
  function startSynth(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC){ onSoundStart(); return; }
    const ctx = new AC();
    ctx.resume().then(() => {
      if (ctx.state !== "running"){ ctx.close(); armGesture(); return; }
      const beat = .52;
      const master = ctx.createGain(); master.gain.value = .16; master.connect(ctx.destination);
      const total = BDAY_MELODY.reduce((s, n) => s + n[1], 0) * beat + 1.2;
      let loop;
      (function schedule(){
        let t = ctx.currentTime + .05;
        BDAY_MELODY.forEach(([f, d]) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "triangle"; o.frequency.value = f;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(1, t + .03);
          g.gain.exponentialRampToValueAtTime(.001, t + d * beat * .95);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(t + d * beat);
          t += d * beat;
        });
        loop = setTimeout(schedule, total * 1000);
      })();
      synth = { stop(){
        clearTimeout(loop);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => ctx.close().catch(() => {}), 1700);
      }};
      onSoundStart();
    }).catch(() => armGesture());
  }

  // ----- lagu pertama: coba autoplay, kalau diblokir tunggu sentuhan pertama -----
  function armGesture(){
    // pointerup/click (bukan pointerdown): di layar sentuh, itu yang dihitung browser sebagai "aksi user" untuk audio
    const events = ["pointerup", "click", "touchend"];
    const go = () => {
      events.forEach(e => intro.removeEventListener(e, go));
      startSong1();
    };
    events.forEach(e => intro.addEventListener(e, go));
  }
  function startSong1(){
    if (soundStarted || entered) return;
    if (canFade) audio.volume = .6;
    const p = audio.play();
    if (!p || !p.then){ onSoundStart(); return; }
    p.then(onSoundStart).catch(err => {
      if (err && err.name === "NotAllowedError") armGesture();
      else startSynth(); // file mp3 tidak ditemukan
    });
  }
  startSong1();

  // ----- klik "lihat website": balon terbang -> lagu 1 mati, lagu 2 mulai -> masuk -----
  function releaseBalloons(){
    const colors = ["#E3AFB9", "#F6DDE2", "#C9A876", "#C2798A", "#FFFCF8", "#E3AFB9"];
    const n = window.innerWidth < 640 ? 12 : 18;
    for (let i = 0; i < n; i++){
      const w = 34 + Math.random() * 34;
      const el = document.createElement("div");
      el.className = "fly-balloon";
      el.style.left = (Math.random() * 92) + "%";
      el.innerHTML = balloonSVG(colors[i % colors.length], Math.round(w));
      balloonBox.appendChild(el);
      const dist = window.innerHeight + 300;
      const sway = (Math.random() - .5) * 90;
      el.animate([
        { transform:"translate(0,0) rotate(-4deg)" },
        { transform:`translate(${sway}px,${-dist * .5}px) rotate(5deg)`, offset:.5 },
        { transform:`translate(${-sway * .6}px,${-dist}px) rotate(-3deg)` }
      ], { duration: 2800 + Math.random() * 1400, delay: Math.random() * 700, easing:"cubic-bezier(.3,.1,.35,1)", fill:"forwards" });
    }
  }

  function switchSongs(){
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (voiceAudio) voiceAudio.pause();
    if (synth) synth.stop();

    const song2 = music.audio;
    if (canFade){
      song2.volume = 0;
      music.start();
      fadeVolume(song2, 0, 1, 2200);
      fadeVolume(audio, audio.volume, 0, 2200, () => audio.pause());
    } else {
      audio.pause();
      music.start();
    }
  }

  function enter(){
    if (entered) return;
    entered = true;
    intro.classList.add("going");
    document.body.classList.add("rec-start");
    setTimeout(() => cineFlash(false), 1000);   // kilatan film tepat sebelum adegan pertama
    releaseBalloons();
    switchSongs();
    setTimeout(() => intro.classList.add("leaving"), 1800);
    setTimeout(() => { audio.pause(); intro.remove(); finish(); }, 2800);
    setTimeout(() => balloonBox.remove(), 5600);
  }
  enterBtn.addEventListener("click", enter);
}


/* ---------- release gate: realtime countdown + owner/admin bypass ---------- */
function initReleaseGate(onUnlocked){
  const gate = document.getElementById("release-gate");
  const days = document.getElementById("cd-days");
  const hours = document.getElementById("cd-hours");
  const minutes = document.getElementById("cd-minutes");
  const seconds = document.getElementById("cd-seconds");
  const adminToggle = document.getElementById("admin-toggle");
  const adminForm = document.getElementById("admin-form");
  const adminPassword = document.getElementById("admin-password");
  const adminError = document.getElementById("admin-error");
  const releaseNote = document.getElementById("release-note");
  const target = new Date(CONFIG.releaseAt).getTime();
  let timer = null;
  let unlocked = false;

  function unlock(mode){
    if (unlocked) return;
    unlocked = true;
    if (timer) clearInterval(timer);
    gate.classList.add("release-gone");
    document.body.classList.remove("release-locked");
    setTimeout(() => { gate.remove(); }, 850);
    onUnlocked(mode);
  }

  function render(){
    const diff = target - Date.now();
    if (diff <= 0){
      days.textContent = hours.textContent = minutes.textContent = seconds.textContent = "00";
      releaseNote.textContent = "sudah waktunya. selamat datang ✦";
      unlock("scheduled");
      return;
    }
    const total = Math.floor(diff / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    days.textContent = String(d).padStart(2,"0");
    hours.textContent = String(h).padStart(2,"0");
    minutes.textContent = String(m).padStart(2,"0");
    seconds.textContent = String(s).padStart(2,"0");
  }

  adminToggle.addEventListener("click", () => {
    adminForm.hidden = !adminForm.hidden;
    adminError.textContent = "";
    if (!adminForm.hidden) setTimeout(() => adminPassword.focus(), 50);
  });

  adminForm.addEventListener("submit", e => {
    e.preventDefault();
    if (adminPassword.value.trim() === CONFIG.adminPassword){
      adminError.textContent = "";
      unlock("admin");
    } else {
      adminError.textContent = "password salah.";
      adminPassword.select();
    }
  });

  document.body.classList.add("release-locked");
  render();
  if (!unlocked) timer = setInterval(render, 500);
}

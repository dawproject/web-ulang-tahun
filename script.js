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
  adminPassword: "samsung", // ganti password admin di sini
  secretPassword: "loveyoualways", // password rahasia, huruf kecil semua dibandingkan otomatis
  secretMessage: "[RAHASIA] tulis pesan rahasia kamu di sini, ini akan muncul setelah password benar.",
  diaryText: "hei. sebelum kamu lanjut ke bawah, aku cuma mau bilang — semua ini aku buat sendiri, baca pelan-pelan, khusus untuk kamu. aku buat ini dan mempersiapkan semuanya dari awal aku mengenalmu selama kurang lebih 6 bulan ini aku mempersiapkan semuanya...",
  song: {
    title: "Beautiful",
    artist: "Bazzi",
    src: "assets/music/mix.mp3",
    cover: "assets/music/cover.jpg"
  },
  photos: [
    { src: "assets/images/1.png", caption: "first date woilah jir..." },
    { src: "assets/images/2.jpeg", caption: "entah kenapa foto ini selalu bikin aku senyum." },
    { src: "assets/images/foto-03.jpg", caption: "one of my favorite memories." }
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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-name]").forEach(el => el.textContent = CONFIG.name);
  document.querySelector("[data-song-title]").textContent = CONFIG.song.title;
  document.querySelector("[data-song-artist]").textContent = CONFIG.song.artist;
  document.querySelector("[data-diary-date]").textContent = CONFIG.birthday;
  const cover = document.getElementById("music-cover");
  cover.addEventListener("error", () => { cover.style.display = "none"; }); // cover.jpg belum ada -> tampil lingkaran polos, bukan ikon gambar rusak
  cover.src = CONFIG.song.cover;
  document.getElementById("bg-audio").src = CONFIG.song.src;

  initClock();
  initPageOpen();
  initSectionTransitions();
  initScrollReveal();
  const spawnPetal = initFlowers();
  initPartyDeco();
  initFlowerBursts(spawnPetal);
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

/* ---------- clock (diary meta) ---------- */
function initClock(){
  const el = document.querySelector("[data-diary-time]");
  const fmt = () => new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
  el.textContent = fmt();
  setInterval(() => el.textContent = fmt(), 30000);
}

/* ---------- opening page-turn ---------- */
function initPageOpen(){
  const btn = document.getElementById("open-book-btn");
  const fold = document.querySelector(".page-fold");
  btn.addEventListener("click", () => {
    fold.classList.add("opening");
    document.body.classList.add("book-open");
    setTimeout(() => {
      document.getElementById("diary").scrollIntoView({ behavior:"smooth" });
    }, 500);
  });
}

/* ---------- section-level page transitions ----------
   each <section> already in the markup becomes its own "page":
   it arrives with a soft blur/scale/rise as it enters the viewport.
   no extra HTML, just a class toggle driven by scroll position.     */
function initSectionTransitions(){
  const sections = document.querySelectorAll(".section:not(.landing)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.05 }); // rendah supaya section tinggi di HP tetap muncul
  sections.forEach(s => io.observe(s));
}

/* ---------- scroll reveal (staggered per group) ---------- */
function initScrollReveal(){
  const groups = new Map(); // parent -> [elements] for stagger timing
  document.querySelectorAll(".reveal").forEach(el => {
    const parent = el.closest(".section");
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const siblings = groups.get(entry.target.closest(".section")) || [entry.target];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 90) + "ms";
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold:.25 });

  groups.forEach(list => list.forEach(el => io.observe(el)));
}

/* ---------- typewriter for diary ---------- */
function initTypewriter(){
  const el = document.getElementById("diary-typewriter");
  const text = CONFIG.diaryText;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        typeText(el, text, 28);
        io.disconnect();
      }
    });
  }, { threshold:.5 });
  io.observe(el);
}
function typeText(el, text, speed){
  let i = 0;
  el.textContent = "";
  el.classList.remove("done");
  (function step(){
    if (i < text.length){
      el.textContent += text.charAt(i);
      i++;
      setTimeout(step, speed);
    } else {
      el.classList.add("done");
    }
  })();
}

/* ---------- flower particles (lightweight, capped) ---------- */
function initFlowers(){
  const field = document.getElementById("flower-field");
  // fewer petals on small/low-power screens so scroll & transitions stay smooth
  const MAX_PETALS = window.innerWidth < 640 ? 7 : 14;
  const SPAWN_INTERVAL = window.innerWidth < 640 ? 2600 : 1800;
  let count = 0;

  function spawn(){
    if (count >= MAX_PETALS) return;
    const petal = document.createElement("div");
    petal.className = "petal" + (CONFIG.flowerImages.length ? "" : " fallback");
    if (CONFIG.flowerImages.length){
      const img = CONFIG.flowerImages[Math.floor(Math.random() * CONFIG.flowerImages.length)];
      petal.style.setProperty("--petal-img", `url(${img})`);
    }
    const startX = Math.random() * window.innerWidth;
    const size = 14 + Math.random() * 14;
    const duration = 10 + Math.random() * 8;
    const drift = (Math.random() - 0.5) * 160;
    const rotateEnd = (Math.random() - 0.5) * 360;

    petal.style.left = startX + "px";
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

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    setInterval(spawn, SPAWN_INTERVAL);
    for (let i = 0; i < 4; i++) setTimeout(spawn, i * 500);
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
    const el = document.getElementById(id);
    if (el) el.innerHTML = markup;
  });
}

/* a small extra flurry of falling petals right as the opening and the
   ending come into view — the "bunga bertebaran" moment — without
   turning the whole site into a snow-globe.                          */
function initFlowerBursts(spawnPetal){
  let landingBurst = false, finalBurst = false;

  function burst(){ for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 140); }

  // opening burst: fires when the intro overlay closes (site-ready), not behind it
  document.addEventListener("site-ready", () => {
    setTimeout(() => { if (!landingBurst){ burst(); landingBurst = true; } }, 500);
  }, { once:true });

  const finalEl = document.getElementById("final");
  if (finalEl){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !finalBurst){
          burst();
          finalBurst = true;
          io.disconnect();
        }
      });
    }, { threshold:.3 });
    io.observe(finalEl);
  }
}

/* ---------- sticky notes ---------- */
function initNotes(){
  document.querySelectorAll(".sticky-note").forEach(note => {
    note.addEventListener("click", () => note.classList.toggle("open"));
  });
}

/* ---------- photo album ---------- */
let albumIndex = 0;
function initAlbum(){
  const wrap = document.getElementById("polaroid-wrap");
  const total = CONFIG.photos.length;
  document.getElementById("album-total").textContent = String(total).padStart(2, "0");

  function render(){
    wrap.innerHTML = "";
    const p = CONFIG.photos[albumIndex];
    const div = document.createElement("div");
    div.className = "polaroid";
    div.style.transform = `rotate(${(Math.random()*6-3).toFixed(1)}deg)`;
    div.innerHTML = `<img src="${p.src}" alt="${p.caption}"><p class="polaroid-caption">${p.caption}</p>`;
    div.addEventListener("click", () => openLightbox(p));
    wrap.appendChild(div);
    document.getElementById("album-index").textContent = String(albumIndex + 1).padStart(2, "0");
  }

  document.getElementById("album-prev").addEventListener("click", () => {
    albumIndex = (albumIndex - 1 + total) % total; render();
  });
  document.getElementById("album-next").addEventListener("click", () => {
    albumIndex = (albumIndex + 1) % total; render();
  });

  if (total) render();
}

/* ---------- lightbox ---------- */
function initLightbox(){
  const box = document.getElementById("lightbox");
  box.addEventListener("click", () => box.classList.remove("active"));
}
function openLightbox(photo){
  document.getElementById("lightbox-img").src = photo.src;
  document.getElementById("lightbox-caption").textContent = photo.caption;
  document.getElementById("lightbox").classList.add("active");
}

/* ---------- video memory (film-frame play button) ---------- */
function initVideoFrame(){
  const video = document.getElementById("memory-video");
  const btn = document.getElementById("video-play-btn");
  const stage = btn.closest(".film-stage");
  if (!video || !btn) return;

  // sesuaikan tinggi frame dengan rasio asli video (landscape, portrait, apapun)
  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight){
      stage.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  });

  btn.addEventListener("click", () => {
    video.controls = true;
    stage.classList.add("is-playing");
    video.play().catch(() => {});
  });

  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) stage.classList.remove("is-playing");
  });
  video.addEventListener("ended", () => { stage.classList.remove("is-playing"); });

  // musik website otomatis diam selama video jalan, nyala lagi setelah video berhenti
  // (cuma kalau musiknya emang lagi nyala sebelum video dipencet)
  const bgAudio = document.getElementById("bg-audio");
  let bgWasPlaying = false;

  video.addEventListener("play", () => {
    if (bgAudio && !bgAudio.paused){
      bgWasPlaying = true;
      bgAudio.pause();
    }
  });

  const resumeBgAudio = () => {
    if (bgWasPlaying && bgAudio){
      bgAudio.play().catch(() => {});
    }
    bgWasPlaying = false;
  };
  video.addEventListener("pause", resumeBgAudio);
  video.addEventListener("ended", resumeBgAudio);
}

/* ---------- secret message ---------- */
function initSecret(){
  const input = document.getElementById("secret-input");
  const btn = document.getElementById("secret-btn");
  const error = document.getElementById("secret-error");
  const unlockBox = document.getElementById("secret-unlock");
  document.getElementById("secret-message").textContent = CONFIG.secretMessage;

  function tryUnlock(){
    const val = input.value.trim().toLowerCase();
    if (val === CONFIG.secretPassword.toLowerCase()){
      error.textContent = "";
      unlockBox.classList.add("open");
      input.disabled = true;
      btn.disabled = true;
    } else {
      error.textContent = "coba lagi...";
    }
  }
  btn.addEventListener("click", tryUnlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
}

/* ---------- envelope / letter ---------- */
function initEnvelope(){
  const envelope = document.getElementById("envelope");
  const letter = document.getElementById("letter-paper");
  envelope.addEventListener("click", () => {
    envelope.classList.add("open");
    setTimeout(() => letter.classList.add("open"), 400);
  });
}

/* ---------- music player ---------- */
function initMusicPlayer(){
  const player = document.getElementById("music-player");
  const toggle = document.getElementById("music-toggle");
  const icon = document.getElementById("music-icon");
  const audio = document.getElementById("bg-audio");
  const fill = document.getElementById("music-progress-fill");

  player.addEventListener("mouseenter", () => player.classList.add("expanded"));
  player.addEventListener("mouseleave", () => { if (audio.paused) player.classList.remove("expanded"); });

  // touch devices: tap toggles the expanded state too, since hover doesn't exist
  toggle.addEventListener("touchstart", () => player.classList.toggle("expanded"), { passive:true });

  toggle.addEventListener("click", () => {
    player.classList.add("expanded");
    if (audio.paused){
      audio.play().catch(() => {});
      icon.innerHTML = "&#10073;&#10073;";
    } else {
      audio.pause();
      icon.innerHTML = "&#9658;";
    }
  });

  audio.addEventListener("play", () => { icon.innerHTML = "&#10073;&#10073;"; });
  audio.addEventListener("pause", () => { icon.innerHTML = "&#9658;"; });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration){
      fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
    }
  });

  // dipakai intro overlay: lagu kedua mulai setelah klik "lihat website"
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
  document.getElementById("restart-btn").addEventListener("click", () => {
    window.scrollTo({ top:0, behavior:"smooth" });
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
    document.body.classList.remove("intro-active");
    document.body.classList.add("site-ready");
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
  if (!unlocked) timer = setInterval(render, 250);
}

# 07.11 — website ulang tahun

## Cara pakai
Buka `index.html` langsung di browser (double click). Semua sudah jalan tanpa server.

## Yang perlu kamu ganti

**1. Data utama** — buka `script.js`, edit bagian `CONFIG` di paling atas:
- `secretPassword` — kata/tanggal rahasia untuk section "secret message"
- `secretMessage` — isi pesan rahasianya
- `diaryText` — tulisan di halaman diary awal
- `song` — judul, artis, dan path file musik + cover
- `photos` — array foto + caption (urutan = urutan tampil di album)
- `flowerImages` — kalau kamu punya PNG bunga, isi array ini dengan path-nya (mis. `"assets/flowers/petal-01.png"`), kalau dikosongkan otomatis pakai kelopak CSS sederhana

**2. Teks placeholder di `index.html`** — cari tanda kurung siku, ganti dengan tulisan asli kamu:
- `[CATATAN: ...]` — 5 sticky notes di section "tentang kamu"
- `[ARTIKEL SINGKAT: ...]` — dua kolom di section koran
- `[RAHASIA]` (juga bisa lewat CONFIG)
- `[ISI SURAT PERSONAL DI SINI]` dan `[NAMA_PANGGILAN_PENGIRIM]` — surat
- `[PLAN_01]` — bisa hapus, atau tambah `<li class="plan-item reveal">` baru untuk plan lain

**3. Nama** — otomatis terisi dari `CONFIG.name` (sudah diisi "Lian Safitri", ganti kalau perlu).

## Assets
Taruh file di folder ini:
- `assets/images/foto-01.jpg`, `foto-02.jpg`, dst — foto album (rasio potret lebih pas untuk polaroid)
- `assets/flowers/*.png` — PNG bunga transparan, opsional
- `assets/music/birthday.mp3` — **lagu pertama**, diputar di overlay pembuka (kue). Kalau file belum ada, otomatis dimainkan melodi Happy Birthday bawaan
- `assets/music/song.mp3` + `assets/music/cover.jpg` — **lagu kedua**, mulai otomatis setelah klik "lihat website" (lagu pertama berhenti)
- `assets/music/ucapan.mp3` — opsional, rekaman suaramu mengucapkan selamat ulang tahun; isi path-nya di `CONFIG.intro.voice`

Belum ada foto/musik? Website tetap jalan — foto akan tampil kotak kosong sampai file-nya ditaruh.

## Overlay pembuka
Urutannya: kue + api bergerak + ucapan suara → 10 detik → tombol "lihat website" → balon terbang → masuk website, lagu 1 berhenti & lagu 2 mulai.
Pengaturan ada di `CONFIG.intro` (`script.js`): lagu, rekaman suara, teks ucapan, dan `waitSeconds`.

Catatan: browser (terutama HP) tidak mengizinkan suara otomatis tanpa sentuhan. Jadi kalau suara belum menyala, ada tulisan "ketuk layar untuk menyalakan suara" — hitungan 10 detik baru mulai setelah suara menyala.

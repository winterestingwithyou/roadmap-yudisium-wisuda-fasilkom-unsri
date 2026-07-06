# Contributing

Terima kasih sudah ingin berkontribusi ke Roadmap Yudisium & Wisuda FASILKOM UNSRI.

Project ini memakai Bun. Jangan memakai npm, pnpm, atau yarn untuk install dependency maupun update lockfile.

## Setup Lokal

```bash
bun install
bun run dev
```

## Sebelum Membuat Perubahan

- Baca `docs/AGENTS.md`, `docs/PRD.md`, dan `docs/ROADMAP_DATA.md`.
- Ikuti struktur folder yang sudah ada di `app/`.
- Gunakan TypeScript strict.
- Gunakan Zustand untuk state global.
- Gunakan Dexie/IndexedDB untuk persistence.
- Jangan menambahkan backend.

## Menambahkan atau Mengubah Data Roadmap

Data roadmap ada di:

```txt
app/data/roadmap.ts
```

Saat menambahkan syarat baru:

- gunakan `id` yang singkat dan stabil
- update `RoadmapNodeId` di `app/types/roadmap.ts`
- isi deskripsi dengan bahasa yang mudah dipahami mahasiswa
- set `dependencies` sesuai syarat pendahulu
- cek posisi node untuk layout atas-bawah dan kiri-kanan

## Standar UI

- Prioritaskan UX, readability, dan accessibility.
- Gunakan bahasa yang ramah untuk user awam.
- Hindari istilah teknis seperti "dependency" di tampilan user.
- Pastikan tampilan mobile dan desktop sama-sama enak dipakai.
- Animasi harus singkat dan tidak mengganggu.

## Validasi

Sebelum mengirim perubahan, jalankan:

```bash
bun run typecheck
```

Jika perubahan menyentuh build, dependency, atau konfigurasi, jalankan juga:

```bash
bun run build
```

## Dependency Baru

Jika perlu menambahkan package:

```bash
bun add nama-package
```

Pastikan `bun.lock` ikut ter-update.

## Pull Request

PR sebaiknya menjelaskan:

- apa yang diubah
- alasan perubahan
- cara mengetes perubahan
- screenshot jika perubahan menyentuh UI

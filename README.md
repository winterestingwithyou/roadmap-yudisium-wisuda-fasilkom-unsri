# Roadmap Yudisium & Wisuda FASILKOM UNSRI

Web interaktif untuk membantu mahasiswa FASILKOM UNSRI memahami urutan penyelesaian syarat Yudisium dan Wisuda.

Aplikasi ini menampilkan persyaratan sebagai roadmap bergaya skill tree. Setiap syarat memiliki hubungan prasyarat, sehingga mahasiswa bisa melihat:

- syarat yang sudah selesai
- syarat yang sudah bisa dikerjakan
- syarat yang masih terkunci
- tahapan yang akan datang

Progress disimpan di perangkat pengguna menggunakan IndexedDB, jadi aplikasi tidak membutuhkan login atau backend.

## Fitur Utama

- Roadmap interaktif dengan zoom dan pan
- Tampilan alur atas-bawah atau kiri-kanan
- Status syarat: selesai, bisa dikerjakan, terkunci, dan coming soon
- Sidebar detail pada desktop
- Bottom sheet detail pada mobile
- Search dan filter status
- Progress keseluruhan
- Penyimpanan progress lokal dengan IndexedDB
- Cascade completion untuk menjaga urutan syarat tetap benar

## Tech Stack

- React Router
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Flow
- Zustand
- Dexie
- Framer Motion
- Bun

## Struktur Penting

```txt
app/
  components/       Komponen UI reusable
  data/             Data roadmap
  features/         Fitur aplikasi
  hooks/            Custom hook
  lib/              Helper dan persistence
  store/            Zustand store
  types/            TypeScript types
docs/
  AGENTS.md         Aturan implementasi project
  PRD.md            Product requirements
  ROADMAP_DATA.md   Data awal roadmap
```

## Menjalankan Project

Gunakan Bun sebagai package manager.

```bash
bun install
bun run dev
```

Aplikasi akan berjalan di:

```txt
http://localhost:5173
```

## Script

```bash
bun run dev
```

Menjalankan development server.

```bash
bun run typecheck
```

Menjalankan type generation React Router dan TypeScript check.

```bash
bun run build
```

Membuat production build.

```bash
bun run start
```

Menjalankan hasil build menggunakan server React Router.

## Update Data Roadmap

Data roadmap utama berada di:

```txt
app/data/roadmap.ts
```

Saat menambahkan syarat baru, pastikan:

- setiap `id` unik
- `dependencies` mengarah ke `id` syarat yang valid
- posisi node tetap nyaman dibaca untuk layout atas-bawah dan kiri-kanan
- teks yang tampil ke user memakai bahasa yang mudah dipahami

Jika tipe `RoadmapNodeId` perlu bertambah, update juga:

```txt
app/types/roadmap.ts
```

## Dokumentasi Produk

Dokumen produk dan aturan implementasi ada di folder:

```txt
docs/
```

Baca dokumen tersebut sebelum mengubah perilaku utama aplikasi.

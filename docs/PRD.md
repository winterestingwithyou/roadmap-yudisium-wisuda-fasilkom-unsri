# Roadmap Yudisium & Wisuda FASILKOM UNSRI

## Overview

Project berbentuk web interaktif yang membantu mahasiswa mengetahui urutan penyelesaian syarat Yudisium dan Wisuda berdasarkan dependency antar syarat.

Aplikasi menggunakan tampilan roadmap bergaya skill tree sehingga mahasiswa dapat mengetahui:

- syarat yang sudah selesai
- syarat yang masih terkunci
- syarat berikutnya yang bisa dikerjakan

Progress disimpan secara lokal menggunakan IndexedDB sehingga tidak membutuhkan login.

---

## Goals

- Mempermudah mahasiswa memahami dependency pemberkasan
- Mengurangi kesalahan urutan pengurusan dokumen
- Memberikan visualisasi progress yang mudah dipahami
- Memberikan pengalaman yang lebih menarik melalui gamification

---

## Target User

Mahasiswa FASILKOM UNSRI yang sedang mempersiapkan:

- Yudisium
- Wisuda

---

## Features

### Roadmap

- Node berbentuk roadmap
- Dependency antar node
- Zoom & Pan
- Animasi unlock

### Sidebar

- Informasi syarat
- Deskripsi
- Dependency
- Link
- Estimasi waktu
- Status

### Progress

- Progress keseluruhan
- Persentase penyelesaian
- Jumlah syarat selesai

### Completion

- Tandai selesai
- Tandai belum selesai
- Cascade check
- Cascade uncheck

### Search

- Cari syarat

### Filter

- Completed
- Available
- Locked
- Coming Soon

---

## Data Storage

Menggunakan IndexedDB.

Tidak ada backend.

---

## UI Style

- Gamify
- RPG Skill Tree
- Modern
- Minimal
- Dark First

---

## Tech Stack

- React Router v7
- Tailwind
- Shadcn UI
- React Flow
- Dexie
- Zustand
- Framer Motion

---

## Future Feature

- Planner Mode
- Sinkronisasi Cloud
- Multi Fakultas
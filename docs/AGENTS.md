# AGENTS.md

## Project Context

Project ini merupakan visual roadmap syarat Yudisium dan Wisuda FASILKOM UNSRI.

Konsep utama adalah dependency graph.

Bukan checklist biasa.

---

## UI Rules

- Gunakan React Flow sebagai graph engine.
- Node harus mudah dikenali.
- Dependency digambar menggunakan edge.
- Jangan menggunakan layout tree vertikal biasa.
- Layout menyerupai RPG Skill Tree.

---

## Design Rules

Prioritas:

1. UX
2. Readability
3. Accessibility

Sidebar desktop.

Bottom sheet mobile.

---

## State Rules

Gunakan Zustand.

Gunakan Dexie sebagai persistence.

Jangan menggunakan LocalStorage.

---

## Completion Rules

Node hanya dapat dianggap available apabila seluruh dependency selesai.

Saat user memilih "Tetap Selesaikan",

seluruh dependency otomatis ikut complete.

Saat dependency di-uncheck,

seluruh child node ikut ter-uncheck.

---

## Animation

Gunakan Framer Motion.

Animasi maksimal 300ms.

Hindari animasi yang mengganggu.

---

## Coding Style

- TypeScript strict
- Functional Component
- Custom Hook
- Hindari prop drilling
- Gunakan reusable component

---

## Folder Convention

/components

/features

/lib

/store

/data

/hooks

/types

---

## Don't

- Jangan menggunakan backend
- Jangan menggunakan Redux
- Jangan menggunakan Context API untuk global state

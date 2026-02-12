# Todo Task — React + TypeScript + Vite

A modern **Todo application** built with **React 19**, **TypeScript**, and **Vite**. The project focuses on clean architecture, strict linting, and smooth drag-and-drop interactions using Atlassian’s Pragmatic Drag and Drop.

---

## 🚀 Tech Stack

- ⚛️ **React 19**
- 🧠 **TypeScript**
- ⚡ **Vite**
- 🎯 **ESLint (Flat Config)** with strict rules
- 🎨 **Sass (SCSS)** for styling
- 🧲 **@atlaskit/pragmatic-drag-and-drop** for drag & drop
- 🧩 **React Compiler** (Babel plugin)

---

## 📦 Installation

Install dependencies using one of the following package managers:

```bash
npm install
```

or

```bash
yarn
```

or

```bash
pnpm install
```

---

## ▶️ Available Scripts

### Development

Starts the Vite development server with HMR:

```bash
npm run dev
```

### Production build

Runs TypeScript build and creates an optimized production bundle:

```bash
npm run build
```

### Preview build

Locally preview the production build:

```bash
npm run preview
```

### Linting

Runs ESLint across the entire project:

```bash
npm run lint
```

---

## 🧠 React Compiler

This project uses **`babel-plugin-react-compiler`**, enabling the new React Compiler.

📚 Documentation: https://react.dev/learn/react-compiler

> ⚠️ Note: The React Compiler can impact build and dev performance. Enable it intentionally, especially for larger applications.

---

## 🧹 ESLint Configuration

The project uses **ESLint Flat Config** with a strong focus on code quality and consistency.

### Key characteristics

- TypeScript-aware linting via `typescript-eslint`
- React Hooks rules enabled
- Import order enforcement
- No default exports (`import/no-default-export`)
- Accessibility rules via `eslint-plugin-jsx-a11y`
- Strict formatting and best practices

### Highlights

- `eqeqeq: always`
- No unused variables (TypeScript-aware)
- Enforced import order and grouping
- Warnings for `console.log` and `any`
- Strong preference for modern JavaScript (`no-var`, `prefer-const`)

---

## 🧲 Drag and Drop

Drag-and-drop functionality is implemented using:

- `@atlaskit/pragmatic-drag-and-drop`
- `@atlaskit/pragmatic-drag-and-drop-auto-scroll`
- `@atlaskit/pragmatic-drag-and-drop-hitbox`

These libraries provide a **low-level, performant, and accessible** drag-and-drop solution.

---

## 📁 Project Structure (example)

```
src/
├── assets/
├── components/
│   ├── TodoItem/
│   └── TodoList/
├── styles/
├── App.tsx
├── main.tsx
└── index.scss
```

---

## ✅ Code Style & Conventions

- Named exports only
- One empty line maximum between blocks
- Alphabetized imports
- Consistent spacing rules
- Accessibility-first JSX

---

## 📄 License

MIT

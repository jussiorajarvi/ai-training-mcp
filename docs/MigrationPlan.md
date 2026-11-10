# Dependency Migration Plan

Status: draft · Date: 2026-11-10

This plan brings the React Petstore's dependencies up to their current major versions. It is ordered so that each phase can be merged on its own, with the app working and the test suites passing at the end of every phase.

> **Note on sources.** This plan was written from the project's code, `npm outdated`, and general knowledge of these libraries. It was **not** checked against each library's current release notes. Before each phase, read that library's official migration guide or changelog, particularly for the recent majors (TypeScript 7, ESLint 10, `eslint-plugin-react-hooks` 7, `lucide-react` 1.x, Supabase 2.x).

---

## 1. Current state

### 1.1 Health check (before migration)

| Command | Result | Cause |
|---|---|---|
| `npm run dev` / `build` | ✅ Works | — |
| `npm run test:e2e` | ✅ 18/18 pass | Fixed earlier (dedicated port, localStorage key bug) |
| `npm run test:unit` | ❌ 17/17 fail | `renderHook` doesn't exist in `@testing-library/react` 12; it was added in 13.1, which needs React 18 |
| `npm run lint` | ❌ Crashes | `eslint.config.js` imports `typescript-eslint`, which isn't installed |
| `npm run typecheck` | ❌ 78 errors | TypeScript 4.9 doesn't support `moduleResolution: "bundler"` or `allowImportingTsExtensions` (TS ≥ 5.0) |
| Browser console | ⚠️ Warnings | `findDOMNode is deprecated in StrictMode` (react-bootstrap 1.x transitions), legacy lifecycle warnings |

### 1.2 Version gap

| Package | Current | Latest | Gap | Risk |
|---|---|---|---|---|
| react, react-dom | 17.0.2 | 19.3.1 | 2 majors | **High** |
| @types/react, @types/react-dom | 17.x | 19.3.0 | 2 majors | High |
| bootstrap | 4.6.2 | 5.3.8 | 1 major | Medium (code already written for BS5) |
| react-bootstrap | 1.6.8 | 2.10.10 | 1 major | Medium |
| @supabase/supabase-js | 1.35.4 | 2.119.0 | 1 major | **High** (auth API rewrite) |
| lucide-react | 0.344.0 | 1.71.0 | 0.x → 1.x | Low–Medium (icon renames) |
| typescript | 4.9.5 | 7.0.2 | 3 majors | Medium |
| eslint | 8.54.0 | 10.14.0 | 2 majors | Medium |
| @eslint/js | 8.50.0 | 10.0.1 | 2 majors | Low |
| @typescript-eslint/* | 6.11.0 | 8.72.2 | 2 majors | Low (replace with `typescript-eslint`) |
| eslint-plugin-react-hooks | 4.6.0 | 7.1.1 | 3 majors | Medium (new rules) |
| eslint-plugin-react-refresh | 0.4.5 | 0.5.7 | minor (0.x) | Low |
| globals | 13.24.0 | 17.14.0 | 4 majors | Low |
| @testing-library/react | 12.1.5 | 16.3.3 | 4 majors | Medium (tied to React) |
| @testing-library/jest-dom | 5.16.5 | 7.0.1 | 2 majors | Low |
| @testing-library/user-event | 14.5.1 | 14.6.9 | minor | Low |
| jsdom | 22.1.0 | 31.0.0 | 9 majors | Low |
| tailwindcss | 3.3.6 | 4.3.5 | 1 major | **Remove** (unused) |
| autoprefixer, postcss | 10.4.16, 8.5.28 | 10.6.2, 8.5.32 | patch | **Remove** (unused) |
| vite | 8.3.1 | 8.3.7 | patch | Low |
| @vitejs/plugin-react | 6.1.1 | 6.3.0 | minor | Low |
| vitest, @vitest/coverage-v8 | 5.0.2 | 5.1.0 | minor | Low |
| @playwright/test | 1.64.1 | 1.65.0 | minor | Low |

### 1.3 Code hotspots

| Area | Files | Issue |
|---|---|---|
| Legacy root API | `src/main.tsx` | `ReactDOM.render`, removed in React 19 |
| Class components with legacy lifecycles | `PetCard.tsx` (`componentWillMount`, `componentWillReceiveProps`), `PetCategoryFilter.tsx`, `AuthForm.tsx` (`componentWillReceiveProps`), `PetList.tsx` | Deprecated; unprefixed names are not supported going forward |
| Supabase auth | `AuthForm.tsx`, `services/supabaseClient.ts` | Calls `auth.signup` / `auth.login` / `auth.logout`, which don't exist in v1 or v2; reads `process.env.REACT_APP_*`, which Vite doesn't expose |
| Bootstrap 5 markup on Bootstrap 4 | ~40 uses (`fs-*`, `fw-*`, `g-*`, `bg-*`, `<Badge bg=…>`) | Styling is partly broken today; fixed by the BS5 upgrade |
| Unit tests | `test/*.test.ts(x)`, `test/setup.ts` | Need `renderHook` (RTL ≥ 13.1) and the Vitest entry of jest-dom |

---

## 2. Target versions

| Package | Target |
|---|---|
| react / react-dom / @types/* | 19.x |
| bootstrap / react-bootstrap | 5.3.x / 2.10.x |
| @supabase/supabase-js | 2.x |
| lucide-react | 1.x |
| typescript | 5.9 first, then 7.x (see Phase 2) |
| eslint / @eslint/js | 10.x |
| typescript-eslint | 8.x (replaces `@typescript-eslint/parser` + `eslint-plugin`) |
| eslint-plugin-react-hooks | 7.x |
| @testing-library/react | 16.x, plus `@testing-library/dom` (now a peer dependency) |
| @testing-library/jest-dom | 7.x |
| jsdom | 31.x |
| tailwindcss, postcss, autoprefixer | removed |
| everything else | latest patch/minor |

Node: the machine runs Node 26, which satisfies every target. Add `"engines": { "node": ">=22" }` (or whatever CI uses) to `package.json`.

---

## 3. Phases

Each phase is one PR. **Exit criteria for every phase:** `npm run build`, `npm run test:e2e` and every check that worked before the phase still work, plus the checks that phase is meant to fix.

### Phase 0: Safety net (no upgrades)

1. Create the `deps/migration` branch; commit the e2e fixes already in the working tree.
2. Note the baseline: e2e green, take screenshots of the home, cart and checkout pages for visual comparison later.
3. Add the e2e run to CI if it isn't there already.

### Phase 1: Low-risk bumps and cleanup

```bash
npm i -D @playwright/test@latest vite@latest @vitejs/plugin-react@latest \
  vitest@latest @vitest/coverage-v8@latest @testing-library/user-event@latest
npm uninstall tailwindcss postcss autoprefixer
```

- Tailwind has no config file, no `@tailwind` directives and no utility classes that aren't also Bootstrap classes. Removing it changes nothing in the output; confirm by diffing the built CSS.
- If `@playwright/test` changes, run `npx playwright install` again.

### Phase 2: Restore type checking and linting

**TypeScript.** Go to **5.9 first**. That's enough for `moduleResolution: "bundler"` and `allowImportingTsExtensions`, and it removes the config errors. Then fix the remaining type errors (mostly class components typed without generics for state, and `import React from 'react'` defaults: add `"allowSyntheticDefaultImports": true` / `"esModuleInterop": true`, or switch to named imports).

Then evaluate **TypeScript 7** (the native compiler) as a separate step. Changes to expect:
- Options deprecated in 6.0 are removed in 7.0 (e.g. old `moduleResolution` values, `baseUrl`-only path mapping, ES5 targets). The current tsconfig uses none of them.
- Check that `typescript-eslint` and Vite/Vitest tooling support the TS 7 version you pick. If they lag behind, stay on 5.9/6.x for linting and use TS 7 only for `tsc --noEmit`.

**ESLint 10 stack.**

```bash
npm uninstall @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i -D eslint@latest @eslint/js@latest typescript-eslint@latest \
  eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest globals@latest
```

- `eslint.config.js` already uses flat config and `tseslint.config(...)`, which matches `typescript-eslint` 8; installing the package fixes the crash. ESLint 10 no longer supports `.eslintrc`, which this repo doesn't use.
- `eslint-plugin-react-hooks` 7 ships new recommended rules (React Compiler–related, e.g. purity and ref checks). Use the plugin's flat preset instead of spreading `configs.recommended.rules`, and expect new warnings in the class components, which Phase 4 removes anyway. Set the new rules to `warn` until then.
- Update `ecmaVersion` to `'latest'`.

### Phase 3: Bootstrap 5 + react-bootstrap 2 (on React 17)

react-bootstrap 2 supports React 16.14+, so this phase can be done before the React upgrade, which keeps the two large changes apart.

```bash
npm i bootstrap@5 react-bootstrap@2
```

- The markup already uses BS5 utilities (`fs-6`, `fw-semibold`, `g-4`, `<Badge bg="primary">`), so this upgrade mostly **fixes** styling. Compare against the Phase 0 screenshots.
- Search for BS4-only leftovers and replace them: `ml-/mr-/pl-/pr-` → `ms-/me-/ps-/pe-`, `text-left/right` → `text-start/end`, `float-left/right` → `float-start/end`, `badge-*` → `bg-*`, `form-group` → `mb-3`, `btn-block` → `d-grid`, `sr-only` → `visually-hidden`, `no-gutters` → `g-0`.
- react-bootstrap 2: `Badge variant` → `bg`, `Form.Row` → `Row`, `Form.File` → `Form.Control type="file"`, `Media` removed. Check `Modal`, `ListGroup`, `ButtonGroup`, `Navbar` props in the files listed in §1.3.
- Expected side effect: the `findDOMNode` warnings from `Transition` go away.
- The `--bs-body-bg` override in `src/index.css` becomes meaningful on BS5; check the page background.

### Phase 4: React 17 → 18 → 19

Do it in two steps, with tests green after each.

**Step 4a: refactor to function components (on React 17).** Convert `PetCard`, `PetList`, `PetCategoryFilter` and `AuthForm` to function components with hooks:
- `componentWillMount` → initial `useState` value
- `componentWillReceiveProps` → derive state from props during render, or `useEffect` keyed on the prop
- `componentDidMount` / `componentDidUpdate` → `useEffect`

The e2e tests cover these components and lock in their behaviour.

**Step 4b: React 18.**

```bash
npm i react@18 react-dom@18
npm i -D @types/react@18 @types/react-dom@18 \
  @testing-library/react@16 @testing-library/dom@latest \
  @testing-library/jest-dom@latest jsdom@latest
```

- `src/main.tsx`: `ReactDOM.render(...)` → `createRoot(document.getElementById('root')!).render(...)` from `react-dom/client`.
- Automatic batching: state updates in timeouts and promises are now batched. Check the cart and auth flows.
- StrictMode mounts, unmounts and remounts effects in development; effects need correct cleanup.
- Tests: `renderHook` now comes from `@testing-library/react`, which **fixes the 17 failing unit tests**. In `test/setup.ts`, replace `import '@testing-library/jest-dom'` with `import '@testing-library/jest-dom/vitest'`. RTL 16 needs `@testing-library/dom` installed explicitly.

**Step 4c: React 19.**

```bash
npm i react@19 react-dom@19
npm i -D @types/react@19 @types/react-dom@19
```

- Removed APIs: `ReactDOM.render`/`hydrate`, `unmountComponentAtNode`, `findDOMNode`, string refs, legacy context, `propTypes` and `defaultProps` on function components. Step 4a should already have removed every use; search to confirm.
- Types: `useRef` needs an argument; the global `JSX` namespace moves to `React.JSX`; ref callbacks must not return values implicitly. The official `types-react-codemod` handles most of this.
- Optional follow-ups (not required): `ref` as a prop instead of `forwardRef`, `<Context>` as provider, `useActionState` for the auth form.

### Phase 5: Supabase 1 → 2

```bash
npm i @supabase/supabase-js@2
```

- **Environment variables:** Vite doesn't define `process.env`. Use `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, declare them in `src/vite-env.d.ts`, and add an `.env.example`. Don't commit real keys.
- **Auth API** (`AuthForm.tsx`):

  | Current (broken) | v2 |
  |---|---|
  | `auth.signup({ email, password })` | `auth.signUp({ email, password })` |
  | `auth.login({ email, password })` | `auth.signInWithPassword({ email, password })` |
  | `auth.logout()` | `auth.signOut()` |
  | `const { user, error } = …` | `const { data: { user, session }, error } = …` |
  | `auth.user()` / `auth.session()` | `await auth.getUser()` / `await auth.getSession()` |
  | `onAuthStateChange` returns the listener directly | returns `{ data: { subscription } }`, call `subscription.unsubscribe()` |

- Queries: v2 no longer returns a `body`; use `data`. `.single()`/`.maybeSingle()` behaviour has changed. There are no queries today, but keep this in mind for new code.
- No test covers auth. Add a unit test that mocks `createClient` before changing this code.

### Phase 6: lucide-react 0.x → 1.x

```bash
npm i lucide-react@latest
```

- Icons used: `ShoppingCart`, `ShoppingBag`, `PawPrint`, `Trash2`, `Plus`, `Minus`, `Check`, `CheckCircle`.
- `CheckCircle` was renamed `CircleCheck` (the old name was kept as an alias). If 1.x drops the alias, rename it in `CheckoutPage.tsx`. `npm run typecheck` will catch any other missing names.
- Remove the `optimizeDeps.exclude: ['lucide-react']` workaround in `vite.config.ts` if it's no longer needed (measure dev startup time with and without it).

---

## 4. Order and effort

| Phase | Depends on | Estimate | Risk |
|---|---|---|---|
| 0. Safety net | — | 0.5 h | — |
| 1. Low-risk bumps + remove Tailwind | 0 | 0.5 h | Low |
| 2. TypeScript + ESLint | 1 | 2–4 h | Medium |
| 3. Bootstrap 5 / RB 2 | 1 | 2–3 h | Medium |
| 4a. Function components | 2 | 3–4 h | Medium |
| 4b. React 18 + testing libs | 4a | 1–2 h | Medium |
| 4c. React 19 | 4b | 1–2 h | Medium |
| 5. Supabase 2 | 2 | 2–3 h | High (no tests yet) |
| 6. lucide-react 1.x | 2 | 0.5 h | Low |

Phases 3, 5 and 6 can be done in parallel once Phase 2 is merged.

## 5. Rollback

- One PR per phase; revert the PR to roll back. `package-lock.json` is committed in every PR, so a revert restores exact versions.
- Don't combine Phase 3 and Phase 4 in one PR. When styling and rendering change together, it's hard to tell which one caused a regression.

## 6. Definition of done

- [ ] `npm run lint`, `typecheck`, `test:unit`, `test:e2e`, `build` all pass locally and in CI
- [ ] No React deprecation warnings in the browser console
- [ ] `npm outdated` shows no major gaps, or each remaining gap is explained in this file
- [ ] Visual check of home, category filter, cart sidebar and checkout against the Phase 0 screenshots
- [ ] Supabase credentials come from `VITE_*` env vars, with `.env.example` documented in the README

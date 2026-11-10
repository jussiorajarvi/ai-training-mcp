# Dependency Migration Plan (verified with Context7)

Status: draft · Date: 2026-11-10

This plan upgrades the React Petstore's dependencies to their current major versions. Each phase is a separate PR, and the app builds and the test suites pass after every phase.

It replaces [MigrationPlan.md](./MigrationPlan.md), which was written without checking each library's docs. Every breaking change listed below was checked against the library's own documentation through **Context7** (sources in §7). Where the docs were not conclusive, the step is marked **⚠ unverified**.

---

## 1. Current state

### 1.1 Health check

| Command | Result | Cause |
|---|---|---|
| `npm run dev` / `build` | ✅ Works | — |
| `npm run test:e2e` | ✅ Passes | Uses the dedicated port 5199 (uncommitted fix in `playwright.config.ts`) |
| `npm run test:unit` | ❌ Fails | `renderHook` isn't exported by `@testing-library/react` 12. RTL 13+ requires React 18 (RTL README) |
| `npm run lint` | ❌ Crashes | `eslint.config.js` imports `typescript-eslint`, which isn't installed |
| `npm run typecheck` | ❌ Errors | TS 4.9 doesn't recognise `moduleResolution: "bundler"` / `allowImportingTsExtensions` (TS ≥ 5.0) |
| Browser console | ⚠️ Warnings | `findDOMNode` (react-bootstrap 1 transitions), unsafe legacy lifecycles |

### 1.2 Version gap

| Package | Current | Target | Risk |
|---|---|---|---|
| react, react-dom, @types/react(-dom) | 17.x | 19.x | **High** |
| bootstrap | 4.6.2 | 5.3.x | Medium (markup is already written for BS5) |
| react-bootstrap | 1.6.8 | 2.10.x | Medium |
| @supabase/supabase-js | 1.35.4 | 2.x | **High** (auth API) |
| lucide-react | 0.344.0 | 1.x | Low |
| typescript | 4.9.5 | 5.9 → 6.x → 7.x | Medium |
| eslint, @eslint/js | 8.x | 10.x | Medium |
| @typescript-eslint/parser + eslint-plugin | 6.11.0 | `typescript-eslint` 8.x | Low |
| eslint-plugin-react-hooks | 4.6.0 | 7.x | Medium (new compiler rules) |
| eslint-plugin-react-refresh, globals | old | latest | Low |
| @testing-library/react | 12.1.5 | 16.x + `@testing-library/dom` | Medium (requires React 18+) |
| @testing-library/jest-dom | 5.16.5 | latest | Low |
| jsdom | 22.1.0 | latest | Low |
| tailwindcss, postcss, autoprefixer | 3.3.6 / 8.5 / 10.4 | **remove** (unused: no config, no directives) | Low |
| vite, @vitejs/plugin-react, vitest, @vitest/coverage-v8, @playwright/test, user-event | current major | latest minor/patch | Low |

Check the exact "latest" numbers with `npm outdated` when you start. Context7 lists docs up to React 19.3.1, supabase-js 2.118, react-bootstrap 2.10.10, lucide 1.49, ESLint 10.5, typescript-eslint 8.72 and TypeScript 7.0.2.

### 1.3 Code hotspots

| Area | Location | Issue |
|---|---|---|
| Legacy root API | `src/main.tsx` | `ReactDOM.render`, which React 19 removed |
| Class components | `PetCard.tsx` (`componentWillMount`, `componentWillReceiveProps`), `PetCategoryFilter.tsx` (`componentWillReceiveProps`), `AuthForm.tsx` (`componentWillReceiveProps`), `PetList.tsx` (`componentDidMount/Update`) | Unsafe lifecycles; convert to hooks |
| Supabase | `services/supabaseClient.ts`, `AuthForm.tsx` | Calls `auth.signup` / `auth.login` / `auth.logout`, which don't exist; reads `process.env.REACT_APP_*`, which Vite doesn't expose |
| Bootstrap | `Header.tsx`, `PetCard.tsx`, `CartSidebar.tsx`, `HomePage.tsx` | Already use the BS5 / RB2 API (`<Badge bg=…>`, `fs-6`, `g-4`), so styling is partly broken on BS4 |
| Unit tests | `test/setup.ts`, `test/*.test.ts(x)` | Imports `@testing-library/jest-dom` (Jest entry); needs `renderHook` from RTL 13.1+ |

---

## 2. Phases

**Exit criteria for every phase:** `npm run build` and `npm run test:e2e` pass, plus every check that already worked before the phase and the checks that phase is meant to fix.

### Phase 0: Safety net

1. Create a `deps/migration` branch. Commit the current e2e fixes (`playwright.config.ts`, `useLocalStorage.ts`).
2. Record the baseline: e2e green, plus screenshots of home, category filter, cart and checkout for visual comparison.
3. Add `"engines": { "node": ">=22" }` (the local machine runs Node 26).

### Phase 1: Low-risk bumps and cleanup

```bash
npm i -D @playwright/test@latest vite@latest @vitejs/plugin-react@latest \
  vitest@latest @vitest/coverage-v8@latest @testing-library/user-event@latest
npm uninstall tailwindcss postcss autoprefixer
npx playwright install
```

Diff the built CSS before and after removing Tailwind. Nothing should change.

### Phase 2: Restore type checking and linting

**TypeScript: go to 5.9, then 6.x, then 7.x.**

- 5.9 supports the existing `moduleResolution: "bundler"` and `allowImportingTsExtensions`. Fix the remaining type errors after that.
- TS 6.0 deprecates options that **stop working in TS 7.0**: `moduleResolution: node10/classic`, `baseUrl`, `target: ES5`, `module: AMD/System` (TS 7.0.2 test baselines, errors TS5101/TS5107). This repo's tsconfigs use none of them, so the 6 → 7 step should be clean. `"ignoreDeprecations": "6.0"` only silences the deprecations in 6.x; it doesn't help with 7.
- ✅ Context7 (typescript-eslint docs): typescript-eslint only supports TypeScript versions inside its `peerDependencies.typescript` range and prints a warning outside it. **Before moving to TS 7, check that range**: `npm view typescript-eslint peerDependencies`. If TS 7 isn't covered yet, keep 5.9/6.x for linting and use TS 7 only for `tsc --noEmit`.

**ESLint 10 stack.**

```bash
npm uninstall @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i -D eslint@latest @eslint/js@latest typescript-eslint@latest \
  eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest globals@latest
```

- ✅ ESLint 10 always looks up `eslint.config.*` from each linted file's directory upwards. The `v10_config_lookup_from_file` flag was removed. This repo has one root config, so nothing changes. Remove the flag from any scripts that set it.
- ✅ `tseslint.config(...)` is **deprecated** in typescript-eslint 8 in favour of ESLint core's `defineConfig(...)` (from `eslint/config`, ESLint ≥ 9.22). Migrate `eslint.config.js`:

  ```js
  import { defineConfig } from 'eslint/config';
  import js from '@eslint/js';
  import globals from 'globals';
  import tseslint from 'typescript-eslint';
  import reactHooks from 'eslint-plugin-react-hooks';
  import reactRefresh from 'eslint-plugin-react-refresh';

  export default defineConfig(
    { ignores: ['dist', 'test-results', 'playwright-report'] },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
      languageOptions: { ecmaVersion: 'latest', globals: globals.browser },
      plugins: { 'react-refresh': reactRefresh },
      rules: { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] },
    },
  );
  ```

  Note: `defineConfig` *intersects* `files` from `extends` instead of overriding it (documented edge case). With the config above this doesn't matter.
  ⚠ unverified: the exact export name of the react-hooks flat preset (`configs.flat.recommended` vs `configs['recommended-latest']`). Check the plugin README for the installed version.
- ✅ `eslint-plugin-react-hooks` 7's `recommended` preset now includes the React Compiler rules (`purity`, `refs`, `immutability`, `set-state-in-effect`, `set-state-in-render`, `static-components`, `globals`, `error-boundaries`, …) as well as `rules-of-hooks` and `exhaustive-deps`. React's docs say these violations can be fixed gradually. Set the compiler rules to `warn` until Phase 4a has removed the class components.

### Phase 3: Bootstrap 5 + react-bootstrap 2 (still on React 17)

✅ react-bootstrap 2 requires **React ≥ 16.14** (new JSX transform), so it can go in before the React upgrade. This keeps the styling changes and the rendering changes in separate PRs.

```bash
npm i bootstrap@5 react-bootstrap@2
```

From the react-bootstrap v2 migration guide, the changes that matter here:

| v1 | v2 | Affects this repo? |
|---|---|---|
| `<Badge variant=…>` | `<Badge bg=…>` | Already uses `bg`, so v2 **fixes** the badges |
| `Form.Row` | `Row` | No |
| `Form inline`, `bsPrefix` on Form | removed | No |
| `SplitButton menuAlign` | `align` | No |

- Search for BS4-only classes and update them: `ml-/mr-/pl-/pr-` → `ms-/me-/ps-/pe-`, `text-left/right` → `text-start/end`, `float-left/right` → `float-start/end`, `form-group` → `mb-3`, `sr-only` → `visually-hidden`, `no-gutters` → `g-0`.
- The `findDOMNode` warnings from `Transition` should go away.
- Compare against the Phase 0 screenshots. The `--bs-body-bg` override in `src/index.css` takes effect from BS5 on.

### Phase 4: React 17 → 18 → 19

**4a: Convert to function components (on React 17).** Convert `PetCard`, `PetList`, `PetCategoryFilter` and `AuthForm`:
- `componentWillMount` → initial value for `useState`
- `componentWillReceiveProps` → derive the value during render (or a `key` reset)
- `componentDidMount/Update` → `useEffect`

The e2e suite locks in the current behaviour while you do this.

**4b: React 18 + testing libraries.**

```bash
npm i react@18 react-dom@18
npm i -D @types/react@18 @types/react-dom@18 \
  @testing-library/react@latest @testing-library/dom@latest \
  @testing-library/jest-dom@latest jsdom@latest
```

- `src/main.tsx`: replace `ReactDOM.render` with `createRoot(document.getElementById('root')!).render(...)` from `react-dom/client`.
- ✅ RTL 16 lists `@testing-library/dom` as a **peer dependency**, so install it explicitly. RTL 13+ requires React 18. With this, `renderHook` comes from `@testing-library/react` and the failing unit tests pass again.
- ✅ jest-dom with Vitest: in `test/setup.ts`, replace `import '@testing-library/jest-dom'` with `import '@testing-library/jest-dom/vitest'`, which registers the matchers on Vitest's `expect`. If the test files are type-checked, add `"types": ["vitest/globals", "@testing-library/jest-dom"]` and include the setup file in the tsconfig.
- StrictMode runs an extra setup/cleanup cycle for effects in development, so effects need correct cleanup functions. Automatic batching now applies inside promises and timeouts; check the cart and auth flows.

**4c: React 19.**

```bash
npm i react@19 react-dom@19
npm i -D @types/react@19 @types/react-dom@19
```

✅ APIs removed in React 19 (react.dev "Removed APIs"):
- `react-dom`: `render` (use `createRoot`), `hydrate` (use `hydrateRoot`), `unmountComponentAtNode` (use `root.unmount()`), `findDOMNode`, `renderToNodeStream`, `renderToStaticNodeStream`
- `react`: `createFactory`, class `contextTypes` / `childContextTypes` / `getChildContext` (legacy context), `static propTypes`, `this.refs` (string refs)

Run `grep -rnE "findDOMNode|ReactDOM\.render|propTypes|contextTypes|this\.refs" src` and expect no matches after 4a/4b.

- ✅ Ref callbacks can now return a cleanup function. As a result, arrow-function refs that implicitly return a value (`ref={n => (this.x = n)}`) are rejected by `@types/react@19` (⚠ the typing detail is not from the fetched docs); use braces. There are none in `src` today.
- ⚠ unverified (Context7 had no hits for these): other `@types/react@19` changes such as `useRef()` needing an argument and `JSX` → `React.JSX`. Run `npx types-react-codemod@latest preset-19 ./src` and then `npm run typecheck`.
- Optional follow-ups: pass `ref` as a prop instead of using `forwardRef`, use `<Context>` directly as the provider, and `useActionState` for `AuthForm`.

### Phase 5: Supabase 1 → 2

Prerequisite: add a unit test for `AuthForm` that mocks `createClient`. Auth currently has no test coverage.

```bash
npm i @supabase/supabase-js@2
```

**Client and env** (`services/supabaseClient.ts`):

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, // the Supabase README now calls this the "publishable key"
);
```

Type both variables in `src/vite-env.d.ts` (`interface ImportMetaEnv`), add `.env.example`, and keep real values out of git.

**Auth API** (`AuthForm.tsx`). Signatures checked against `GoTrueClient.ts` / `types.ts` in supabase-js:

| Current code | v2 | Return shape |
|---|---|---|
| `auth.signup({ email, password })` | `auth.signUp({ email, password })` | `{ data: { user, session }, error }`. `session` is `null` while email confirmation is pending |
| `auth.login({ email, password })` | `auth.signInWithPassword({ email, password })` | `{ data: { user, session, weakPassword? }, error }` |
| `auth.logout()` | `auth.signOut()` (default `scope: 'global'`; also `'local'` / `'others'`) | `{ error }` only, no `data` |
| `const { user, error } = …` | `const { data: { user }, error } = …` | When `error` is set, `data` fields are `null` |
| `auth.user()` / `auth.session()` | `await auth.getUser()` / `await auth.getSession()` | `getUser()` checks with the server; `getSession()` reads storage |
| `onAuthStateChange(cb)` | `const { data: { subscription } } = auth.onAuthStateChange(cb)`; call `subscription.unsubscribe()` in effect cleanup | Events: `INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`, `PASSWORD_RECOVERY` |

The recommended browser pattern is to subscribe to `onAuthStateChange` once (e.g. in a `useEffect` in `App`/context) and get the logged-in user from it, instead of setting it by hand after each call.

### Phase 6: lucide-react 0.x → 1.x

```bash
npm i lucide-react@latest
```

✅ Lucide v1 changes (from the "Version 1" guide):
- **Brand icons removed.** The icons used here (`ShoppingCart`, `ShoppingBag`, `PawPrint`, `Trash2`, `Plus`, `Minus`, `Check`, `CheckCircle`) aren't brand icons.
- **`aria-hidden` is now set by default.** Icon-only buttons (e.g. `Trash2`, `Plus`, `Minus` in `CartSidebar.tsx`) need an `aria-label` on the *button*. Update any e2e selectors that relied on the icons being accessible.
- The UMD build was removed (ESM/CJS only), which has no effect with Vite. The package is much smaller, so test whether the `optimizeDeps.exclude: ['lucide-react']` workaround in `vite.config.ts` can be removed.
- Icons can have aliases (`House` / `HouseIcon` / `LucideHouse`). `CheckCircle` is the old name for `CircleCheck`; switch to `CircleCheck` in `CheckoutPage.tsx`. ⚠ unverified whether the old alias still exists in 1.x; `npm run typecheck` will tell you.

---

## 3. Order and effort

| Phase | Depends on | Estimate | Risk |
|---|---|---|---|
| 0. Safety net | — | 0.5 h | — |
| 1. Low-risk bumps, remove Tailwind | 0 | 0.5 h | Low |
| 2. TypeScript + ESLint 10 | 1 | 2–4 h | Medium |
| 3. Bootstrap 5 / RB 2 | 1 | 2–3 h | Medium |
| 4a. Function components | 2 | 3–4 h | Medium |
| 4b. React 18 + RTL 16 | 4a | 1–2 h | Medium |
| 4c. React 19 | 4b | 1–2 h | Medium |
| 5. Supabase 2 | 2 (better after 4a) | 2–3 h | High |
| 6. lucide-react 1.x | 2 | 0.5 h | Low |

Phases 3, 5 and 6 can run in parallel once Phase 2 is merged. Don't put Phase 3 and Phase 4 in the same PR.

## 4. Rollback

One PR per phase, each with its `package-lock.json`. Reverting the PR restores the exact previous versions.

## 5. Definition of done

- [ ] `lint`, `typecheck`, `test:unit`, `test:e2e`, `build` all pass locally and in CI
- [ ] No React deprecation warnings in the browser console
- [ ] `npm outdated` shows no major gaps, or each remaining gap is explained here
- [ ] Visual check against the Phase 0 screenshots
- [ ] Supabase config comes from `VITE_*` env vars, documented in `.env.example` / README
- [ ] Every **⚠ unverified** item above has been checked and its marker removed

## 6. Differences from the original plan

| Topic | MigrationPlan.md | This plan (after Context7) |
|---|---|---|
| ESLint config helper | Keep `tseslint.config(...)` | `tseslint.config` is deprecated; use `defineConfig` from `eslint/config` |
| react-hooks v7 | "New rules, e.g. purity and refs" | Full list of compiler rules now in `recommended`; React docs say they can be fixed gradually |
| ESLint 10 | "Drops `.eslintrc`" | The documented breaking change that matters is file-based config lookup becoming the default (no impact here) |
| TS 7 | General caution | Specific removed options (TS5101/TS5107) confirmed; none are used here |
| lucide 1.x | Focus on icon renames | Main impacts are `aria-hidden` by default (a11y/e2e) and brand-icon removal; renames are minor |
| Supabase key | "anon key" | The client README now uses "publishable key" |
| signOut | `signOut()` | Default `scope: 'global'`; returns only `{ error }` |

## 7. Sources (Context7 library IDs)

| Library | Context7 ID | Used for |
|---|---|---|
| React docs | `/reactjs/react.dev` | Removed APIs in 19, ref cleanup, react-hooks lint rules |
| react-bootstrap | `/react-bootstrap/react-bootstrap/v2.10.10` | `migrating.mdx` v1 → v2 |
| supabase-js | `/supabase/supabase-js` | `GoTrueClient.ts`, `types.ts`, README |
| React Testing Library | `/testing-library/react-testing-library/v16.3.3` | Install / peer deps |
| jest-dom | `/testing-library/jest-dom` | Vitest entry point |
| Lucide | `/lucide-icons/lucide/1.0.2`, `/lucide-icons/lucide/1.49.0` | Version 1 guide, aliased names |
| ESLint | `/eslint/eslint/v10.5.0` | `migrate-to-10.0.0.md` |
| typescript-eslint | `/typescript-eslint/typescript-eslint/v8.72.1` | `defineConfig` migration, TS support range |
| TypeScript | `/microsoft/typescript/v7.0.2` | Options removed in 7.0 |

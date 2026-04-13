# Contributing to Kakera

Thank you for your interest in contributing!

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain, 1.77+)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+ — `npm install -g pnpm`
- Linux: `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

## Setup

```bash
# Clone the repository
git clone https://github.com/ClementBobin/Kakera.git
cd Kakera

# Install JS dependencies
pnpm install

# Start the development server (Tauri + Vite)
pnpm tauri dev
```

## Running tests

```bash
# Unit & component tests
pnpm test

# With coverage
pnpm test --coverage

# End-to-end tests (requires running app)
pnpm test:e2e
```

## Branch naming

| Branch type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feat/<description>` | `feat/library-filter` |
| Bug fix | `fix/<description>` | `fix/sync-rate-limit` |
| Chore / maintenance | `chore/<description>` | `chore/update-deps` |

## Pull Request checklist

- [ ] `pnpm lint` passes with no warnings
- [ ] `pnpm test --run` passes
- [ ] Commits follow the [Conventional Commits](../.github/COMMIT_CONVENTION.md) convention
- [ ] New public APIs are documented
- [ ] If adding a Tauri command, it is registered in `src-tauri/src/lib.rs`

## Adding a new Tauri command

1. Create (or edit) a file in `src-tauri/src/commands/`.
2. Annotate the function with `#[tauri::command]`.
3. Register it in the `invoke_handler!` macro in `src-tauri/src/lib.rs`.
4. Call it from the frontend with `invoke('command_name', { arg })`.

Example:

```rust
// src-tauri/src/commands/library.rs
#[tauri::command]
pub async fn my_new_command(param: String) -> Result<String, String> {
    Ok(format!("Hello, {}!", param))
}
```

```rust
// src-tauri/src/lib.rs — add to invoke_handler
commands::library::my_new_command,
```

```ts
// Frontend
import { invoke } from '@tauri-apps/api/core'
const result = await invoke<string>('my_new_command', { param: 'world' })
```

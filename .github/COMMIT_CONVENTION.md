# Commit Convention

Kakera follows [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <short description>
```

## Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Maintenance tasks |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semi-colons, etc) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding missing tests or correcting existing tests |
| `perf` | A code change that improves performance |
| `ci` | Changes to CI configuration |

## Scopes

| Scope | Description |
|-------|-------------|
| `library` | Anime library feature |
| `player` | Video player integration |
| `sync` | Tracking service sync |
| `settings` | App settings |
| `calendar` | Release calendar |
| `ui` | UI components |
| `backend` | Rust/Tauri backend |
| `deps` | Dependency updates |

## Examples

```
feat(library): add filter by download status
fix(sync): handle anilist rate limit error
test(library): add unit tests for sort utilities
ci: add windows build job to release workflow
docs(api): document anilist graphql client
chore(deps): bump vite to 5.2.10
refactor(ui): extract card component from library view
```

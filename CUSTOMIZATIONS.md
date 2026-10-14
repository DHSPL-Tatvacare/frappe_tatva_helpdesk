# What we changed in Frappe Helpdesk

This fork is [`frappe/helpdesk`](https://github.com/frappe/helpdesk) plus the changes listed here. If a
file is not in these tables, it is exactly as upstream has it.

## Baseline

| | |
|---|---|
| Upstream tag | `v1.30.1` |
| Upstream commit | `1c3361cc0019deec6f84035a9352270b4e4eb5cb` |
| Taken on | 2026-10-09, from the release tarball, with no upstream history |
| Last upstream patch taken | none yet |

When an upstream fix or upgrade comes in, update the last row, or the first two after a full upgrade.

## Branches

`develop` is where work happens. `uat` and `prod` move forward from it, never the other way. Deploys
install the app from the `prod` branch through `apps.json` in `frappe_tatva_connect`.

## Upstream files we changed

| File | Change | Why |
|---|---|---|
| `README.md` | Replaced with TatvaCare's README | This repo is TatvaCare Helpdesk |
| `desk/src/composables/contact.ts` | New contact: email is optional, checked only when typed, and an invite is sent only with one | Many patients have no email; a required one made agents type placeholders like `user@gmail.com` |
| `desk/src/components/contact/NewContactDialog.vue` | "Invite as User" is greyed out until an email is typed | An invite goes by email, so without one there is nothing to send |

## Upstream files we removed

| File | Why |
|---|---|
| `.github/workflows/generate-pot-file.yml` | Builds upstream's translation file; we do not run their translations |
| `.github/workflows/on_release.yml` | Upstream's release automation |
| `.github/workflows/release.yml` | Upstream's release notes |
| `.mergify.yml` | Upstream's merge bot |
| `crowdin.yml` | Upstream's translation service |
| `.releaserc` | Upstream's release versioning |
| `.github/workflows/build.yml` | Publishes upstream's own image; ours is built from `frappe_tatva_connect`'s `Containerfile` |
| `.github/workflows/lint.yml` | Runs only on pull requests; we use none |
| `.github/workflows/server-tests.yml` | Runs only on pull requests; we use none |
| `.github/helpers/install.sh`, `.github/helpers/site_config_mariadb.json` | Used only by `server-tests.yml` |
| `.github/helpers/update_pot_file.sh` | Used only by the removed `generate-pot-file.yml` |

`.github/helpers/.flake8_strict` stays: `.pre-commit-config.yaml` reads it.

## Our files

| File | What it is |
|---|---|
| `CLAUDE.md` | The rules for working in this repo |
| `CUSTOMIZATIONS.md` | This list |
| `GUIDELINES.md` | How to change, take an upstream fix and release |
| `.github/assets/tatva-logo.png` | The logo the README shows |

New code goes in `desk/src/tatva/` and is listed here when it is added.

Upstream's `.gitignore` lists `CLAUDE.md`, so ours is tracked with `git add -f CLAUDE.md`. The ignore line
stays as upstream has it.

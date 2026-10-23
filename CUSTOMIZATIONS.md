# What we changed in Frappe Helpdesk

This fork is [`frappe/helpdesk`](https://github.com/frappe/helpdesk) plus the changes listed here. If a
file is not in these tables, it is exactly as upstream has it.

## Baseline

| | |
|---|---|
| Upstream tag | `v1.31.0` |
| Upstream commit | `7d7e394e7571fbdbdda04a65a279566b0ac9ce7f` |
| Taken on | 2026-10-09 at `v1.30.1` from the release tarball, with no upstream history; upgraded 2026-10-15 by the `v1.30.1..v1.31.0` diff, upstream CI left out |
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
| `desk/src/components/contact/NewContactDialog.vue` (2) | When the phone or email already belongs to a contact, the dialog says so and offers Cancel or Open Contact, with a switch to add the typed details | Agents were taken to an existing contact under a "Contact created" toast |
| `desk/src/composables/contact.ts` (2) | Create asks the server first (`ask_if_exists`), and edit no longer requires an email | One person stays one contact, and a patient without an email can be edited |
| `desk/src/components/contact/EditContactDialog.vue` | The Email label carries no required star | Email is optional on edit, as on create |
| `desk/src/composables/useApps.ts` | The app switcher's "Desk" opens `/desk`, not `/desk/helpdesk` | On Frappe v16.52 `/desk/helpdesk` is a generated sidebar holding only Home |
| `desk/src/components/ticket-agent/TicketContact.vue` | The header reads "via" the ticket's own Source, and nothing when it has none | Upstream knows only Portal or Email, so a phone ticket read "via Email" |
| `desk/src/pages/ticket/MobileTicketAgent.vue` | The mobile Source row shows the ticket's own Source, blank when it has none | Same: upstream printed Portal or Mail for every ticket |
| `desk/src/components/layouts/Sidebar.vue` | The menu's Docs opens our handbook from `tatva/docsMenu.ts`, and Support is gone | Upstream pointed at Frappe's public docs and Telegram chat |
| `desk/src/components/layouts/MobileSidebar.vue` | Same Docs item and no Support, from the same `tatva/docsMenu.ts` | Mobile and desktop show one menu |
| `desk/src/components/ticket-agent/TicketHeader.vue` | The open ticket's Field Dependency scripts (sent apart by the server) run on load, apart from its other form scripts (`tatva/fieldDependencies.ts`) | Upstream applied Field Dependencies only on the new-ticket page |
| `desk/src/components/ticket-agent/TicketDetailsTab.vue` | Side-panel fields are narrowed by their dependency; a saved field runs its scripts and clears a field they no longer allow | Same |
| `desk/src/pages/ticket/MobileTicketAgent.vue` | The Details tab shows the desktop panel (Overview, More Details, feedback, similar tickets) under its own contact, SLA and Source; form scripts get the same dependency context | Upstream's mobile list dropped Priority, Type, Customer and Tags, so they could not be seen or changed on a phone |
| `desk/src/components/ticket-agent/TicketDetailsTab.vue` (2) | A `hideHeader` prop leaves out the contact and SLA header | Mobile already shows both above the panel |
| `desk/src/components/TicketField.vue` | A Link field passes its `filters` to the picker | Lets a dependency narrow the picker on both panels |
| `desk/src/components/modals/ShortcutsModal.vue` | Next/Previous ticket print `Shift .` / `Shift ,` instead of `Shift >` / `Shift <` | `>` and `<` read as arrow keys; the CRM's shortcuts list prints the same keys the same way |

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
| `.github/workflows/assets.yml`, `.github/workflows/ui-tests.yml` (added upstream in `v1.31.0`) | Upstream's CI; not taken |

`.github/helpers/.flake8_strict` stays: `.pre-commit-config.yaml` reads it.

## Our files

| File | What it is |
|---|---|
| `CLAUDE.md` | The rules for working in this repo |
| `CUSTOMIZATIONS.md` | This list |
| `GUIDELINES.md` | How to change, take an upstream fix and release |
| `.github/assets/tatva-logo.png` | The logo the README shows |
| `desk/src/tatva/docsMenu.ts` | The Docs menu item: the wiki space Tatva Platform Settings names for `helpdesk`, hidden when none |
| `desk/src/tatva/fieldDependencies.ts` | Field Dependencies on an open ticket: the scripts' `applyFilters`, the load and save runs, and the narrowed field; names no field |

New code goes in `desk/src/tatva/` and is listed here when it is added.

Upstream's `.gitignore` lists `CLAUDE.md`, so ours is tracked with `git add -f CLAUDE.md`. The ignore line
stays as upstream has it.

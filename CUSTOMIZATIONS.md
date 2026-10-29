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

When an upstream release comes in, update the baseline rows.

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
| `desk/src/socket.ts` | `// TATVA:` no longer opens a socket when imported (`export const socket = initSocket()` removed; nothing imported it) | `main.js` imports `initSocket` from this file, so the import alone opened a second socket beside the one `main.js` opens, unused and reconnecting for ever. Prod (frappe-ui 1.0.0-beta.24, which also opens one by default) showed three per tab in a HAR on 2026-10-25; frappe-ui 1.0.0-rc.1 on `develop` opens none, so this leaves one |
| `desk/src/components/contact/EditContactDialog.vue` | The Email label carries no required star | Email is optional on edit, as on create |
| `desk/src/composables/useApps.ts` | The app switcher's "Desk" opens `/desk`, not `/desk/helpdesk` | On Frappe v16.52 `/desk/helpdesk` is a generated sidebar holding only Home |
| `desk/src/components/ticket-agent/TicketContact.vue` | The header reads "via" the ticket's own Source, and nothing when it has none | Upstream knows only Portal or Email, so a phone ticket read "via Email" |
| `desk/src/pages/ticket/MobileTicketAgent.vue` | The mobile Source row shows the ticket's own Source, blank when it has none | Same: upstream printed Portal or Mail for every ticket |
| `desk/src/components/layouts/Sidebar.vue` | The menu's Docs opens our handbook from `tatva/docsMenu.ts`, and Support is gone | Upstream pointed at Frappe's public docs and Telegram chat |
| `desk/src/components/layouts/MobileSidebar.vue` | Same Docs item and no Support, from the same `tatva/docsMenu.ts` | Mobile and desktop show one menu |
| `desk/src/components/ticket-agent/TicketHeader.vue` | The open ticket's Field Dependency scripts (sent apart by the server) run on load, apart from its other form scripts (`tatva/fieldDependencies.ts`) | Upstream applied Field Dependencies only on the new-ticket page |
| `desk/src/components/ticket-agent/TicketDetailsTab.vue` | Side-panel fields are narrowed by their dependency; a saved field runs its scripts and clears a field they no longer allow | Same |
| `desk/src/pages/ticket/MobileTicketAgent.vue` | The Details tab shows the desktop panel (Overview, More Details, feedback, similar tickets) under its own contact, SLA and Source; form scripts get the same dependency context | Upstream's mobile list dropped Priority, Type, Customer and Tags, so they could not be seen or changed on a phone |
| `desk/src/pages/ticket/TicketNew.vue` | A Grain field (`tatva/GrainSelect.vue`) above Subject for agents; Submit waits for a grain, and the grain goes in the create request | A ticket an agent raises is filed under their grain, as a lead is |
| `desk/src/roots/AgentRoot.vue` | Mounts `tatva/checkin/CheckinPrompt.vue` for agents | An agent is asked to check in at login and when a shift opens, as a CRM rep is; pools that require check-in give work only to people checked in |
| `desk/src/stores/auth.ts` | `logout()` goes through `logoutWithCheckout` from `tatva/checkin/useCheckin.ts` | An agent checked in Active is asked whether to set Unavailable before logging out, as the CRM asks; anyone else logs out as upstream |
| `desk/src/components/ticket-agent/TicketHeader.vue` (2) | `tatva/record_actions/RecordActionsButton.vue` before the status, the ticket's record actions such as Create Jira issue | Record actions are tatva_connect's, one door for the CRM and Helpdesk; nothing shows while a ticket offers none |
| `desk/src/components/ticket-agent/TicketDetailsTab.vue` | `tatva/record_actions/RecordActionLinks.vue` third, after More Details: what record actions made for the ticket, read live | A ticket's Jira issue and its status in the sidebar; nothing shows while it has none |
| `desk/src/components/ticket-agent/TicketDetailsTab.vue` (2) | A `hideHeader` prop leaves out the contact and SLA header | Mobile already shows both above the panel |
| `desk/src/components/TicketField.vue` | A Link field passes its `filters` to the picker | Lets a dependency narrow the picker on both panels |
| `desk/src/components/modals/ShortcutsModal.vue` | Next/Previous ticket print `Shift .` / `Shift ,` instead of `Shift >` / `Shift <` | `>` and `<` read as arrow keys; the CRM's shortcuts list prints the same keys the same way |
| `desk/src/App.vue` | `onMounted` loads presence: `call("tatva_connect.presence.client")`, then `import()` of the URL it returns, started with `globalStore().$socket` | Agents report active / idle / away through the ONE presence client tatva_connect serves, the same file the CRM loads; a portal customer gets nothing back, and without tatva_connect the call fails and nothing runs |
| `desk/src/components/command-palette/CommandPalette.vue` | `watch(depth)` also sets the list's `scrollTop` to 0 | A drill-down opened from a scrolled list kept the old scroll, so its first rows sat above the fold |

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
| `GUIDELINES.md` | How to change, take an upstream release, and release |
| `.github/assets/tatva-logo.png` | The logo the README shows |
| `desk/src/tatva/docsMenu.ts` | The Docs menu item: the wiki space Tatva Platform Settings names for `helpdesk`, hidden when none |
| `desk/src/tatva/fieldDependencies.ts` | Field Dependencies on an open ticket: the scripts' `applyFilters`, the load and save runs, and the narrowed field; names no field |
| `desk/src/tatva/GrainSelect.vue` | The new-ticket Grain field: the agent's grains from `tatva_connect.helpdesk.ticket.grain_choices`, one applied and locked, several a required pick |
| `desk/src/tatva/checkin/useCheckin.ts` | The check-in ask and the logout ask on `tatva_connect.api.checkin` (`get_status`, `set_status`, `dismiss_prompt`) and its `tatva_checkin` push, with the CRM's rules; nothing shows unless the server answers `enabled` |
| `desk/src/tatva/checkin/CheckinPrompt.vue` | The CRM's check-in dialog, its words and buttons, on Helpdesk's own Dialog |
| `desk/src/tatva/record_actions/recordActions.ts` | The record actions door's endpoint, the shared run counter, the server's form and field types, and a server option as a frappe-ui option with its picture |
| `desk/src/tatva/record_actions/RecordActionsButton.vue` | A record's actions as a button, or a split button when it offers more than one |
| `desk/src/tatva/record_actions/RecordActionDialog.vue` | One action's dialog: the action's icon in the title, a refresh, a non-blocking note of what was already created, the server's fields for the choices made so far, and its run |
| `desk/src/tatva/record_actions/RecordActionSearch.vue` | A server-searched field (a person, a parent issue), shaped like `components/frappe-ui/Link.vue`; reads only once opened |
| `desk/src/tatva/record_actions/RecordActionTags.vue` | A many-valued field on frappe-ui's MultiSelect, with the typed value as a new one where allowed |
| `desk/src/tatva/record_actions/RecordActionLinks.vue` | A record's links as sidebar sections, each card read live (key, status, title, owner, priority, updated) |

New code goes in `desk/src/tatva/` and is listed here when it is added.

Upstream's `.gitignore` lists `CLAUDE.md`, so ours is tracked with `git add -f CLAUDE.md`. The ignore line
stays as upstream has it.

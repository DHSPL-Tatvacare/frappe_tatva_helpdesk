# Working in this repo (read before any change)

This is **TatvaCare Helpdesk**, a light fork of `frappe/helpdesk` started from `v1.30.1`. It belongs to
TatvaCare's healthcare CRM platform. Never call that platform a "PSP CRM" or any narrower name.
**The code is the only authority:** where a doc and the code disagree, the code wins and the doc is wrong.

Upstream's own code standards are in [`AGENTS.md`](AGENTS.md). Follow them. Where they disagree with this
file, this file wins.

## The fork is light, and stays light

1. **Backend changes go in `frappe_tatva_connect` first.** Use a hook there (`override_doctype_class`,
   `override_whitelisted_methods`, `doc_events`). Change a file here only when no hook can reach it.
2. **Screen changes stay small.** New components and pages go in `desk/src/tatva/`. An edit to an
   upstream file is a few lines, each marked with a one-line `// TATVA:` (or `# TATVA:`) comment saying why.
3. **Every upstream file we touch is listed in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md)**, in the same
   change. Not listed means not touched.
4. **Never reformat, rename, move or upgrade upstream code or packages.** Any of those makes every later
   upstream fix conflict.
5. **No business logic here.** Rules, routing and permissions live in `frappe_tatva_connect`, enforced on
   the server.
6. **Comments are one line.** Anything longer belongs in a doc.

## How we work

- **Ask before any git change:** branch, merge, rebase, reset or stash. One author only. Commit messages
  and PR bodies never name Claude.
- **Upstream changes come in as patches, never as upstream commits.** Never add `frappe/helpdesk` as a
  remote here. The steps are in [`GUIDELINES.md`](GUIDELINES.md).
- **Prove before claiming done:** build, run it on the local bench, check the screen at about 390px and on
  desktop.
- **Plans live in `frappe_tatva_connect/docs/plans/helpdesk/`**, not in this repo.

## Index

| Need | Where |
|---|---|
| What we changed in upstream, and why | [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md) |
| How to change, take an upstream fix, release | [`GUIDELINES.md`](GUIDELINES.md) |
| Upstream's code standards | [`AGENTS.md`](AGENTS.md) |
| Backend rules and hooks | `frappe_tatva_connect`: `tatva_connect/helpdesk/` and `hooks.py` |

<div align="center">

<img src=".github/assets/tatva-logo.png" width="88" height="88" alt="TatvaCare" />

# TatvaCare Helpdesk

**The support desk for TatvaCare, part of the TatvaCare One platform.**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

</div>

## Overview

This repository is TatvaCare's helpdesk: a light fork of
[`frappe/helpdesk`](https://github.com/frappe/helpdesk), started from `v1.30.1`. Agents work tickets in
it, and patients and staff raise them through email, the portal, intake forms and partner APIs.

The fork stays close to upstream on purpose, so upstream fixes and upgrades keep coming in. Our changes
are few, marked in the code, and listed in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md).

## Where things live

| Repo | Role |
|---|---|
| `frappe_tatva_helpdesk` (this) | The helpdesk app: its screens and the few backend changes no hook can reach |
| [`frappe_tatva_connect`](https://github.com/DHSPL-Tatvacare/frappe_tatva_connect) | The backend: rules, routing, permissions and every helpdesk change a hook can make |
| [`frappe_tatva_crm`](https://github.com/DHSPL-Tatvacare/frappe_tatva_crm) | The CRM screens |

All three run on one site and ship together.

## Development

```bash
cd desk
yarn install
yarn dev          # hot-reload dev server
yarn build        # production bundle, served at /helpdesk
```

Check every screen change on a phone-width screen, about 390px, as well as on desktop.

How to make a change, take in an upstream fix and release is in [`GUIDELINES.md`](GUIDELINES.md).

## License and acknowledgements

Built on the [Frappe Framework](https://frappeframework.com) and
[Frappe Helpdesk](https://github.com/frappe/helpdesk). Licensed under GNU AGPL v3; see [LICENSE](LICENSE).
Original work is copyright Frappe Technologies Pvt. Ltd.; modifications are copyright TatvaCare.

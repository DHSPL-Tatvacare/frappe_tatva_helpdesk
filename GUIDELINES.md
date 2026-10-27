# Guidelines

How to change this fork, take in an upstream release, and release. The rules behind these steps are in
[`CLAUDE.md`](CLAUDE.md).

## Make a change

1. Check whether a hook in `frappe_tatva_connect` can do it. If one can, make the change there and stop.
2. Put new screens and components in `desk/src/tatva/`.
3. If an upstream file must change, change as few lines as you can. Mark each change with a one-line
   `// TATVA:` (or `# TATVA:`) comment saying why.
4. Add the file to the table in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md) in the same commit.
5. Build and check it:

   ```bash
   cd desk && yarn build
   ```

   Run it on the local bench. Check the screen at about 390px and on desktop.
6. Commit on `develop`.

## Take in an upstream release

We take upstream whole releases only, never single commits: no cherry-pick, no PR, no upstream remote. Keep a
read-only copy of upstream outside this repo, so upstream's history and authors stay out of this repo.

1. Get or update the upstream copy:

   ```bash
   git clone https://github.com/frappe/helpdesk ../_upstream/helpdesk   # once
   git -C ../_upstream/helpdesk fetch --tags                             # each time
   ```

2. Make a patch between our baseline tag and upstream's new tag, and apply it here:

   ```bash
   git -C ../_upstream/helpdesk diff <baseline tag> <new tag> -- . ':!.github' > /tmp/upgrade.patch
   git apply -3 /tmp/upgrade.patch
   ```

3. If a file we changed conflicts, business priority decides; keep our `TATVA:` lines unless upstream now does the job.
4. Check every file listed in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md) still has its `TATVA:` lines, build, and test on the bench.
5. Commit as yourself: `chore(upstream): take frappe/helpdesk <new tag>`, and update the baseline rows in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md).

## Release

1. Work is committed on `develop`.
2. Move `uat` forward to `develop` and deploy UAT.
3. When UAT is good, move `prod` forward to `uat`.

Branches only move forward. A fix found on `uat` is made on `develop` and moved forward again.

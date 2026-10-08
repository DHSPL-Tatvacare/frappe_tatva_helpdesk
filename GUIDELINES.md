# Guidelines

How to change this fork, take in an upstream fix, and release. The rules behind these steps are in
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

## Take in an upstream fix

Keep a read-only copy of upstream outside this repo, and never add it as a remote here. That keeps
upstream's history and authors out of this repo.

1. Get or update the upstream copy:

   ```bash
   git clone https://github.com/frappe/helpdesk ../_upstream/helpdesk   # once
   git -C ../_upstream/helpdesk fetch --tags                             # each time
   ```

2. Find the fix you want, and note its commit.
3. Make a patch from it and apply it here:

   ```bash
   git -C ../_upstream/helpdesk format-patch -1 <commit> --stdout > /tmp/upstream.patch
   git apply -3 /tmp/upstream.patch
   ```

4. If a file we changed conflicts, keep upstream's fix and our `TATVA:` lines both.
5. Build and check it as in "Make a change".
6. Commit as yourself: `fix(upstream): <what it fixes> (frappe/helpdesk <commit>)`.
7. Update "Last upstream patch taken" in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md).

## Upgrade to a new upstream version

The same steps, with a patch between two tags:

```bash
git -C ../_upstream/helpdesk diff v1.30.1 <new tag> > /tmp/upgrade.patch
git apply -3 /tmp/upgrade.patch
```

Then check every file listed in [`CUSTOMIZATIONS.md`](CUSTOMIZATIONS.md) still has its `TATVA:` lines, build,
test on the bench, and update the baseline rows.

## Release

1. Work is committed on `develop`.
2. Move `uat` forward to `develop` and deploy UAT.
3. When UAT is good, move `prod` forward to `uat`.

Branches only move forward. A fix found on `uat` is made on `develop` and moved forward again.

# @twobitedd/ergo-account-model

Provider-agnostic account/session abstraction for Ergo apps.

## Install

```bash
npm install @twobitedd/ergo-account-model
```

## Public API

- `buildAccountSession(input)` for pure session derivation.
- `buildAdapter({ identity, migration })` for provider adapter snapshots.
- `AccountModelProvider` and `useAccountModel()` for React context wiring.

## React Provider Usage

The package provider accepts already-resolved app data so it stays independent
from app-specific hooks:

- `dynamicUser`
- `walletConnected`
- `walletSource`
- `ergoAddress`
- `vault`

You can optionally pass `toVaultSnapshot` to map app-specific vault records to
the package `VaultSnapshot` type.

## Local Development

From this package directory:

```bash
npm install
npm run check
```

The package is compiled to `dist/` and only published files in `dist/`.

## Publishing

1. Bump the version in `package.json`.
2. Authenticate once with npm:
   ```bash
   npm login
   ```
3. Build/test and preview tarball:
   ```bash
   npm run prepublishOnly
   npm pack --dry-run
   ```
4. Publish as a public scoped package:
   ```bash
   npm publish --access public
   ```

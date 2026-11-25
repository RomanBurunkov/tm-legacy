# Changelog

## 0.1.0 - 25-11-2026
- Bump version to 0.1.0
- Node.js 10, 12, and 14 are no longer tested; compatibility is not guaranteed.
- CI tests Node.js 18, 20, 22, 24, and 26.
- Updated GitHub Actions to v6 and switched CI dependency installation to `npm ci`.
- Updated ESLint to v8, Airbnb's base configuration to v15, and eslint-plugin-import to v2.32.
- Updated Jest to v29.7.0.
- Moved ESLint and Jest configurations from `package.json` to separate files.
- Excluded test and development files from the npm package.
- Added basic TypeScript type definitions for functions.
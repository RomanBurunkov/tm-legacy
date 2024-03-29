# tm-legacy

[![npm](https://img.shields.io/npm/v/tm-legacy.svg)](https://www.npmjs.org/package/tm-legacy)
[![codecov](https://codecov.io/gh/RomanBurunkov/tm-legacy/branch/main/graph/badge.svg?token=DXV24TPWYP)](https://codecov.io/gh/RomanBurunkov/tm-legacy)

Get, save and update backup settings.

### Installation

```
npm i tm-legacy
```

### Options

  Options is an object with the following fields:

  - `file` File name to store/read backup settings.
  - `path` Path to store/read backup settings file.
  - `keys` Array with backup settings names(Settings object fields names).

### Methods

  - `validate` Checks whether backup settings is available.
  - `load` Loads settings and store data in memory for further usage.
  - `save` Saves settings into a file.
  - `update` Updates settings.

  Note: All the methods above are async(return promise).

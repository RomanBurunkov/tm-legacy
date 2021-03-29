# tm-legacy

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
  - `load`
  - `save`
  - `update`
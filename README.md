# MA3 Plugin Release (GitHub Action)

[![Lint Codebase](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/linter.yml/badge.svg)](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/linter.yml)
[![CI](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/ci.yml/badge.svg)](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/ci.yml)
[![Check Dist](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/bootsie123/ma3-plugin-action/actions/workflows/check-dist.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action which auto generates XML files for grandMA3 plugins.

## Usage

```yaml
- uses: bootsie123/ma3-plugin-action@v1
  with:
    # Species the information on each plugin to include in the XML file. Plugin
    # 1 outlines the required keys while Plugin 2 shows all possible keys
    #
    # name [required]: The name of the plugin
    # version [required]: The version of the plugin
    # path [required]: The path to the plugin's LUA file
    # pluginGuid [optional]: The GUID to use for the plugin
    # luaGuid [optional]: The GUID to use for the LUA component
    plugins: >-
      [
        {
          "name": "Plugin 1",
          "version": "1.0.0",
          "path": "plugin-1.lua"
        },
        {
          "name": "Plugin 2",
          "version": "1.0.0",
          "path": "plugin-2.lua",
          "pluginGuid": "C3 13 5E E5 B6 B5 10 02 15 9F 34 2F 14 B7 E5 8B",
          "luaGuid": "C3 13 5E E5 81 D3 10 02 EB 89 05 59 8F 53 BF 8B"
        }
      ]

    # The path to the file to save the XML as
    outputFile: 'plugins.xml'

    # Determines whether the XML file should be generated as an artifact
    # Default: false
    generateArtifact: false
```

## Examples

<!-- markdownlint-disable MD033 -->

<details>
  <summary>Create plugin release file on push from the main branch</summary>

```yaml
name: MA3 Plugin Build

on:
  push:
    branches: ['main']

permissions:
  contents: write

jobs:
  build:
    name: MA3 Plugin Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build Release File
        uses: bootsie123/ma3-plugin-action@v1
        with:
          plugins: >-
            [
              {
                "name": "Test Plugin",
                "version": "1.0.0",
                "path": "test-plugin.lua"
              }
            ]
          outputFile: ./test-plugin.xml

      - name: Push Changes
        run: |
          git config user.name "${GITHUB_ACTOR}"
          git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
          git add .
          git commit -am "Automated: update MA3 plugin release file"
          git push
```

</details>

<details>
  <summary>Execute workflow only when plugins are modified</summary>

```yaml
name: MA3 Plugin Build

on:
  push:
    branches: ['main']
    paths:
      - '**/*.lua'

permissions:
  contents: write

jobs:
  build:
    name: MA3 Plugin Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build Release File
        uses: bootsie123/ma3-plugin-action@v1
        with:
          plugins: >-
            [
              {
                "name": "Test Plugin",
                "version": "1.0.0",
                "path": "test-plugin.lua"
              }
            ]
          outputFile: ./test-plugin.xml

      - name: Push Changes
        run: |
          git config user.name "${GITHUB_ACTOR}"
          git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
          git add .
          git commit -am "Automated: update MA3 plugin release file"
          git push
```

</details>

<details>
  <summary>Execute workflow in PRs only when plugins are modified</summary>

```yaml
name: MA3 Plugin Build

on:
  pull_request_target:
    paths:
      - '**/*.lua'

permissions:
  contents: write

jobs:
  build:
    name: MA3 Plugin Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          repository: ${{ github.event.pull_request.head.repo.full_name }}
          fetch-depth: 0

      - name: Build Release File
        uses: bootsie123/ma3-plugin-action@v1
        with:
          plugins: >-
            [
              {
                "name": "Test Plugin",
                "version": "1.0.0",
                "path": "test-plugin.lua"
              }
            ]
          outputFile: ./test-plugin.xml

      - name: Push Changes
        run: |
          git config user.name "${GITHUB_ACTOR}"
          git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
          git add .
          git commit -am "Automated: update MA3 plugin release file"
          git push
```

</details>

## Contributing

Pull requests are welcome. Any changes are appreciated!

## License

[ISC](https://choosealicense.com/licenses/isc/)

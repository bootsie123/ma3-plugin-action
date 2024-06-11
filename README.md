# MA3 Plugin Release (GitHub Action)

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action which auto generates XML files for grandMA3 plugins.

## Usage

```yaml
- uses: bootsie123/ma3-plugin-action@v1
  with:
    # Species the information on each plugin to include in the XML file. Plugin 1 outlines
    # the required keys while Plugin 2 shows all possible keys
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

## Contributing

Pull requests are welcome. Any changes are appreciated!

## License

[ISC](https://choosealicense.com/licenses/isc/)

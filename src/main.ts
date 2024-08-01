import * as core from '@actions/core'
import client from '@actions/artifact'
import fs from 'fs'
import { webcrypto } from 'crypto'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import xmlFormat from 'xml-formatter'

const MA3_DATA_VERSION = '2.0.2.0'
const BLOCK_SIZE = 1024

/**
 * Outlines expected user input on MA3 plugins
 */
interface Plugin {
  name: string // Name of the plugin
  version: string // Version of the plugin
  path: string // Path to the plugin's LUA file
  pluginGuid?: string // GUID for the plugin
  luaGuid?: string // GUID for the LUA component
}

/**
 * Generates a random hex ID string of length 16
 *
 * @returns The random hex id
 */
function genHexId(): string {
  const hex = webcrypto.getRandomValues(new Uint8Array(16))

  return [...hex]
    .map(x => x.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pluginsJSON: string = core.getInput('plugins')

    core.debug(`Received input: ${pluginsJSON}`)

    let plugins: Plugin[]

    try {
      plugins = JSON.parse(pluginsJSON)
    } catch (err) {
      let msg = 'The value of "plugins" is not valid JSON: '

      if (err instanceof Error) {
        msg += err.message
      } else {
        msg += err as string
      }

      throw new Error(msg)
    }

    const doc = new DOMParser().parseFromString(
      '<?xml version="1.0" encoding="UTF-8"?>'
    )

    const gma3 = doc.createElement('GMA3')

    gma3.setAttribute('DataVersion', MA3_DATA_VERSION)

    for (const plugin of plugins) {
      const el = doc.createElement('UserPlugin')

      el.setAttribute('Name', plugin.name)
      el.setAttribute('Guid', plugin.pluginGuid || genHexId())
      el.setAttribute('Version', plugin.version)

      const lua = doc.createElement('ComponentLua')

      lua.setAttribute('Guid', plugin.luaGuid || genHexId())

      const fileContent = doc.createElement('FileContent')

      let file

      try {
        file = fs.readFileSync(plugin.path, 'utf8')
      } catch (err) {
        let msg = `Unable to read lua file "${plugin.path}": `

        if (err instanceof Error) {
          msg += err.message
        } else {
          msg += err as string
        }

        throw new Error(msg)
      }

      for (let i = 0; i < file.length; i += BLOCK_SIZE) {
        const block = file.substring(i, i + BLOCK_SIZE)

        const blockEl = doc.createElement('Block')

        blockEl.setAttribute('Base64', Buffer.from(block).toString('base64'))

        fileContent.appendChild(blockEl)
      }

      fileContent.setAttribute('Size', fileContent.childNodes.length.toString())

      lua.appendChild(fileContent)
      el.appendChild(lua)
      gma3.appendChild(el)
    }

    doc.appendChild(gma3)

    const xml = xmlFormat(new XMLSerializer().serializeToString(doc), {
      lineSeparator: '\n'
    })

    core.debug(`Generated XML file:\n${xml}`)

    const outputFile: string = core.getInput('outputFile')

    core.debug(`Saving to "${outputFile}"...`)

    fs.writeFileSync(outputFile, xml)

    if (core.getInput('generateArtifact') === 'true') {
      core.debug(`Uploading file as artifact...`)

      client.uploadArtifact('MA3 Plugins Release', [outputFile], '.')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`Unknown error occured: ${error}`)
    }
  }
}

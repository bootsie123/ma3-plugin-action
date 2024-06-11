/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import fs from 'fs'

import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  const inputPlugin = `[
    {
      "name": "Test Plugin",
      "version": "1.0.0",
      "path": "__tests__/test-plugin.lua",
      "pluginGuid": "C3 13 5E E5 B6 B5 10 02 15 9F 34 2F 14 B7 E5 8B",
      "luaGuid": "C3 13 5E E5 81 D3 10 02 EB 89 05 59 8F 53 BF 8B"
    }
  ]
  `
  const inputOutputFile = '__tests__/test-plugin.xml.test'
  const input_generateArtifact = 'false'

  it('parses input', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'plugins':
          return inputPlugin
        case 'outputFile':
          return inputOutputFile
        case 'generateArtifact':
          return input_generateArtifact
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      `Received input: ${inputPlugin}`
    )

    expect(debugMock).toHaveBeenNthCalledWith(
      3,
      `Saving to "${inputOutputFile}"...`
    )

    expect(debugMock).not.toHaveBeenNthCalledWith(
      4,
      `Uploading file as artifact...`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('generates correct xml', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'plugins':
          return inputPlugin
        case 'outputFile':
          return inputOutputFile
        case 'generateArtifact':
          return input_generateArtifact
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    const outputXml = fs.readFileSync('__tests__/test-plugin.xml', 'utf8')

    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      `Generated XML file:\n${outputXml}`
    )

    expect(debugMock).toHaveBeenNthCalledWith(
      3,
      `Saving to "${inputOutputFile}"...`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status - invalid JSON', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'plugins':
          return 'invalid json'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      `The value of "plugins" is not valid JSON: Unexpected token 'i', "invalid json" is not valid JSON`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status - invalid lua file', async () => {
    const invalidFile = '__tests__/invalid-file.lua'

    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'plugins':
          return `[
            {
              "name": "Test Plugin",
              "path": "${invalidFile}"
            }
          ]
          `
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      `Unable to read lua file "${invalidFile}": Error: ENOENT: no such file or directory, open '${invalidFile}'`
    )

    expect(errorMock).not.toHaveBeenCalled()
  })
})

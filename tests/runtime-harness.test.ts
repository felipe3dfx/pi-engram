import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { describe, expect, it } from "vitest"

const execFileAsync = promisify(execFile)

describe("Engram Pi extension runtime harness", () => {
  it("validates the extension runtime contract", async () => {
    const result = await execFileAsync("node", ["test/runtime-harness.mjs", "extensions/engram.ts"], {
      timeout: 10_000,
    })

    expect(result.stderr).toBe("")
  })
})

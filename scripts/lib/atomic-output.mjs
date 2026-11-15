import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export async function readJsonIfExists(target, fallback) {
  try {
    return JSON.parse(await fs.readFile(target, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

export async function atomicReplaceFiles(entries) {
  const staged = []
  try {
    for (const { target, content } of entries) {
      await fs.mkdir(path.dirname(target), { recursive: true })
      const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`)
      const handle = await fs.open(temporary, 'wx')
      try {
        await handle.writeFile(content, 'utf8')
        await handle.sync()
      } finally {
        await handle.close()
      }
      staged.push({ target, temporary })
    }
    for (const { target, temporary } of staged) await fs.rename(temporary, target)
  } catch (error) {
    await Promise.allSettled(staged.map(({ temporary }) => fs.unlink(temporary)))
    throw error
  }
}

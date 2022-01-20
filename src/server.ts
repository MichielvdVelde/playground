import { Server } from 'http'
import { createWriteStream, existsSync } from 'fs'
import { rename, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { randomUUID, createHash } from 'crypto'
import { sep } from 'path'

const MAX_LENGTH = 256 * 1024 // bytes
const server = new Server

// Upload a new asset

server.on('checkContinue', async (req, res) => {
  // TODO: Check if user has permissions to create an asset

  const contentLength = req.headers['content-length'] ? parseInt(req.headers['content-length']) : undefined
  if (!contentLength) {
    throw new Error('411 Length Required')
  } else if (contentLength > MAX_LENGTH) {
    throw new Error('413 Payload Too Large')
  }

  const uuid = randomUUID()
  const tmp = new URL(uuid, `${tmpdir()}${sep}`)
  const stream = createWriteStream(tmp)
  const hash = createHash('sha512')
  let digest: Buffer

  req.pipe(hash)
  req.pipe(stream)
  await new Promise<void>(resolve => res.writeContinue(resolve))

  hash.once('end', () => digest = hash.digest())
  stream.once('end', async () => {
    // tmp file has been stored
    const existsLocally = existsSync(`/volume/${digest.toString('hex')}`)
    if (existsLocally) {
      // asset with hash already exists locally
      await unlink(tmp)
    } else {
      // unique asset - move to volume storage
      await rename(tmp, `/volume/${digest.toString('hex')}`)
    }

    // TODO: Generate and store the metadata
    const header = req.headers['x-name'] as string
    const name = header.slice(0, header.indexOf('.'))
    const extension = header.slice(header.indexOf('.'))
    const mimeType = req.headers['content-type']

    res.writeHead(201)
  })
})

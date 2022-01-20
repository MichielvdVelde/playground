import type { IncomingMessage, ServerResponse } from 'http'
import { createHash, randomUUID } from 'crypto'
import { Server } from 'http'
import { parse, sep } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, existsSync } from 'fs'
import { rename, unlink } from 'fs/promises'

const supportedMimeTypes = ['']
const supportedExtensions = ['']

// https://stackoverflow.com/questions/40939380/how-to-get-file-name-from-content-disposition
function getFileName(disposition: string) {
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName: string | null = null;
  if (utf8FilenameRegex.test(disposition)) {
    fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)![1]);
  } else {
    const matches = asciiFilenameRegex.exec(disposition);
    if (matches != null && matches[2]) {
      fileName = matches[2];
    }
  }
  return fileName;
}

const MAX_LENGTH = 256 * 1024 // bytes
const server = new Server

async function handleCheckContinue(req: IncomingMessage, res: ServerResponse) {
  const contentDisposition = req.headers['content-disposition'] as string | undefined
  const contentType = req.headers['content-type'] as string | undefined
  const contentLength = req.headers['content-length'] ? parseInt(req.headers['content-length']) : undefined

  if (!contentDisposition) {
    throw new Error('400 Bad Request')
  } else {
    const fileName = getFileName(contentDisposition)
    if (!fileName) {
      throw new Error('400 Bad Request')
    }

    const parsed = parse(fileName)
    if (!supportedExtensions.includes(parsed.ext?.substring(1))) {
      throw new Error('400 Bad Request')
    }
  }

  if (!contentType) {
    throw new Error('400 Bad Request')
  } else if (!supportedMimeTypes.includes(contentType)) {
    throw new Error('415 Unsupported Media Type')
  }

  if (!contentLength) {
    throw new Error('411 Length Required')
  } else if (contentLength > MAX_LENGTH) {
    throw new Error('413 Payload Too Large')
  }

  // TODO

  const uuid = randomUUID()
  const tmpFile = new URL(uuid, `${tmpdir()}${sep}`)
  const stream = createWriteStream(tmpFile)
  const hash = createHash('sha512')
  let digest: Buffer

  req.pipe(hash)
  req.pipe(stream)

  await new Promise<void>(resolve => res.writeContinue(resolve))

  hash.once('end', () => digest = hash.digest())
  stream.once('end', async () => {
    // tmp file has been stored
    const existsLocally = existsSync(`${sep}volume${sep}${digest.toString('hex')}`)
    if (existsLocally) {
      // asset with hash already exists locally
      await unlink(tmpFile)
    } else {
      // asset doesn't exist locally - move to volume storage
      await rename(tmpFile, `${sep}volume${sep}${digest.toString('hex')}`)
    }

    // TODO: store asset metadata
    const fileName = getFileName(contentDisposition)!
    const metadata = {
      name: fileName,
      ext: parse(fileName).ext.substring(1),
      type: contentType,
      created: new Date(),
    }

    console.log(metadata)
    res.writeHead(201)
    res.end()
  })
}

server.on('checkContinue', handleCheckContinue)

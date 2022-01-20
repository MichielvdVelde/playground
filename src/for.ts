import type { Readable, Writable } from 'stream'
import type { IncomingMessage, ServerResponse } from 'http'
import { request } from 'http'
import { createSign } from 'crypto'
import { createWriteStream } from 'fs'
// import { selectVolume } from './ass'

const connection: any = null
const SIGN_KEY = Buffer.from(process.env.SIGN_KEY!, 'hex')

export async function handleRemoteAsset(req: IncomingMessage, res: ServerResponse) {
  const parts = req.url!.split('/')
  const assetId = parts[parts.length - 2]
  // const d = selectVolume()
  const stream = createWriteStream(`${'volume'}/${assetId}`)
  return processRemoteAsset(assetId, res, stream)
}

// Fetch an asset from a remote asset server (i.e. an asset server in another region)
// and pipe it to the server response and the file system simultaneously.
export async function processRemoteAsset(assetId: string, res: ServerResponse, fsStream: Writable) {
  return new Promise<void>((resolve, reject) => {
    fetchFromRemote(assetId).then(source => {
      source.pipe(res, { end: false })
      source.pipe(fsStream)
      source.once('end', resolve)
      source.resume()
    }).catch(reject)
  })
}

// Fetch an asset from a remote asset server (i.e. in another region)
export async function fetchFromRemote(assetId: string): Promise<Readable> {
  const source = await connection.srandmember(`assets:${assetId}:locations`)
  const signature = createSign('sha512').update(assetId).sign(SIGN_KEY)
  const url = new URL(`https://${source}/internal/fetch/${assetId}/`)

  return new Promise<Readable>((resolve, reject) => {
    request(url, {
      method: 'GET',
      hostname: source,
      headers: {
        'X-Signature': signature.toString('hex'),
      },
    }, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`${response.statusCode} ${response.statusMessage}`))
      }

      response.pause()
      resolve(response)
    })
  })
}

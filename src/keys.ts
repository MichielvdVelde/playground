import { generateKeyPair } from 'crypto'
import { writeFile } from 'fs/promises'

const PUBLIC_KEY_PATH = ''
const PRIVATE_KEY_PATH = ''

async function generateKeys() {
  const { publicKey, privateKey } = await new Promise<{
    publicKey: string,
    privateKey: string,
  }>((resolve, reject) => {
    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
      }
    }, (err, publicKey, privateKey) => err ? reject(err) : resolve({ publicKey, privateKey }))
  })

  await writeFile(PUBLIC_KEY_PATH, publicKey)
  await writeFile(PRIVATE_KEY_PATH, privateKey)

  return publicKey
}

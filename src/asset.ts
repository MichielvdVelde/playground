import { randomBytes, hkdf, createCipheriv, createDecipheriv } from 'crypto'

// Master key is used for deriving license keys
const MASTER_KEY = Buffer.from(process.env.MASTER_KEY!, 'hex')
// Auth key is used for encrypting and decrypting license keys
const AUTH_KEY = Buffer.from(process.env.AUTH_KEY!, 'hex')

// Derive a unique key for the given UUID
async function deriveKey(info: Buffer) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    hkdf('sha512', MASTER_KEY, randomBytes(16), info, 1024, (err, key) => {
      err ? reject(err) : resolve(key)
    })
  })
}

// Encrypt a key for license storage
// Happens in the license server
async function encryptKey(key: ArrayBuffer) {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', AUTH_KEY, iv)
  return Buffer.concat([iv, cipher.update(Buffer.from(key)), cipher.final()])
}

// Decrypt a key for license check
// Happens in the asset server
async function decryptKey(key: Buffer) {
  const iv = key.slice(0, 16)
  const encrypted = key.slice(16)
  const decipher = createDecipheriv('aes-256-gcm', AUTH_KEY, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

const key = await deriveKey(Buffer.from('<uuid>'.normalize(), 'utf-8'))
// Write encrypted key to redis
const encryptedKey = await encryptKey(key)

const license = {
  assetId: '<uuid>',
  key: Buffer.from(key).toString('hex'),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
}

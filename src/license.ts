import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

async function randomBytesAsync(size: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    randomBytes(size, (err, buf) => err ? reject(err) : resolve(buf))
  })
}

const IV_LENGTH = 16
const AUTH_KEY = Buffer.from(process.env.AUTH_KEY!, 'hex')

// Encrypt a key for license storage
export async function encryptKey(key: ArrayBuffer) {
  const iv = await randomBytesAsync(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', AUTH_KEY, iv)
  return Buffer.concat([iv, cipher.update(Buffer.from(key)), cipher.final()])
}

// Decrypt a key for license check
export async function decryptKey(key: Buffer) {
  const iv = key.slice(0, IV_LENGTH)
  const encrypted = key.slice(IV_LENGTH)
  const decipher = createDecipheriv('aes-256-gcm', AUTH_KEY, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

import type { ChildProcess } from 'child_process'
import { Writable } from 'stream'
import { createHash } from 'crypto'

export class EncStream extends Writable {
  #process: ChildProcess
  #hash: ReturnType<typeof createHash>

  constructor(process: ChildProcess) {
    super()
    this.#process = process
    this.#hash = createHash('sha512')
    process.send({ type: 'open' })
  }

  _write(chunk: any, _encoding: BufferEncoding, cb: (err?: Error | null) => void) {
    this.#hash.update(chunk)
    this.#process.stdin!.write(chunk, cb)
  }

  _final(callback: (error?: Error | null) => void): void {
    const hash = this.#hash.digest()
    this.#process.send({ type: 'end', hash },  err => {
      if (err) return callback(err)
      this.emit('hash', hash)
      callback()
    })
  }
}

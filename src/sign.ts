import { createSign } from 'crypto'

const SIGN_KEY = Buffer.alloc(256, 'hex')

const sign = createSign('sha512')
sign.write('<message>')
sign.end()

const signature = sign.sign(SIGN_KEY, 'hex')

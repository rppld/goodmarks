import { randomBytes } from 'crypto'

function getUUID(size: number = 10) {
  return randomBytes(Math.ceil((size * 3) / 4))
    .toString('base64')
    .slice(0, size)
    .replace(/\+/g, 'a')
    .replace(/\//g, 'b')
}

export default getUUID

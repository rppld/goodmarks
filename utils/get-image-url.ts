import btoa from 'btoa'

type Size = 'avatarSm' | 'avatarMd' | 'avatarLg'

function getImageUrl(key: string, size: Size = 'avatarMd') {
  if (!key) return ''

  if (key.includes('http')) {
    // If the picture URL contains `http` it’s an indicator that a
    // hosted image is used (saved during OAuth). In that case just
    // return the key again.
    return key
  }

  const sizes = {
    avatarSm: [48, 48],
    avatarMd: [96, 96],
    avatarLg: [512, 512],
  }
  const [width, height] = sizes[size]
  const request = {
    key,
    outputFormat: 'jpeg',
    edits: {
      resize: {
        width,
        height,
        fit: 'cover',
      },
      jpeg: { quality: 80 },
    },
  }
  const strRequest = JSON.stringify(request)
  const encRequest = btoa(strRequest)
  return `https://dbb78kjxr16nd.cloudfront.net/${encRequest}`
}

export default getImageUrl

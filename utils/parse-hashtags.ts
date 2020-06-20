export default function (str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  const matcher = /[#]+[A-Za-z0-9-_]+/g
  const hashtags = [...(str.match(matcher) || [])]
  return hashtags.map((tag) => tag.replace('#', ''))
}

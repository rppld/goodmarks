module.exports = function (str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  const matcher = /[#]+[A-Za-z0-9-_]+/g
  return str.match(matcher)
}

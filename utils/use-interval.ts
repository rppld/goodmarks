import React from 'react'

// from https://codesandbox.io/s/l240mp2pm7?file=/src/index.js:742-1161
function useInterval(callback, delay) {
  // I used any type here becauce I didn't really get it
  const savedCallback: any = React.useRef()

  // Remember the latest function.
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export default useInterval

import React from 'react'
import useIntersect from 'utils/use-intersect'
import usePrevious from 'utils/use-previous'

interface Props {
  onIntersect: () => void
  disabled: boolean
}

const InfiniteScrollTrigger: React.FC<Props> = (props) => {
  const ref = React.useRef()
  const visible = useIntersect(ref)
  const previouslyVisible = usePrevious(visible)

  React.useEffect(() => {
    if (visible && !previouslyVisible && !props.disabled) {
      props.onIntersect()
    }
  })

  return <span ref={ref} />
}

InfiniteScrollTrigger.defaultProps = {
  onIntersect: () => {},
}

export default InfiniteScrollTrigger

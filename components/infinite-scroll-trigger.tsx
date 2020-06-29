import React from 'react'
import useIntersect from 'utils/use-intersect'
import usePrevious from 'utils/use-previous'
import styles from './infinite-scroll-trigger.module.css'

interface Props {
  onIntersect: () => void
  disabled: boolean
}

const InfiniteScrollTrigger: React.FC<Props> = ({ children, ...props }) => {
  const ref = React.useRef()
  const visible = useIntersect(ref)
  const previouslyVisible = usePrevious(visible)

  React.useEffect(() => {
    if (visible && !previouslyVisible && !props.disabled) {
      props.onIntersect()
    }
  })

  return (
    <div ref={ref} className={styles.container}>
      {children}
    </div>
  )
}

InfiniteScrollTrigger.defaultProps = {
  onIntersect: () => {},
}

export default InfiniteScrollTrigger

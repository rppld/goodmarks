import React from 'react'

// Cache if we've seen an image before so we don't bother with
// lazy-loading & fading in on subsequent mounts.
const imageCache = Object.create({})
const inImageCache = (src) => {
  return imageCache[src] || false
}

// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== 'undefined' &&
  'loading' in HTMLImageElement.prototype
const isBrowser = typeof window !== 'undefined'
const hasIOSupport = isBrowser && window.IntersectionObserver

let io
const listeners = new WeakMap()

function getIO() {
  if (
    typeof io === 'undefined' &&
    typeof window !== 'undefined' &&
    window.IntersectionObserver
  ) {
    io = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (listeners.has(entry.target)) {
            const cb = listeners.get(entry.target)
            // Edge doesn't currently support isIntersecting, so also
            // test for intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io.unobserve(entry.target)
              listeners.delete(entry.target)
              cb()
            }
          }
        })
      },
      { rootMargin: '10px' }
    )
  }

  return io
}

const listenToIntersections = (el, cb) => {
  const observer = getIO()

  if (observer) {
    observer.observe(el)
    listeners.set(el, cb)
  }

  return () => {
    observer.unobserve(el)
    listeners.delete(el)
  }
}

interface Props extends React.HTMLProps<HTMLImageElement> {
  aspectRatio?: number
  imgStyle?: any
  backgroundColor?: string
  durationFadeIn?: number
  loading?: 'lazy' | 'eager'
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  fadeIn?: boolean
  onStartLoad?: (options: any) => {}
  onLoad?: () => {}
  onError?: () => {}
}

const Image: React.FC<Props> = ({
  title,
  alt,
  className,
  imgStyle = {},
  src,
  sizes,
  srcSet,
  aspectRatio,
  backgroundColor,
  durationFadeIn,
  itemProp,
  loading,
  draggable,
  onStartLoad,
  onLoad,
  ...props
}) => {
  const seenBefore = isBrowser && inImageCache(src)
  const isCritical = loading === 'eager'
  const withIOSupport =
    !hasNativeLazyLoadSupport && hasIOSupport && !isCritical && !seenBefore
  const initialVisible =
    isCritical || (isBrowser && (hasNativeLazyLoadSupport || !withIOSupport))
  const imageRef = React.useRef<HTMLImageElement>()
  const [visible, setVisible] = React.useState(initialVisible)
  const [loaded, setLoaded] = React.useState(false)
  const fadeIn = !seenBefore && props.fadeIn
  const shouldReveal = fadeIn === false || loaded
  const shouldFadeIn = fadeIn === true
  const cleanUpListeners = React.useRef<any>()

  const imageStyle = {
    opacity: shouldReveal ? 1 : 0,
    transition: shouldFadeIn ? `opacity ${durationFadeIn}ms` : 'none',
    ...imgStyle,
  }

  const bgColor =
    typeof backgroundColor === 'boolean' ? 'lightgray' : backgroundColor

  const delayHideStyle = {
    transitionDelay: `${durationFadeIn}ms`,
  }

  const handleImageLoaded = React.useCallback(() => {
    imageCache[src] = true
    setLoaded(true)
    if (onLoad) onLoad()
  }, [src, onLoad])

  React.useEffect(() => {
    if (visible && typeof onStartLoad === 'function') {
      onStartLoad({ wasCached: inImageCache(src) })
    }

    if (isCritical) {
      const img = imageRef.current
      if (img && img.complete) {
        handleImageLoaded()
      }
    }

    return function cleanup() {
      if (typeof cleanUpListeners.current === 'function') {
        cleanUpListeners.current()
      }
    }
  }, [
    src,
    cleanUpListeners,
    isCritical,
    visible,
    onStartLoad,
    handleImageLoaded,
  ])

  React.useEffect(() => {
    if (visible) setLoaded(true)
  }, [visible])

  // Specific to IntersectionObserver based lazy-load support
  function handleRef(ref) {
    if (withIOSupport && ref) {
      cleanUpListeners.current = listenToIntersections(ref, () => {
        const imageInCache = inImageCache(src)
        if (!visible && typeof onStartLoad === 'function') {
          onStartLoad({ wasCached: imageInCache })
        }
        setVisible(true)
      })
    }
  }

  return (
    <figure ref={handleRef}>
      <div style={{ paddingBottom: `${100 / aspectRatio}%` }} />

      {bgColor && (
        <div
          title={title}
          style={{
            backgroundColor: bgColor,
            opacity: !loaded ? 1 : 0,
            ...(shouldFadeIn && delayHideStyle),
          }}
        />
      )}

      {visible && (
        <picture style={{ lineHeight: 0, display: 'block' }}>
          <img
            alt={alt}
            title={title}
            sizes={sizes}
            src={src}
            crossOrigin={props.crossOrigin}
            srcSet={srcSet}
            style={imageStyle}
            ref={imageRef}
            onLoad={handleImageLoaded}
            onError={props.onError}
            itemProp={itemProp}
            loading={loading}
            draggable={draggable}
            className={className}
          />
        </picture>
      )}
    </figure>
  )
}

Image.defaultProps = {
  fadeIn: true,
  durationFadeIn: 500,
  alt: '',
  loading: 'lazy',
}

export default Image

import React from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import styles from './avatar.module.css'

type Size = 'sm' | 'md' | 'lg' | 'xl'

type Dimensions = {
  width: number
  height: number
}

interface Props {
  size?: Size
  alt?: string
  src: string
}

function getDimensions(size: Size): Dimensions {
  switch (size) {
    case 'sm':
      return { width: 24, height: 24 }
    case 'lg':
      return { width: 72, height: 72 }
    case 'xl':
      return { width: 96, height: 96 }
    case 'md':
    default:
      return { width: 40, height: 40 }
  }
}

const Avatar: React.FC<Props> = ({
  size = 'md',
  src,
  alt = 'Avatar',
  ...props
}) => {
  return (
    <span className={clsx(styles.wrapper, styles[size])} {...props}>
      {src ? (
        <Image
          className={styles.image}
          src={src}
          alt={alt}
          {...getDimensions(size)}
        />
      ) : (
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.36194 34.6289C8.35225 31.3932 11.4618 28.9198 15.1512 27.7479C12.079 26.0414 10 22.7635 10 19C10 13.4772 14.4772 9 20 9C25.5229 9 30 13.4772 30 19C30 22.7635 27.921 26.0414 24.8488 27.7479C28.5382 28.9198 31.6478 31.3932 33.6381 34.6289C30.0654 37.9611 25.2708 40 20 40C14.7292 40 9.93462 37.9611 6.36194 34.6289Z" />
        </svg>
      )}
    </span>
  )
}

export default Avatar

import React from 'react'
import styles from './avatar.module.css'
import Image from './image'

interface Props {
  size?: number
  alt?: string
  src: string
}

const Avatar: React.FC<Props> = ({
  size = 40,
  src,
  alt = 'Avatar',
  ...props
}) => (
  <span className={styles.wrapper} {...props}>
    {src && (
      <Image
        className={styles.image}
        src={src}
        alt={alt}
        width={size}
        height={size}
      />
    )}
  </span>
)

Avatar.defaultProps = {
  size: 40,
  alt: 'Avatar',
}

export default Avatar

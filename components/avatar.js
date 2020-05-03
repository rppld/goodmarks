import React from 'react'
import styles from './avatar.module.css'
import Image from './image'

const Avatar = ({ size, src, alt, ...props }) => (
  <span className={styles.wrapper} {...props}>
    <Image
      className={styles.image}
      src={src}
      alt={alt}
      width={size}
      height={size}
    />
  </span>
)

Avatar.defaultProps = {
  size: 40,
  alt: 'Avatar',
}

export default Avatar

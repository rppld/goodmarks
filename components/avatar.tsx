import React from 'react'
import classNames from 'classnames'
import styles from './avatar.module.css'
import Image from './image'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
  src: string
}

const Avatar: React.FC<Props> = ({
  size = 'md',
  src,
  alt = 'Avatar',
  ...props
}) => {
  return (
    <span className={classNames(styles.wrapper, styles[size])} {...props}>
      {src && <Image className={styles.image} src={src} alt={alt} />}
    </span>
  )
}

Avatar.defaultProps = {
  size: 'md',
  alt: 'Avatar',
}

export default Avatar

import React from 'react'
import styles from './loader.module.css'
import { HStack } from './stack'

interface Props {}

const Loader: React.FC<Props> = () => {
  return (
    <HStack>
      <svg
        className={styles.spinner}
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <circle opacity="0.1" cx="12" cy="12" r="10" stroke-width="4" />
        <path d="M10 2C10 0.89543 10.8954 0 12 0C18.6274 0 24 5.37258 24 12C24 13.1046 23.1046 14 22 14C20.8954 14 20 13.1046 20 12C20 7.58172 16.4183 4 12 4C10.8954 4 10 3.10457 10 2Z" />
      </svg>
    </HStack>
  )
}

export default Loader

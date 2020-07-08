import React from 'react'
import styles from './markdown-output.module.css'

interface Props {
  dangerouslySetInnerHTML: any
}

const MarkdownOutput: React.FC<Props> = (props) => {
  return <article className={styles.container} {...props} />
}

export default MarkdownOutput

import React from 'react'
import Link from 'next/link'
import styles from './category-selection.module.css'
import Text from './text'
import { Movie, Link as LinkIcon, TV } from './icon'

const CategorySelection = () => (
  <ul className={styles.list}>
    <li>
      <Link href="/new/[category]" as="/new/movie">
        <a>
          <div className={styles.category}>
            <Movie size="md" />
            <div className={styles.label}>
              <Text>Movie</Text>
            </div>
          </div>
        </a>
      </Link>
    </li>
    <li>
      <Link href="/new/[category]" as="/new/tv-show">
        <a>
          <div className={styles.category}>
            <TV size="md" />
            <div className={styles.label}>
              <Text>TV show</Text>
            </div>
          </div>
        </a>
      </Link>
    </li>
    <li>
      <Link href="/new/[category]" as="/new/link">
        <a>
          <div className={styles.category}>
            <LinkIcon size="md" />
            <div className={styles.label}>
              <Text>Link</Text>
            </div>
          </div>
        </a>
      </Link>
    </li>
  </ul>
)

export default CategorySelection

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './category-selection.module.css'
import { Text } from './text'
import { Movie, Link as LinkIcon, TV } from './icon'

const CategorySelection: React.FC = () => {
  const router = useRouter()
  const queryString = router && router.asPath.split('?')[1]
  const query = queryString ? `?${queryString}` : ''

  return (
    <ul className={styles.list}>
      <li>
        <Link href="/b/new/[category]" as={`/b/new/movie${query}`}>
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
        <Link href="/b/new/[category]" as={`/b/new/tv-show${query}`}>
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
        <Link href="/b/new/[category]" as={`/b/new/link${query}`}>
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
}

export default CategorySelection

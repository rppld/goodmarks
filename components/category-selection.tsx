import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import styles from './category-selection.module.css'
import { Movie, Link as LinkIcon, TV } from './icon'

interface props {
  linkHref: string
  linkAs: string
  label: string
  icon: any
  className: any
}

const CategoryTile: React.FC<props> = ({
  linkHref,
  linkAs,
  label,
  icon,
  className,
}) => {
  return (
    <li>
      <Link href={linkHref} as={linkAs}>
        <a>
          <div className={clsx(styles.category, className)}>
            <div className={styles['icon-container']}>{icon}</div>
            <div className={styles.label}>{label}</div>
          </div>
        </a>
      </Link>
    </li>
  )
}

const CategorySelection: React.FC = () => {
  const router = useRouter()
  const queryString = router && router.asPath.split('?')[1]
  const query = queryString ? `?${queryString}` : ''

  return (
    <ul className={styles.list}>
      <CategoryTile
        linkHref="/b/new/[category]"
        linkAs={`/b/new/movie${query}`}
        label="Movie"
        icon={<Movie />}
        className={styles.movies}
      />

      <CategoryTile
        linkHref="/b/new/[category]"
        linkAs={`/b/new/tv-show${query}`}
        label="TV show"
        icon={<TV />}
        className={styles['tv-shows']}
      />

      <CategoryTile
        linkHref="/b/new/[category]"
        linkAs={`/b/new/link${query}`}
        label="Link"
        icon={<LinkIcon />}
        className={styles.links}
      />
    </ul>
  )
}

export default CategorySelection

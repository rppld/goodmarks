import React from 'react'
import Icon, { IconProps } from './icon'

export const Home: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Home" {...props}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
  </Icon>
)

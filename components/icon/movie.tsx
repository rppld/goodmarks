import React from 'react'
import Icon, { IconProps } from './icon'

export const Movie: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Movie" {...props}>
    <path d="M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V4H18Z" />
  </Icon>
)

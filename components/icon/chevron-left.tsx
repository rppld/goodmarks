import React from 'react'
import Icon, { IconProps } from './icon'

export const ChevronLeft: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Chevron Left" {...props}>
    <path d="M16 7L14.5 5.5L8 12L14.5 18.5L16 17L11 12L16 7Z" />
  </Icon>
)

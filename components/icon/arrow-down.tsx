import React from 'react'
import Icon, { IconProps } from './icon'

export const ArrowDown: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Arrow Down" {...props}>
    <path d="M7 10L12 15L17 10H7Z" />
  </Icon>
)

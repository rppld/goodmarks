import React from 'react'
import Icon, { IconProps } from './icon'

export const List: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="List" {...props}>
    <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" />
  </Icon>
)

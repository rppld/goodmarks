import React from 'react'
import Icon, { IconProps } from './icon'

export const MagnifyingGlass: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Magnifying Glass" {...props}>
    <path d="M16.5 15H15.71L15.43 14.73C16.41 13.59 17 12.11 17 10.5C17 6.91 14.09 4 10.5 4C6.91 4 4 6.91 4 10.5C4 14.09 6.91 17 10.5 17C12.11 17 13.59 16.41 14.73 15.43L15 15.71V16.5L20 21.49L21.49 20L16.5 15ZM10.5 15C8.01 15 6 12.99 6 10.5C6 8.01 8.01 6 10.5 6C12.99 6 15 8.01 15 10.5C15 12.99 12.99 15 10.5 15Z" />
  </Icon>
)

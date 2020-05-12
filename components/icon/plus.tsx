import React from 'react'
import Icon, { IconProps } from './icon'

export const Plus: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Plus" {...props}>
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </Icon>
)

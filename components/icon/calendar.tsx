import React from 'react'
import Icon, { IconProps } from './icon'

export const Calendar: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Calendar" {...props}>
    <path d="M6 1a1 1 0 00-1 1v1H4a2 2 0 00-2 2v3h20V5a2 2 0 00-2-2h-1V2a1 1 0 10-2 0v1H7V2a1 1 0 00-1-1zM22 10H2v9a2 2 0 002 2h16a2 2 0 002-2v-9z" />
  </Icon>
)

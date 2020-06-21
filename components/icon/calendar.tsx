import React from 'react'
import Icon, { IconProps } from './icon'

export const Calendar: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Calendar" {...props}>
    <path d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V9H22V6C22 4.89543 21.1046 4 20 4H19V3C19 2.44772 18.5523 2 18 2C17.4477 2 17 2.44772 17 3V4H7V3C7 2.44772 6.55228 2 6 2Z" />
    <path d="M22 11H2V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V11Z" />
  </Icon>
)

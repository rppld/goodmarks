import React from 'react'
import Icon, { IconProps } from './icon'

export const ChatBubble: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="ChatBubble" {...props}>
    <path d="M2.01 5c0-1.1.89-2 1.99-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6l-4 4 .01-18z" />
  </Icon>
)

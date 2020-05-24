import React from 'react'
import Icon, { IconProps } from './icon'

export const SpeechBubble: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="SpeechBubble" {...props}>
    <path d="M21.99 5c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
  </Icon>
)

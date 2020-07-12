import React from 'react'
import Icon, { IconProps } from './icon'

export const Checkmark: React.FC<IconProps> = (props) => (
  <Icon a11yTitle="Checkmark" {...props}>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M19.8086 4.23678C20.5064 4.68335 20.71 5.61101 20.2634 6.30877L12.2634 18.8088C12.0386 19.1601 11.6776 19.402 11.2671 19.4762C10.8566 19.5505 10.4337 19.4505 10.1 19.2002L4.10003 14.7002C3.43729 14.2031 3.30297 13.2629 3.80003 12.6002C4.29708 11.9374 5.23729 11.8031 5.90003 12.3002L10.6075 15.8308L17.7366 4.69161C18.1832 3.99384 19.1108 3.79021 19.8086 4.23678Z"
    />
  </Icon>
)

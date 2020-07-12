import React from 'react'
import styles from './checkbox.module.css'
import inputStyles from './input.module.css'
import { CustomCheckboxContainer, CustomCheckboxInput } from '@reach/checkbox'
import { SmallText, Caption } from './text'

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  labelText: string
  help?: React.ReactElement | string
}

function getCheckStyle(checked) {
  return {
    transform: `translate(-50%, -50%) scaleX(${!!checked ? 1 : 0}) scaleY(${
      checked === true ? 1 : checked === 'mixed' ? 0.4 : 0
    })`,
    backgroundColor:
      checked === true
        ? 'var(--color-primary)'
        : checked === 'mixed'
        ? 'goldenrod'
        : 'transparent',
  }
}

const Checkbox: React.FC<Props> = ({ labelText, help, ...props }) => {
  const [checkedState, setChecked] = React.useState(props.checked || false)
  const checked = props.checked != null ? props.checked : checkedState

  return (
    <div>
      <label className={styles.container}>
        <CustomCheckboxContainer
          checked={props.checked != null ? props.checked : checked}
          onChange={(event) => {
            props.onChange(event)
            setChecked(event.target.checked)
          }}
          className={styles.box}
        >
          <CustomCheckboxInput {...props} />
          <span
            aria-hidden
            style={getCheckStyle(checked)}
            className={styles.check}
          />
        </CustomCheckboxContainer>
        <div className={styles.text}>
          <span className={styles.label}>{labelText}</span>
          {help ? (
            <div className={styles.help}>
              <Caption meta>{help}</Caption>
            </div>
          ) : null}
        </div>
      </label>
    </div>
  )
}

export default Checkbox

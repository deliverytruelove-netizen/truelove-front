import containerStyles from './CircleSpinner.module.css'

interface Props {
  style?: React.CSSProperties
  className?: string
}

const CircleSpinner: React.FC<Props> = (props) => {
  const { style, className } = props

  return (
    <svg
      className={`${containerStyles.ring} ${className ?? ''}`}
      viewBox="25 25 50 50"
      strokeWidth="5"
      width="1em"
      height="1em"
      style={style}
    >
      <circle fill="currentColor" cx="50" cy="50" r="20" />
    </svg>
  )
}

export default CircleSpinner

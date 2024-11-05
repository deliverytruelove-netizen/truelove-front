interface Props {
  show: boolean
}

export const AlertFailure: React.FunctionComponent<Props> = ({ show }) => {
  return show ? (
    <div
      className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <span className="font-medium">Danger alert!</span> Change a few things up
      and try submitting again.
    </div>
  ) : (
    <></>
  )
}

export default function Button(props: { onClick: () => void }) {
  return (
    <button
      onClick={() => {
        props.onClick()
      }}
    >
      Click Me
    </button>
  )
}

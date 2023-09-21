export default function Button(props: { onClick: () => void }) {
  return (
    <button
      css={{ color: "blue", margin: "3em", fontWeight: "800" }}
      onClick={() => {
        props.onClick()
      }}
    >
      Click Me
    </button>
  )
}

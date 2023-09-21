import { useStore } from "@builder.io/mitosis"
import MyButton from "./components/button.lite" // note that in Vue, calling this "Button" would conflict with the built-in button element

type Props = {
  message: string
}

export default function MyBasicComponent(props: Props) {
  const state = useStore({
    name: "",
  })

  return (
    <div>
      <div>I can run in ...</div>
      <div>
        {props.message} {state.name}
      </div>
      <MyButton onClick={() => (state.name = "open")} />
    </div>
  )
}

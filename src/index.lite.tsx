import { useStore, onInit } from "@builder.io/mitosis"
import add from "./utils"
import Button from "./button.lite"
import Button2 from "./button.lite"

type Props = {
  message: string
}

export default function MyBasicComponent(props: Props) {
  const state = useStore({
    name: "Foo",
  })

  onInit(() => {
    console.log("Hello world", add(2, 3))
  })
  

  return (
    <div>
      {props.message || "Hello"} {state.name}! I can run in React, Vue, Solid or
      Svelte!
      <Button />
      <Button2 />
    </div>
  )
}

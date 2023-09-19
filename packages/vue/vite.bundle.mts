import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

import getViteConfig from "../../config-helpers"

export default getViteConfig("vue", [vue(), vueJsx()])

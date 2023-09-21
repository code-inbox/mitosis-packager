import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

import getViteConfig from "../../build-utils/config-helpers"

export default getViteConfig("vue3", [vue(), vueJsx()])

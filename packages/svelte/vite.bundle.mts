import {svelte} from "@sveltejs/vite-plugin-svelte"
import sveltePreprocess from "svelte-preprocess"

import getViteConfig from "../../config-helpers"

export default getViteConfig("svelte", [svelte({
    preprocess: [sveltePreprocess({typescript: true})]
})])


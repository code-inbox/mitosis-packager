import {RollupOptions, Plugin} from "rollup"
import path from "path"

import {babel} from "@rollup/plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import typescript, {JsonCompilerOptions} from "@rollup/plugin-typescript"
import {terser} from "rollup-plugin-terser"
import postcss from "rollup-plugin-postcss"
import esbuild from "rollup-plugin-esbuild"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import svelte from "rollup-plugin-svelte"
import sveltePreprocess from "svelte-preprocess"
import vue from "rollup-plugin-vue"

function EntryPoint(
    framework: string,
    optionals: Array<Plugin<unknown>> = [],
    compilerOptions: Partial<JsonCompilerOptions> = {},
    inputPath: string = ""
): RollupOptions {
    return {
        input: `output/${inputPath || framework}/src/index.ts`,
        plugins: [
            peerDepsExternal({
                packageJsonPath: path.resolve(
                    process.cwd(),
                    `packages/${framework}/package.json`
                ),
            }) as unknown as Plugin<unknown>,
            resolve(),
            typescript({
                tsconfig: "tsconfig.bundle.json",
                include: [`output/${framework}/**/*`],
                compilerOptions: {
                    declarationDir: `packages/${framework}/dist`,
                    baseUrl: `packages/${framework}`,
                    ...compilerOptions,
                },
            }),
            ...optionals,
            terser(),
        ],
        output: {
            dir: `packages/${framework}/dist`,
            format: "esm",
            sourcemap: true,
        },
    }
}

const bundle: RollupOptions[] = [
    EntryPoint("react", [esbuild()], {jsx: "react"}),
    EntryPoint(
        "svelte",
        [
            svelte({
                preprocess: sveltePreprocess(),
            }),
            postcss(),
        ],
        {jsx: "react-jsx"}
    ),
    EntryPoint(
        "solid",
        [
            babel({
                extensions: [".js", ".ts", ".jsx", ".tsx"],
                babelHelpers: "bundled",
                presets: [
                    ["babel-preset-solid"],
                    "@babel/preset-typescript",
                    ["@babel/preset-env"],
                ],
            }),
        ],
        {jsx: "preserve"}
    ),
    EntryPoint(
        "vue",
        [vue({}), esbuild(), postcss()],
        {},
        "vue/vue3"
    ),
]

export default bundle

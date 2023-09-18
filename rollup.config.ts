import {RollupOptions} from "rollup"
import path from "path"

import {babel} from "@rollup/plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import {terser} from "rollup-plugin-terser"
import postcss from "rollup-plugin-postcss"
import esbuild from "rollup-plugin-esbuild"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import svelte from "rollup-plugin-svelte"
import sveltePreprocess from "svelte-preprocess"
import vue from "rollup-plugin-vue"

const bundle: RollupOptions[] = [
    {
        input: "output/react/src/index.tsx",
        plugins: [
            peerDepsExternal({
                packageJsonPath: path.resolve(
                    process.cwd(),
                    "packages/react/package.json"
                ),
            }) as any,
            resolve(),
            commonjs(),
            typescript({tsconfig: "packages/react/tsconfig.json"}),
            postcss(),
            esbuild(),
            terser(),
        ],
        output: {
            dir: "packages/react/dist",
            format: "esm",
            sourcemap: true,
        },
    },
    {
        input: "output/svelte/src/index.svelte",
        plugins: [
            peerDepsExternal({
                packageJsonPath: path.resolve(
                    process.cwd(),
                    "packages/svelte/package.json"
                ),
            }) as any,
            resolve(),
            commonjs(),
            typescript({tsconfig: "packages/svelte/tsconfig.json"}),
            postcss(),
            svelte({
                preprocess: sveltePreprocess(),
            }),
            terser(),
        ],
        output: {
            dir: "packages/svelte/dist",
            format: "esm",
            sourcemap: true,
        },
    },
    {
        input: "output/solid/src/index.tsx",
        plugins: [
            peerDepsExternal({
                packageJsonPath: path.resolve(
                    process.cwd(),
                    "packages/solid/package.json"
                ),
            }) as any,
            resolve(),
            commonjs(),
            typescript({tsconfig: "packages/solid/tsconfig.json"}),
            babel({
                extensions: [".js", ".ts", ".jsx", ".tsx"],
                babelHelpers: "bundled",
                presets: [
                    ["babel-preset-solid"],
                    "@babel/preset-typescript",
                    ["@babel/preset-env"],
                ],
            }),
            postcss(),
            terser(),
        ],
        output: {
            dir: "packages/solid/dist",
            format: "esm",
            sourcemap: true,
        },
    },
    {
        input: "output/vue/vue3/src/index.vue",
        plugins: [
            peerDepsExternal({
                packageJsonPath: path.resolve(
                    process.cwd(),
                    "packages/vue/package.json"
                ),
            }) as any,
            typescript({tsconfig: "packages/vue/tsconfig.json"}),
            vue(),
            esbuild(),
            postcss(),
            terser(),
        ],
        output: {
            dir: "packages/vue/dist",
            format: "esm",
            sourcemap: true,
        },
    },
]

export default bundle

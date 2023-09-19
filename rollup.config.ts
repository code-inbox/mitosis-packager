import {RollupOptions, Plugin} from "rollup"
import path from "path"

import resolve from "@rollup/plugin-node-resolve"
import typescript, {JsonCompilerOptions} from "@rollup/plugin-typescript"
import {terser} from "rollup-plugin-terser"
import peerDepsExternal from "rollup-plugin-peer-deps-external"

export function EntryPoint(
    framework: string,
    compilerOptions: Partial<JsonCompilerOptions> = {},
    inputPath: string = ""
): RollupOptions {
    return {
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
                include: [`output/${inputPath || framework}/**/*`],
                compilerOptions: {
                    declarationDir: `packages/${framework}/dist`,
                    baseUrl: `packages/${framework}`,
                    ...compilerOptions,
                },
            }),
            terser(),
        ],
        output: {
            dir: `packages/${framework}/dist`,
            format: "esm",
            sourcemap: true,
        },
    }
}


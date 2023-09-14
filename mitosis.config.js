/** @type {import('@builder.io/mitosis').MitosisConfig} */
module.exports = {
  files: "src/**",
  targets: ["vue3", "solid", "svelte", "react"],
  options: {
    react: {
      typescript: true,
    },
    solid: {
      typescript: true,
    },
    vue3: {
      typescript: true,
    },
    svelte: {
      typescript: true,
    },
  },
}

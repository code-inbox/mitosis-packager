# Mitosis Packager

![mitosis-logo](https://github.com/code-inbox/mitosis-packager/assets/11192814/3cce06d1-7b04-43ac-8ddb-562c695de7ae)

This is a boilerplate project for turning [Mitosis](https://github.com/BuilderIO/mitosis/tree/main/docs) output into publishable UI packages.

It is essentially a bundling / packaging layer on top of Mitosis, and it allows you to write your UI component just once, and have it generate multiple packages targeted at different UI frameworks (currently supporting React, Svelte, Solid, Vue3).

The resulting bundles also include type declaration files.

## Usage

The following command will generate a new project in the current directory with the name `your-library-name`, and install all dependencies.

```
npx create-multi-lib <your-library-name>
```

For more information, see this video:

[![Demo of create-multi-lib on Youtube](https://img.youtube.com/vi/m1vCRogZ6HA/hqdefault.jpg)](https://www.youtube.com/watch?v=m1vCRogZ6HA)

## Development

Mitosis supports a wide range of frameworks, and so far we only support four: `svelte`, `react`, `vue3` and `solid-js`. If you want to add support for another framework, you can do so by adding a new `@mitosis-packager/frameworks/<framework>` directory, and implement the following modules:

- `mitosis-packager/frameworks/<framework>/cypress.config.ts` - Cypress configuration file. This is mainly used to configure the development server for the Cypress tests (which is likely to vary by framework).

- `mitosis-packager/frameworks/<framework>/mount.ts` - This is used by the Cypress tests to mount the component in the test runner. For some frameworks, Cypress already provides this module (e.g. `import {mount} from 'cypress/react18'`), but for others you will need to implement it yourself (for an example, see `mitosis-packager/frameworks/solid/mount.ts`).

- `mitosis-packager/frameworks/<framework>/package.json` - This is the package.json file for the framework. The target framework should likely be added here as a peer dependency. Dependencies that are necessary for testing or running development servers should be added as devDependencies.

- `mitosis-packager/frameworks/<framework>/vite.bundle.mts` - This is where you configure your Vite bundler. You can add plugins, configure the output directory, etc. This is also where you configure the framework-specific Vite plugins (e.g. `vite-plugin-solid-js`).

The same smoke tests (i.e. those found in `mitosis-packager/template/cypress/test.cy.ts`) will run for all frameworks, so if all tests pass, you can be confident that your newly-added framework is successfully supported.

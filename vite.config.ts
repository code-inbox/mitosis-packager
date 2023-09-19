// Note: this is only used for the Cypress test suite to serve components
import {defineConfig} from 'vite'

export default defineConfig({
    logLevel: "error",
    resolve: {
        alias: {
            '@': process.cwd(),
        }
    },
    server: {
        fs: {
            // Allow serving the test file from the project root
            allow: ['../../cypress/test.cy.ts'],
        },
    },
})
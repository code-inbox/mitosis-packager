import {getContainerEl, setupHooks} from "@cypress/mount-utils"
import {render} from "solid-js/web"

let dispose: () => void | undefined

function cleanup() {
    dispose?.()
}

export type Ui = () => JSX.Element
interface Options {
    log?: boolean
}
function mount(Component: Ui, options: Options = {}) {
    const root = getContainerEl()
    dispose = render(() => Component({}), root)

    return cy.wait(0, {log: false}).then(() => {
        if (options.log) {
            Cypress.log({
                name: "mount",
                message: "Mounted component",
            })
        }
    })
}

setupHooks(cleanup)


// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
    namespace Cypress {
        interface Chainable {
            mount: typeof mount
        }
    }
}

Cypress.Commands.add('mount', mount)

// Example use:
// cy.mount(MyComponent)
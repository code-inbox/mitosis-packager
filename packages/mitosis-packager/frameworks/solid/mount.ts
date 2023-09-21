import {getContainerEl, setupHooks} from "@cypress/mount-utils"
import {render} from "solid-js/web"

let dispose: () => void | undefined

function cleanup() {
    dispose?.()
}

export type Ui = (props: any) => JSX.Element
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

Cypress.Commands.add('mount', mount)
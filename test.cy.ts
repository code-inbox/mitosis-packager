/* eslint-disable @typescript-eslint/no-namespace */
import Button from "@/dist"

declare global {
    namespace Cypress {
        interface Chainable {
            mount: (component: unknown) => Chainable<unknown>;
        }
    }
}

describe("Smoke tests", () => {
    it("Mounts with a clickable button", () => {
        cy.mount(Button)
        cy.contains("Click Me").click()
        cy.contains("open")
    })
})

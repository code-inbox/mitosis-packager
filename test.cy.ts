/* eslint-disable @typescript-eslint/no-namespace */
import {Main as Button} from "@/dist"

declare global {
    namespace Cypress {
        interface Chainable {
            mount: (component: unknown) => Chainable<unknown>
        }
    }
}

describe("Smoke tests", () => {
    it("Mounts with a clickable button", () => {
        cy.mount(Button)
        cy.contains("Click Me").click()
        cy.contains("open")
    })
    it("Has inline CSS", () => {
        cy.mount(Button)
        cy.contains("Click Me").should(
            "have.css",
            "font-weight",
            "800"
        )
    })
})

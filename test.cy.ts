import Button from "@/dist"

describe("Smoke tests", () => {
    it("Mounts", () => {
        cy.mount(Button)
        cy.contains("Click Me").click()
        cy.contains("open")
    })
})

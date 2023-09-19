import {mount} from 'cypress/react18'
import {createElement} from 'react'


Cypress.Commands.add('mount', (Component: React.FunctionComponent) => mount(createElement(Component)))

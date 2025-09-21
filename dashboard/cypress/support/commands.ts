/// <reference types="cypress" />

// Custom commands for authentication testing

Cypress.Commands.add('mockGoogleAuth', (email: string = 'peb7268@gmail.com') => {
  // Mock the NextAuth session with Google OAuth data
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        name: 'Paul',
        email: email,
        image: 'https://lh3.googleusercontent.com/a/ACg8ocKwvsjUM5iWu-eOlwCVaYrCqTEW-m6NieOhFEgHvUD1QkhgyF_3SQ=s96-c',
        id: '105532676327211000147',
        role: 'user',
        teamId: null
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }).as('session');
});

Cypress.Commands.add('loginWithGoogle', () => {
  // Since browser is already authenticated with Google,
  // we simulate the OAuth callback success
  cy.visit('/api/auth/callback/google?state=mock-state&code=mock-code');
  cy.wait(500); // Wait for auth processing
});

Cypress.Commands.add('checkDashboardAccess', () => {
  cy.url().should('include', '/dashboard');
  cy.get('body').should('be.visible');
});

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      mockGoogleAuth(email?: string): Chainable<void>;
      loginWithGoogle(): Chainable<void>;
      checkDashboardAccess(): Chainable<void>;
    }
  }
}

export {};
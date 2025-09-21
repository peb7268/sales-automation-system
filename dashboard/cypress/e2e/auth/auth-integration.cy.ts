/// <reference types="cypress" />

describe('Authentication Integration', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Sign In Page', () => {
    it('should redirect to sign in when not authenticated', () => {
      cy.url().should('include', '/auth/signin');
    });

    it('should display sign in form', () => {
      cy.visit('/auth/signin');
      cy.get('#signin-email').should('be.visible');
      cy.get('#signin-password').should('be.visible');
      cy.contains('button', 'Sign In').should('be.visible');
    });

    it('should display Google SSO button', () => {
      cy.visit('/auth/signin');
      cy.contains('button', 'Sign in with Google').should('be.visible');
    });

    it('should allow switching between sign in and sign up', () => {
      cy.visit('/auth/signin');
      cy.contains('Sign Up').click();
      cy.get('#signup-name').should('be.visible');
      cy.contains('Sign In').click();
      cy.get('#signup-name').should('not.exist');
    });
  });

  describe('Credentials Authentication', () => {
    it('should sign in with valid credentials', () => {
      // Set up intercept before visiting page
      cy.intercept('POST', '/api/auth/callback/credentials').as('auth');
      
      cy.visit('/auth/signin');
      cy.get('#signin-email').type('admin@milehighmarketing.com');
      cy.get('#signin-password').type('admin123');
      cy.contains('button', 'Sign In').click();
      
      // Wait for authentication request
      cy.wait('@auth', { timeout: 10000 });
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
      cy.contains('Sales Pipeline').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/auth/signin');
      cy.get('#signin-email').type('invalid@example.com');
      cy.get('#signin-password').type('wrongpassword');
      cy.contains('button', 'Sign In').click();
      
      // Should show error message
      cy.contains('Invalid email or password', { timeout: 5000 }).should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/auth/signin');
      cy.get('#signin-email').type('invalid-email');
      cy.get('#signin-password').type('password');
      cy.contains('button', 'Sign In').click();
      
      // HTML5 validation should prevent submission
      cy.url().should('include', '/auth/signin');
    });
  });

  describe('Sign Up Flow', () => {
    const timestamp = Date.now();
    const newUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    it('should create new account', () => {
      cy.visit('/auth/signin');
      cy.contains('Sign Up').click();
      
      cy.get('#signup-name').type(newUser.name);
      cy.get('#signup-email').type(newUser.email);
      cy.get('#signup-password').type(newUser.password);
      cy.get('#signup-confirm-password').type(newUser.password);
      cy.contains('button', 'Sign Up').click();
      
      // Wait for signup and redirect
      cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
      cy.contains('Sales Pipeline').should('be.visible');
    });

    it('should not allow duplicate email registration', () => {
      cy.visit('/auth/signin');
      cy.contains('Sign Up').click();
      
      cy.get('#signup-name').type('Another User');
      cy.get('#signup-email').type('admin@milehighmarketing.com'); // Existing email
      cy.get('#signup-password').type('password123');
      cy.get('#signup-confirm-password').type('password123');
      cy.contains('button', 'Sign Up').click();
      
      // Should show error
      cy.contains('Email already exists', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Protected Routes', () => {
    it('should protect dashboard route', () => {
      // Try to access dashboard directly without auth
      cy.visit('/', { failOnStatusCode: false });
      
      // Should redirect to sign in
      cy.url().should('include', '/auth/signin');
    });

    it('should maintain session after login', () => {
      // Sign in
      cy.visit('/auth/signin');
      cy.get('#signin-email').type('admin@milehighmarketing.com');
      cy.get('#signin-password').type('admin123');
      cy.contains('button', 'Sign In').click();
      
      // Wait for authentication and navigation
      cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
      
      // Refresh page - should still be authenticated
      cy.reload();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Sales Pipeline').should('be.visible');
    });
  });

  describe('Sign Out', () => {
    beforeEach(() => {
      // Sign in first
      cy.visit('/auth/signin');
      cy.get('#signin-email').type('admin@milehighmarketing.com');
      cy.get('#signin-password').type('admin123');
      cy.contains('button', 'Sign In').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
    });

    it('should sign out and redirect to sign in', () => {
      // Look for sign out button (might be in a menu)
      cy.get('body').then($body => {
        if ($body.find('button:contains("Sign Out")').length) {
          cy.contains('button', 'Sign Out').click();
        } else if ($body.find('[aria-label="User menu"]').length) {
          cy.get('[aria-label="User menu"]').click();
          cy.contains('Sign Out').click();
        } else {
          // If no visible sign out, try API route
          cy.request('POST', '/api/auth/signout');
        }
      });
      
      // Should redirect to sign in
      cy.visit('/');
      cy.url().should('include', '/auth/signin');
    });
  });
});
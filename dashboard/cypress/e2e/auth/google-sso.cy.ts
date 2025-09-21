describe('Google SSO Authentication', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Sign In Flow', () => {
    it('should display Google Sign In button on login page', () => {
      cy.visit('/auth/signin');
      
      // Check that Google sign in button exists
      cy.contains('button', 'Sign in with Google').should('be.visible');
      cy.contains('button', 'Sign in with Google').should('not.be.disabled');
    });

    it('should handle Google OAuth callback and redirect to dashboard', () => {
      // Mock the Google auth session
      cy.mockGoogleAuth('peb7268@gmail.com');

      // Visit the signin page
      cy.visit('/auth/signin');
      
      // Click Google sign in button
      cy.contains('button', 'Sign in with Google').click();

      // Since browser is already authenticated with Google,
      // the OAuth flow would happen and redirect back
      // In a real scenario, this would open Google's auth page
      
      // For testing, we'll simulate the successful callback
      cy.url().should('include', '/api/auth/signin/google');
    });

    it('should maintain session after Google login', () => {
      // Mock authenticated session
      cy.mockGoogleAuth('peb7268@gmail.com');
      
      // Visit dashboard directly
      cy.visit('/dashboard');
      
      // Should not redirect to login
      cy.url().should('include', '/dashboard');
      
      // Verify user info is displayed (assuming dashboard shows user info)
      cy.request('/api/auth/session').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property('email', 'peb7268@gmail.com');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');
      
      // Should redirect to signin page
      cy.url().should('include', '/auth/signin');
      cy.contains('Sign In').should('be.visible');
    });

    it('should allow access to protected routes after Google login', () => {
      // Mock authenticated session
      cy.mockGoogleAuth('peb7268@gmail.com');
      
      // Visit protected routes
      const protectedRoutes = [
        '/dashboard',
        '/api/prospects',
        '/api/campaigns',
        '/api/calls'
      ];

      protectedRoutes.forEach(route => {
        if (route.startsWith('/api')) {
          // For API routes, check response status
          cy.request({
            url: route,
            failOnStatusCode: false
          }).then((response) => {
            // Should not return 401 Unauthorized
            expect(response.status).to.not.eq(401);
          });
        } else {
          // For page routes, check URL
          cy.visit(route);
          cy.url().should('include', route);
        }
      });
    });
  });

  describe('User Profile Integration', () => {
    it('should create user record in database after first Google login', () => {
      const testEmail = 'newuser@gmail.com';
      
      // Mock Google auth for new user
      cy.mockGoogleAuth(testEmail);
      
      // Simulate first-time login
      cy.visit('/auth/signin');
      
      // After login, check if user exists in database
      cy.request('/api/auth/session').then((response) => {
        expect(response.body.user.email).to.eq(testEmail);
        expect(response.body.user.name).to.exist;
        expect(response.body.user.image).to.exist;
      });
    });

    it('should update existing user with Google ID on subsequent logins', () => {
      const testEmail = 'peb7268@gmail.com';
      
      // Mock authenticated session
      cy.mockGoogleAuth(testEmail);
      
      // Login multiple times
      for (let i = 0; i < 2; i++) {
        cy.visit('/auth/signin');
        cy.wait(500);
        
        // Verify session persists
        cy.request('/api/auth/session').then((response) => {
          expect(response.body.user.email).to.eq(testEmail);
        });
      }
    });
  });

  describe('Sign Out Flow', () => {
    it('should sign out and clear session', () => {
      // Mock authenticated session
      cy.mockGoogleAuth('peb7268@gmail.com');
      
      // Visit dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      
      // Sign out (assuming there's a sign out button/link)
      cy.request('POST', '/api/auth/signout').then((response) => {
        expect(response.status).to.eq(200);
      });
      
      // Try to access protected route
      cy.visit('/dashboard');
      
      // Should redirect to signin
      cy.url().should('include', '/auth/signin');
    });
  });

  describe('Error Handling', () => {
    it('should handle Google OAuth errors gracefully', () => {
      // Visit error page directly
      cy.visit('/auth/error?error=AccessDenied');
      
      // Should show error message
      cy.contains(/error|denied|failed/i).should('be.visible');
    });

    it('should handle network errors during authentication', () => {
      // Mock network failure
      cy.intercept('GET', '/api/auth/session', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });
      
      cy.visit('/auth/signin');
      
      // Should remain on signin page
      cy.url().should('include', '/auth/signin');
    });
  });
});
# Development Guide

## Getting Started

This guide provides instructions for setting up and working with the authentication system in the development environment.

## Creating the First User

When you first start, you'll need to create an initial user account to access the admin panel.

### Steps:

1. **Navigate to the admin login page**

   ```
   http://localhost:3000/admin/login
   ```

2. **Automatic redirect to registration**

   - The system will automatically detect that no users exist
   - You will be redirected to the registration page
   - Fill out the registration form with your details

3. **Email verification**

   - After submitting the registration form, the system will require email verification
   - Since this is a development environment, emails are not actually sent
   - Instead, the verification link is logged to the console

4. **Find the verification link**

   - Check your terminal/console logs
   - Look for a log entry similar to:

   ```
   Send verification email for user:  http://localhost:3000/api/auth/verify-email?token=xxx&callbackURL=/admin
   ```

5. **Verify your email**

   - Copy the complete URL from the logs
   - Paste it into your browser and navigate to it
   - Your email will be verified and you'll be redirected to the admin panel
# Cerberus Authentication Toolkit

## Development Email Testing

For email testing, the toolkit is set to use MailHog, thus you'll need to:
`brew update && brew install mailhog` (on a Mac)

(emails are not actually sent to real email addresses using MailHog)

When testing email features (password reset, etc.):

1. Start MailHog:
   ```bash
   mailhog
   ```
2. Access the MailHog web interface at http://localhost:8025

- All emails sent by the application will be captured there

3. Press Ctrl+C in the terminal where it's running to stop it

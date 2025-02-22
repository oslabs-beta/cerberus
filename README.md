# Cerberus Authentication Toolkit

reference: https://github.com/CodesmithLLC/PRO-README?tab=readme-ov-file

## About

## Product Description

## Get Started

## Database Setup

## Development Email Testing

For email testing, the toolkit is set to use MailHog, thus you'll need to:
`brew update && brew install mailhog` (on a Mac)

\*MailHog doesn't actually send emails, it's just for testing purposes.
For production you may consider using SendGrid, Mailgun, Amazon SES, Postmark, Twilio SendGrid - these services invest in infrastructure, anti-spam measures, customer support to handle large email volumes, provide analytics and tracking (e.g., open rates, delivery status), built-in security features (e.g., encryption, SPF/DKIM/DMARC support), and compliance with regulations (e.g., GDPR, CAN-SPAM).

- Open-Source SMTP Servers: Postfix, Exim, Sendmail.

When testing email features (password reset, etc.):

1. Start MailHog:
   ```bash
   mailhog
   ```
2. Access the MailHog web interface at http://localhost:8025

- All emails sent by the application will be captured there

3. To stop: Press Ctrl+C in the terminal where it's running

## Contributors

## Feedback and Contributions

## License

## Contacts

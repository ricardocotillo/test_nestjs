# Email Parser NestJS Application

## Overview

This NestJS application demonstrates how to parse email content with attachments and extract JSON data. It provides multiple endpoints for serving email files and parsing their contents.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Implementation Details](#implementation-details)

## Features

- Parse email content from a file path or URL
- Extract JSON data from email attachments
- Serve email files directly via API
- Serve HTML page with a link to download email files
- Support for various JSON locations within an email:
  - As a file attachment
  - Inside the body of the email as a link
  - Inside the body of the email as text
  - Link in the body that leads to a webpage with a link to JSON

## Project Structure

```
src/
├── app.controller.ts       # Main application controller
├── app.module.ts           # Main application module
├── app.service.ts          # Main application service
├── main.ts                 # Application entry point
└── email/                  # Email module directory
    ├── email.module.ts     # Email module definition
    ├── email-parser.controller.ts  # Controller for parsing emails
    ├── email-parser.service.ts     # Service for parsing emails
    ├── email-file.controller.ts    # Controller for serving email files
    ├── html-page.controller.ts     # Controller for serving HTML page
    ├── test.eml            # Sample email file
views/
└── email-link.hbs      # Handlebars template for email link page
```

## Installation

```bash
# Install dependencies
$ npm install
```

## Running the Application

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## API Documentation

### 1. Parse Email Content

Parse an email file and extract JSON content.

```http
GET /email-parser/parse?emailPath=<path_or_url_to_email>
```

**Parameters:**

- `emailPath` (required): Path to a local email file or URL to a remote email file

**Response:**

The JSON content extracted from the email.

**Example:**

```http
GET /email-parser/parse?emailPath=/path/to/email.eml
```

```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  }
}
```

### 2. Download Email File

Download a sample email file.

```http
GET /email-file
```

**Response:**

The email file as an attachment with Content-Type: message/rfc822.

### 3. HTML Page with Email Link

View an HTML page with a link to download the email file.

```http
GET /html-page
```

**Response:**

An HTML page containing a link to download the email file and instructions for using the email parser API.

## Implementation Details

### Email Parser Service

The `EmailParserService` is responsible for parsing email content and extracting JSON data. It supports various scenarios:

1. **JSON as a file attachment**: The service checks for attachments with .json extension or application/json content type.

2. **JSON in the email body**: The service searches for JSON content directly in the email body text.

3. **JSON as a link in the email body**: The service extracts links from the email body and checks if any of them point to JSON files.

4. **JSON from linked webpages**: The service follows links in the email body to find webpages that might contain links to JSON files.

### Email File Controller

The `EmailFileController` serves a sample email file. It reads the file from the filesystem and sends it as an attachment with the appropriate MIME type.

### HTML Page Controller

The `HtmlPageController` serves an HTML page with a link to download the email file. It uses NestJS's built-in template rendering with Handlebars (`@Render()` decorator) to render the view template located in the `views` directory.

### Module Structure

The application uses NestJS's modular architecture:

- `AppModule`: The main application module that imports all other modules.
- `EmailModule`: Contains all email-related functionality, including controllers and services.

### Template Rendering

The application uses Handlebars (hbs) as the template engine for rendering views. The templates are stored in the `views` directory at the project root. The main.ts file configures NestJS to use the Handlebars engine and sets the base views directory.

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## License

This project is [MIT licensed](LICENSE).

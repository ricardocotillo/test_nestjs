import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('html-page')
export class HtmlPageController {
  @Get()
  serveHtmlPage(@Req() request: Request): string {
    // Get the base URL from the request
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Create the email file URL
    const emailFileUrl = `${baseUrl}/email-file`;
    
    // Create a simple HTML page with a link to the email file
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email File Link</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          .email-link {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .email-link:hover {
            background-color: #45a049;
          }
          .note {
            font-size: 0.9em;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email File Link</h1>
          <p>Click the button below to download the test email file:</p>
          <a href="${emailFileUrl}" class="email-link">Download Email File</a>
          <p>This email contains a JSON attachment that can be parsed using the email-parser endpoint.</p>
          <div class="note">
            <p>You can also use the email parser API to extract the JSON content:</p>
            <code>GET /email-parser/parse?emailPath=${emailFileUrl}</code>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('html-page')
export class HtmlPageController {
  @Get()
  serveHtmlPage(@Req() request: Request, @Res() res: Response): void {
    try {
      // Get the base URL from the request
      const protocol = request.protocol;
      const host = request.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      // Create the email file URL
      const emailFileUrl = `${baseUrl}/email-file`;
      
      // Path to the HTML template file
      const htmlFilePath = path.join(process.cwd(), 'src', 'email', 'static', 'email-link.html');
      
      // Read the HTML template file
      let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
      
      // Replace placeholders with actual values
      htmlContent = htmlContent.replace(/\{\{emailFileUrl\}\}/g, emailFileUrl);
      
      // Set content type and send the HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      res.status(500).send(`Error serving HTML page: ${error.message}`);
    }
  }
}

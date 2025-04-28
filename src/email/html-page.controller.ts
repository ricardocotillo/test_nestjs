import { Controller, Get, Req, Render } from '@nestjs/common';
import { Request } from 'express';

@Controller('html-page')
export class HtmlPageController {
  @Get()
  @Render('email-link')
  serveHtmlPage(@Req() request: Request) {
    // Get the base URL from the request
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Create the email file URL
    const emailFileUrl = `${baseUrl}/email-file`;
    
    // Return data object with variables to be used in the template
    return { emailFileUrl };
  }
}

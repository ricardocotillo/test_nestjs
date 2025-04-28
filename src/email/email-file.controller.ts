import { Controller, Get, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('email-file')
export class EmailFileController {
  private readonly emailFilePath: string;

  constructor() {
    // Path to the test email file
    this.emailFilePath = path.join(process.cwd(), 'src', 'email', 'test.eml');
  }

  @Get()
  @Header('Content-Type', 'message/rfc822')
  @Header('Content-Disposition', 'attachment; filename="test.eml"')
  serveEmailFile(@Res() res: Response): void {
    try {
      // Check if the file exists
      if (!fs.existsSync(this.emailFilePath)) {
        res.status(404).send('Email file not found');
        return;
      }

      // Create a read stream and pipe it to the response
      const fileStream = fs.createReadStream(this.emailFilePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).send(`Error serving email file: ${error.message}`);
    }
  }
}

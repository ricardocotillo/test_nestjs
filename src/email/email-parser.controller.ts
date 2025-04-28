import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';

@Controller('email-parser')
export class EmailParserController {
  constructor(private readonly emailParserService: EmailParserService) {}

  @Get('parse')
  async parseEmail(@Query('emailPath') emailPath: string) {
    if (!emailPath) {
      throw new HttpException('Email path is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const jsonContent = await this.emailParserService.parseEmailFile(emailPath);
      return jsonContent;
    } catch (error) {
      throw new HttpException(
        `Failed to parse email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

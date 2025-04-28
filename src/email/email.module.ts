import { Module } from '@nestjs/common';
import { EmailParserController } from './email-parser.controller';
import { EmailParserService } from './email-parser.service';
import { EmailFileController } from './email-file.controller';
import { HtmlPageController } from './html-page.controller';

@Module({
  controllers: [EmailParserController, EmailFileController, HtmlPageController],
  providers: [EmailParserService],
  exports: [EmailParserService],
})
export class EmailModule {}

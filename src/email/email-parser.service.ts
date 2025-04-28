import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { simpleParser, ParsedMail } from 'mailparser';
import { Readable } from 'stream';

@Injectable()
export class EmailParserService {
  /**
   * Parse an email file and extract JSON attachments
   * @param emailPath Path or URL to the email file
   * @returns The JSON content from the email
   */
  async parseEmailFile(emailPath: string): Promise<any> {
    try {
      // Check if the input is a URL or a file path
      if (emailPath.startsWith('http://') || emailPath.startsWith('https://')) {
        return this.parseEmailFromUrl(emailPath);
      } else {
        return this.parseEmailFromFile(emailPath);
      }
    } catch (error) {
      throw new Error(`Failed to parse email: ${error.message}`);
    }
  }

  /**
   * Parse email from a local file
   */
  private async parseEmailFromFile(filePath: string): Promise<any> {
    try {
      // Read the email file
      const emailContent = fs.readFileSync(filePath);
      return this.extractJsonFromEmail(await simpleParser(emailContent));
    } catch (error) {
      throw new Error(`Failed to read email file: ${error.message}`);
    }
  }

  /**
   * Parse email from a URL
   */
  private async parseEmailFromUrl(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch email: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      const emailContent = Buffer.from(buffer);
      return this.extractJsonFromEmail(await simpleParser(emailContent));
    } catch (error) {
      throw new Error(`Failed to fetch email from URL: ${error.message}`);
    }
  }

  /**
   * Extract JSON from parsed email
   * Handles the following cases:
   * 1. JSON as a file attachment
   * 2. JSON inside the body of the email as a link
   * 3. JSON inside the body of the email as text
   * 4. Link in the body that leads to a webpage with a link to JSON
   */
  private async extractJsonFromEmail(parsedEmail: ParsedMail): Promise<any> {
    // Case 1: Check for JSON attachments
    const jsonAttachment = this.findJsonAttachment(parsedEmail);
    if (jsonAttachment) {
      return this.parseJsonContent(jsonAttachment.content.toString());
    }

    // Case 2 & 3: Check for JSON in the email body (as text or link)
    const jsonFromBody = await this.extractJsonFromBody(parsedEmail);
    if (jsonFromBody) {
      return jsonFromBody;
    }

    // Case 4: Check for links in the body that might lead to JSON
    const jsonFromLinks = await this.extractJsonFromBodyLinks(parsedEmail);
    if (jsonFromLinks) {
      return jsonFromLinks;
    }

    throw new Error('No JSON content found in the email');
  }

  /**
   * Find JSON attachments in the email
   */
  private findJsonAttachment(parsedEmail: ParsedMail): any {
    if (!parsedEmail.attachments || parsedEmail.attachments.length === 0) {
      return null;
    }

    return parsedEmail.attachments.find(attachment => {
      const filename = attachment.filename?.toLowerCase() || '';
      const contentType = attachment.contentType?.toLowerCase() || '';
      
      return filename.endsWith('.json') || 
             contentType === 'application/json' ||
             contentType === 'text/json';
    });
  }

  /**
   * Extract JSON from email body
   */
  private async extractJsonFromBody(parsedEmail: ParsedMail): Promise<any> {
    const bodyText = parsedEmail.text || '';
    const bodyHtml = parsedEmail.html || '';
    
    // Try to find JSON content in the text body
    try {
      // Look for content that might be JSON (between curly braces)
      const jsonMatch = bodyText.match(/{[\s\S]*?}/);
      if (jsonMatch) {
        const possibleJson = jsonMatch[0];
        return this.parseJsonContent(possibleJson);
      }
    } catch (error) {
      // Not valid JSON, continue to other methods
    }

    // Extract links from HTML body that might be direct links to JSON
    const directJsonLinks = this.extractLinksFromHtml(bodyHtml)
      .filter(link => link.endsWith('.json'));
    
    // Try each link that might be a direct JSON link
    for (const link of directJsonLinks) {
      try {
        const response = await fetch(link);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('json')) {
            const jsonText = await response.text();
            return this.parseJsonContent(jsonText);
          }
        }
      } catch (error) {
        // Failed to fetch or parse this link, try the next one
      }
    }

    return null;
  }

  /**
   * Extract JSON from links in the email body that lead to webpages with JSON links
   */
  private async extractJsonFromBodyLinks(parsedEmail: ParsedMail): Promise<any> {
    const bodyHtml = parsedEmail.html || '';
    
    // Extract all links from the HTML body
    const links = this.extractLinksFromHtml(bodyHtml);
    
    // Try each link to see if it leads to a page with JSON links
    for (const link of links) {
      try {
        const response = await fetch(link);
        if (!response.ok) continue;
        
        const html = await response.text();
        
        // Extract links from this webpage
        const pageLinks = this.extractLinksFromHtml(html)
          .filter(pageLink => pageLink.endsWith('.json'));
        
        // Try each JSON link found on the page
        for (const jsonLink of pageLinks) {
          try {
            const jsonResponse = await fetch(jsonLink);
            if (jsonResponse.ok) {
              const contentType = jsonResponse.headers.get('content-type');
              if (contentType && contentType.includes('json')) {
                const jsonText = await jsonResponse.text();
                return this.parseJsonContent(jsonText);
              }
            }
          } catch (error) {
            // Failed to fetch or parse this JSON link, try the next one
          }
        }
      } catch (error) {
        // Failed to fetch or parse this page, try the next link
      }
    }

    return null;
  }

  /**
   * Extract links from HTML content
   */
  private extractLinksFromHtml(html: string): string[] {
    const links: string[] = [];
    const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    
    return links;
  }

  /**
   * Parse JSON content safely
   */
  private parseJsonContent(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON content: ${error.message}`);
    }
  }
}

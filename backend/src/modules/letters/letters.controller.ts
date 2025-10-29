import { Controller, Get, Param, Query } from '@nestjs/common';
import { LettersService } from './letters.service';

@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get()
  async getLetters(@Query('limit') limit?: number) {
    return this.lettersService.getLetters(limit);
  }

  @Get(':id')
  async getLetter(@Param('id') id: string) {
    return this.lettersService.getLetter(+id);
  }

  @Get('progress/:userId')
  async getLetterProgress(@Param('userId') userId: string) {
    return this.lettersService.getLetterProgress(userId);
  }
}

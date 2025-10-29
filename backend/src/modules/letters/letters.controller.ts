import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
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

  @Post('progress')
  async updateLetterProgress(@Body() body: { letterId: number; completed: boolean }) {
    return this.lettersService.updateLetterProgress(body.letterId, body.completed);
  }

  @Get('progress/:userId')
  async getLetterProgress(@Param('userId') userId: string) {
    return this.lettersService.getLetterProgress(userId);
  }
}

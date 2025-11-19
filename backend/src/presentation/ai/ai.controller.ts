import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatUseCase } from '@application/use-cases/ai/chat.use-case';
import { CreateConversationUseCase } from '@application/use-cases/conversation/create-conversation.use-case';
import { GetConversationsUseCase } from '@application/use-cases/conversation/get-conversations.use-case';
import { ChatRequestDto } from '@application/dtos/ai.dto';
import { CreateConversationDto } from '@application/dtos/conversation.dto';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(
    private readonly chatUseCase: ChatUseCase,
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
  ) {}

  @Post('conversations')
  async createConversation(
    @Request() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.createConversationUseCase.execute(req.user.id, dto);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.getConversationsUseCase.execute(req.user.id);
  }

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto) {
    return this.chatUseCase.execute(dto);
  }
}


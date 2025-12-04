import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProcessInboxUseCase } from '@application/use-cases/inbox/process-inbox.use-case';
import { GetInboxItemsUseCase } from '@application/use-cases/inbox/get-inbox-items.use-case';
import { GetInboxItemUseCase } from '@application/use-cases/inbox/get-inbox-item.use-case';
import { AcceptSuggestionUseCase } from '@application/use-cases/inbox/accept-suggestion.use-case';
import { DiscardSuggestionUseCase } from '@application/use-cases/inbox/discard-suggestion.use-case';
import { DeleteInboxItemUseCase } from '@application/use-cases/inbox/delete-inbox-item.use-case';
import {
  ProcessInboxDto,
  AcceptSuggestionDto,
  DiscardSuggestionDto,
  InboxItemResponseDto,
  ActionSuggestionDto,
} from '@application/dtos/inbox.dto';
import { InboxItemStatus } from '@domain/entities/inbox-item.entity';
import { PriorityResponseDto } from '@application/dtos/priority.dto';
import { TaskResponseDto } from '@application/dtos/task.dto';

@Controller('inbox')
@UseGuards(AuthGuard('jwt'))
export class InboxController {
  constructor(
    private readonly processInboxUseCase: ProcessInboxUseCase,
    private readonly getInboxItemsUseCase: GetInboxItemsUseCase,
    private readonly getInboxItemUseCase: GetInboxItemUseCase,
    private readonly acceptSuggestionUseCase: AcceptSuggestionUseCase,
    private readonly discardSuggestionUseCase: DiscardSuggestionUseCase,
    private readonly deleteInboxItemUseCase: DeleteInboxItemUseCase,
  ) {}

  @Post()
  async processInbox(
    @Request() req: any,
    @Body() dto: ProcessInboxDto,
  ): Promise<{ inboxItemId: string; suggestions: ActionSuggestionDto[] }> {
    return this.processInboxUseCase.execute(req.user.id, dto);
  }

  @Get()
  async getInboxItems(
    @Request() req: any,
    @Query('status') status?: InboxItemStatus,
  ): Promise<{ items: InboxItemResponseDto[] }> {
    const items = await this.getInboxItemsUseCase.execute(req.user.id, {
      status,
    });
    return { items };
  }

  @Get(':id')
  async getInboxItem(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<InboxItemResponseDto> {
    return this.getInboxItemUseCase.execute(req.user.id, id);
  }

  @Post(':id/accept')
  async acceptSuggestion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AcceptSuggestionDto,
  ): Promise<{ priority: PriorityResponseDto; task: TaskResponseDto }> {
    return this.acceptSuggestionUseCase.execute(req.user.id, id, dto);
  }

  @Post(':id/discard')
  async discardSuggestion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: DiscardSuggestionDto,
  ): Promise<{ success: boolean }> {
    return this.discardSuggestionUseCase.execute(req.user.id, id, dto);
  }

  @Delete(':id')
  async deleteInboxItem(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.deleteInboxItemUseCase.execute(req.user.id, id);
  }
}


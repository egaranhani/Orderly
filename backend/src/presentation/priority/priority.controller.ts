import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreatePriorityUseCase } from '@application/use-cases/priority/create-priority.use-case';
import { GetPrioritiesUseCase } from '@application/use-cases/priority/get-priorities.use-case';
import { GetPriorityUseCase } from '@application/use-cases/priority/get-priority.use-case';
import { UpdatePriorityUseCase } from '@application/use-cases/priority/update-priority.use-case';
import { MovePriorityUseCase } from '@application/use-cases/priority/move-priority.use-case';
import { ReorderPrioritiesUseCase } from '@application/use-cases/priority/reorder-priorities.use-case';
import { ArchivePriorityUseCase } from '@application/use-cases/priority/archive-priority.use-case';
import { DeletePriorityUseCase } from '@application/use-cases/priority/delete-priority.use-case';
import { GetTasksUseCase } from '@application/use-cases/task/get-tasks.use-case';
import { CreateTaskUseCase } from '@application/use-cases/task/create-task.use-case';
import {
  CreatePriorityDto,
  UpdatePriorityDto,
  MovePriorityDto,
  ReorderPrioritiesDto,
  PriorityResponseDto,
} from '@application/dtos/priority.dto';
import {
  CreateTaskDto,
  TaskResponseDto,
} from '@application/dtos/task.dto';
import {
  PriorityStatus,
  EisenhowerQuadrant,
  PriorityOrigin,
} from '@domain/entities/priority.entity';
import {
  TaskClassification,
  TaskStatus,
} from '@domain/entities/task.entity';

@Controller('priorities')
@UseGuards(AuthGuard('jwt'))
export class PriorityController {
  constructor(
    private readonly createPriorityUseCase: CreatePriorityUseCase,
    private readonly getPrioritiesUseCase: GetPrioritiesUseCase,
    private readonly getPriorityUseCase: GetPriorityUseCase,
    private readonly updatePriorityUseCase: UpdatePriorityUseCase,
    private readonly movePriorityUseCase: MovePriorityUseCase,
    private readonly reorderPrioritiesUseCase: ReorderPrioritiesUseCase,
    private readonly archivePriorityUseCase: ArchivePriorityUseCase,
    private readonly deletePriorityUseCase: DeletePriorityUseCase,
    private readonly getTasksUseCase: GetTasksUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
  ) {}

  @Get()
  async getPriorities(
    @Request() req: any,
    @Query('status') status?: PriorityStatus,
    @Query('quadrant') quadrant?: EisenhowerQuadrant,
    @Query('tags') tags?: string,
    @Query('origin') origin?: PriorityOrigin,
  ): Promise<{ priorities: PriorityResponseDto[] }> {
    const tagsArray = tags ? tags.split(',') : undefined;
    const priorities = await this.getPrioritiesUseCase.execute(req.user.id, {
      status,
      quadrant,
      tags: tagsArray,
      origin,
    });
    return { priorities };
  }

  @Get(':id')
  async getPriority(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<PriorityResponseDto> {
    return this.getPriorityUseCase.execute(req.user.id, id);
  }

  @Post()
  async createPriority(
    @Request() req: any,
    @Body() dto: CreatePriorityDto,
  ): Promise<PriorityResponseDto> {
    return this.createPriorityUseCase.execute(req.user.id, dto);
  }

  @Patch(':id')
  async updatePriority(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePriorityDto,
  ): Promise<PriorityResponseDto> {
    return this.updatePriorityUseCase.execute(req.user.id, id, dto);
  }

  @Post(':id/move')
  async movePriority(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: MovePriorityDto,
  ): Promise<PriorityResponseDto> {
    return this.movePriorityUseCase.execute(req.user.id, id, dto);
  }

  @Post(':quadrant/reorder')
  async reorderPriorities(
    @Request() req: any,
    @Param('quadrant') quadrant: string,
    @Body() dto: ReorderPrioritiesDto,
  ): Promise<{ success: boolean }> {
    return this.reorderPrioritiesUseCase.execute(req.user.id, quadrant, dto);
  }

  @Post(':id/archive')
  async archivePriority(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<PriorityResponseDto> {
    return this.archivePriorityUseCase.execute(req.user.id, id);
  }

  @Delete(':id')
  async deletePriority(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.deletePriorityUseCase.execute(req.user.id, id);
  }

  @Get(':priorityId/tasks')
  async getPriorityTasks(
    @Request() req: any,
    @Param('priorityId') priorityId: string,
    @Query('classification') classification?: TaskClassification,
    @Query('status') status?: TaskStatus,
  ): Promise<{ tasks: TaskResponseDto[] }> {
    const tasks = await this.getTasksUseCase.execute(req.user.id, priorityId, {
      classification,
      status,
    });
    return { tasks };
  }

  @Post(':priorityId/tasks')
  async createPriorityTask(
    @Request() req: any,
    @Param('priorityId') priorityId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.createTaskUseCase.execute(req.user.id, priorityId, dto);
  }
}


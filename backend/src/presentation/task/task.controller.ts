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
import { GetTaskUseCase } from '@application/use-cases/task/get-task.use-case';
import { UpdateTaskUseCase } from '@application/use-cases/task/update-task.use-case';
import { MoveTaskUseCase } from '@application/use-cases/task/move-task.use-case';
import { CompleteTaskUseCase } from '@application/use-cases/task/complete-task.use-case';
import { CancelTaskUseCase } from '@application/use-cases/task/cancel-task.use-case';
import { DeleteTaskUseCase } from '@application/use-cases/task/delete-task.use-case';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskResponseDto,
} from '@application/dtos/task.dto';
import {
  TaskClassification,
  TaskStatus,
} from '@domain/entities/task.entity';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TaskController {
  constructor(
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly moveTaskUseCase: MoveTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase,
    private readonly cancelTaskUseCase: CancelTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Get(':id')
  async getTask(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.getTaskUseCase.execute(req.user.id, id);
  }

  @Patch(':id')
  async updateTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.updateTaskUseCase.execute(req.user.id, id, dto);
  }

  @Post(':id/move')
  async moveTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
  ): Promise<TaskResponseDto> {
    return this.moveTaskUseCase.execute(req.user.id, id, dto);
  }

  @Post(':id/complete')
  async completeTask(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.completeTaskUseCase.execute(req.user.id, id);
  }

  @Post(':id/cancel')
  async cancelTask(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.cancelTaskUseCase.execute(req.user.id, id);
  }

  @Delete(':id')
  async deleteTask(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.deleteTaskUseCase.execute(req.user.id, id);
  }
}


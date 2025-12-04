import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  TaskClassification,
  TaskStatus,
  TaskOrigin,
} from '@domain/entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(TaskClassification)
  classification: TaskClassification;

  @IsOptional()
  @IsDateString()
  idealDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  responsible?: string;

  @IsOptional()
  @IsEnum(TaskOrigin)
  origin?: TaskOrigin;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  meetingReference?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskClassification)
  classification?: TaskClassification;

  @IsOptional()
  @IsDateString()
  idealDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  responsible?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

export class MoveTaskDto {
  @IsEnum(TaskClassification)
  classification: TaskClassification;

  @IsOptional()
  @IsDateString()
  idealDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  responsible?: string;
}

export class TaskResponseDto {
  id: string;
  userId: string;
  priorityId: string;
  title: string;
  description?: string;
  classification: TaskClassification;
  idealDate?: Date;
  responsible?: string;
  status: TaskStatus;
  origin: TaskOrigin;
  meetingReference?: string;
  createdAt: Date;
  updatedAt: Date;
}


import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsNumber,
  ArrayMaxSize,
} from 'class-validator';
import {
  EisenhowerQuadrant,
  PriorityStatus,
  PriorityOrigin,
} from '@domain/entities/priority.entity';

export class CreatePriorityDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(EisenhowerQuadrant)
  quadrant: EisenhowerQuadrant;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(PriorityOrigin)
  origin?: PriorityOrigin;
}

export class UpdatePriorityDto {
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
  @IsEnum(EisenhowerQuadrant)
  quadrant?: EisenhowerQuadrant;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(PriorityStatus)
  status?: PriorityStatus;
}

export class MovePriorityDto {
  @IsEnum(EisenhowerQuadrant)
  quadrant: EisenhowerQuadrant;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class ReorderPrioritiesDto {
  @IsArray()
  @IsString({ each: true })
  priorityIds: string[];
}

export class PriorityResponseDto {
  id: string;
  userId: string;
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  tags: string[];
  status: PriorityStatus;
  origin: PriorityOrigin;
  displayOrder: number;
  taskCount?: number;
  createdAt: Date;
  updatedAt: Date;
}


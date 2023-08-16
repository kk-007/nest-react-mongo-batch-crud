import { IsArray, IsEnum, IsObject, IsOptional } from 'class-validator';
import { IPlan, OperationType } from './plan.interface';

class BatchRequestDto {
  @IsArray()
  @IsObject({ each: true })
  operations: RecordOperationDto[];
}
class RecordOperationDto {
  @IsEnum(OperationType)
  action: OperationType;

  @IsObject()
  @IsOptional()
  data?: Partial<IPlan>;

  @IsOptional()
  id?: string;
}

export { BatchRequestDto, RecordOperationDto };

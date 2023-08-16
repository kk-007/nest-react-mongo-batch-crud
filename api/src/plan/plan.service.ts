import { Injectable } from '@nestjs/common';
import { BatchRequestDto } from './batch-request.dto';
import { IPlan, OperationType } from './plan.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlanService {
  constructor(@InjectModel('plan') private readonly planModel: Model<IPlan>) {}

  async processBatchRequest(batchRequest: BatchRequestDto): Promise<void> {
    for (const operation of batchRequest.operations) {
      switch (operation.action) {
        case OperationType.CREATE:
          const newRecord = new this.planModel(operation.data);
          await newRecord.save();
          break;
        case OperationType.UPDATE:
          await this.planModel.findByIdAndUpdate(
            operation.data.id,
            operation.data,
          );
          break;
        case OperationType.DELETE:
          await this.planModel.findByIdAndDelete(operation.data.id);
          break;
      }
    }
  }

  async getPlans(): Promise<void> {
    return await this.planModel.find({}).lean();
  }
}

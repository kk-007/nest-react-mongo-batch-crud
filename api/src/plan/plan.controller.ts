import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { PlanService } from './plan.service';
import { BatchRequestDto } from './batch-request.dto';

@Controller('plan')
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get('/')
  async getPlans(@Res() response): Promise<void> {
    const plans = await this.planService.getPlans();
    return response.status(HttpStatus.OK).json({
      data: plans,
    });
  }

  @Post('batch')
  async processBatchRequest(
    @Body() batchRequest: BatchRequestDto,
  ): Promise<void> {
    return this.planService.processBatchRequest(batchRequest);
  }
}

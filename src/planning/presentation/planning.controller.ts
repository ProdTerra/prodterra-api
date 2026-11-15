import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PlanningService, type PlanResult, type RotationEvaluationResult } from '../application/planning.service.js';
import { parsePlanRequest } from '../domain/planRequest.js';
import { parseRotationEvaluationRequest } from '../domain/rotationEvaluationRequest.js';

@Controller('plans')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async buildPlans(@Body() body: unknown): Promise<PlanResult> {
    const parsed = parsePlanRequest(body, new Date());
    if (!parsed.valid) {
      throw new BadRequestException(parsed.error);
    }
    return this.planningService.buildPlans(parsed.request);
  }

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateRotations(@Body() body: unknown): Promise<RotationEvaluationResult> {
    const parsed = parseRotationEvaluationRequest(body, new Date());
    if (!parsed.valid) {
      throw new BadRequestException(parsed.error);
    }
    return this.planningService.evaluateRotations(parsed.request);
  }
}

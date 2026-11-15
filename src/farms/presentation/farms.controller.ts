import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../accounts/presentation/currentUser.js';
import { SessionGuard } from '../../accounts/presentation/sessionGuard.js';
import type { User } from '../../accounts/domain/user.js';
import { validateSavedFarmInput, type SavedFarm, type SavedFarmInput, type SavedFarmSummary } from '../domain/savedFarm.js';
import { SavedFarmRepository } from '../domain/savedFarmRepository.js';

type SavedFarmResponse = Omit<SavedFarm, 'ownerId'>;

function toResponse({ ownerId: _ownerId, ...farm }: SavedFarm): SavedFarmResponse {
  return farm;
}

function parseInput(body: Record<string, unknown>): SavedFarmInput {
  const result = validateSavedFarmInput(body);
  if ('errors' in result) {
    throw new BadRequestException({ errors: result.errors });
  }
  return result.input;
}

function farmNotFound(): NotFoundException {
  return new NotFoundException({ errors: [{ code: 'farmNotFound' }] });
}

@Controller('farms')
@UseGuards(SessionGuard)
export class FarmsController {
  constructor(private readonly savedFarmRepository: SavedFarmRepository) {}

  @Get()
  list(@CurrentUser() user: User): Promise<SavedFarmSummary[]> {
    return this.savedFarmRepository.listByOwner(user.id);
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() body: Record<string, unknown>): Promise<SavedFarmResponse> {
    return toResponse(await this.savedFarmRepository.create(user.id, parseInput(body), new Date()));
  }

  @Get(':farmId')
  async find(@CurrentUser() user: User, @Param('farmId') farmId: string): Promise<SavedFarmResponse> {
    const farm = await this.savedFarmRepository.findOwned(user.id, farmId);
    if (!farm) {
      throw farmNotFound();
    }
    return toResponse(farm);
  }

  @Put(':farmId')
  async update(
    @CurrentUser() user: User,
    @Param('farmId') farmId: string,
    @Body() body: Record<string, unknown>,
  ): Promise<SavedFarmResponse> {
    const farm = await this.savedFarmRepository.updateOwned(user.id, farmId, parseInput(body), new Date());
    if (!farm) {
      throw farmNotFound();
    }
    return toResponse(farm);
  }

  @Delete(':farmId')
  @HttpCode(204)
  async remove(@CurrentUser() user: User, @Param('farmId') farmId: string): Promise<void> {
    if (!(await this.savedFarmRepository.deleteOwned(user.id, farmId))) {
      throw farmNotFound();
    }
  }
}

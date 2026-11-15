import {
  BadRequestException,
  Body,
  ConflictException,
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
import { isFarmNameTaken, validateSavedFarmInput, type SavedFarm, type SavedFarmInput, type SavedFarmSummary } from '../domain/savedFarm.js';
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

function farmNameTaken(): ConflictException {
  return new ConflictException({ errors: [{ field: 'name', code: 'nameTaken' }] });
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
    const input = parseInput(body);
    await this.ensureNameIsFree(user.id, input.name);
    return toResponse(await this.savedFarmRepository.create(user.id, input, new Date()));
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
    const input = parseInput(body);
    await this.ensureNameIsFree(user.id, input.name, farmId);
    const farm = await this.savedFarmRepository.updateOwned(user.id, farmId, input, new Date());
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

  private async ensureNameIsFree(ownerId: string, name: string, exceptFarmId?: string): Promise<void> {
    if (isFarmNameTaken(await this.savedFarmRepository.listByOwner(ownerId), name, exceptFarmId)) {
      throw farmNameTaken();
    }
  }
}

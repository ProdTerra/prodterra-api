import { Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { LotClimateProfileService } from '../application/lotClimateProfile.service.js';
import type { LotClimateProfile } from '../domain/lotClimateProfile.js';
import { LotClimateProfileRequestDto } from './lotClimateProfileRequest.dto.js';

@Controller('lots')
export class LotClimateProfileController {
  constructor(private readonly lotClimateProfileService: LotClimateProfileService) {}

  @Post('climate-profile')
  @HttpCode(HttpStatus.OK)
  async buildClimateProfile(@Body() request: LotClimateProfileRequestDto): Promise<LotClimateProfile> {
    const profile = await this.lotClimateProfileService.buildProfile(request.boundary);
    if (!profile) {
      throw new NotFoundException('No elevation data for this lot');
    }
    return profile;
  }
}

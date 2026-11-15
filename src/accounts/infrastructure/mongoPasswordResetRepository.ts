import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { PasswordReset } from '../domain/passwordReset.js';
import { PasswordResetRepository } from '../domain/passwordResetRepository.js';
import { PasswordResetDocument } from './schemas/passwordReset.schema.js';

@Injectable()
export class MongoPasswordResetRepository extends PasswordResetRepository {
  constructor(@InjectModel(PasswordResetDocument.name) private readonly passwordResetModel: Model<PasswordResetDocument>) {
    super();
  }

  async create(passwordReset: PasswordReset): Promise<void> {
    await this.passwordResetModel.create(passwordReset);
  }

  findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    return this.passwordResetModel.findOne({ tokenHash }, { _id: 0 }).lean<PasswordReset>().exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.passwordResetModel.deleteMany({ userId }).exec();
  }
}

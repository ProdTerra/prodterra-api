import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { Session } from '../domain/session.js';
import { SessionRepository } from '../domain/sessionRepository.js';
import { SessionDocument } from './schemas/session.schema.js';

@Injectable()
export class MongoSessionRepository extends SessionRepository {
  constructor(@InjectModel(SessionDocument.name) private readonly sessionModel: Model<SessionDocument>) {
    super();
  }

  async create(session: Session): Promise<void> {
    await this.sessionModel.create(session);
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.sessionModel.findOne({ tokenHash }, { _id: 0 }).lean<Session>().exec();
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.sessionModel.deleteOne({ tokenHash }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model, type Types } from 'mongoose';
import { DuplicateEmailError } from '../domain/accountErrors.js';
import { withoutPasswordHash, type NewUser, type StoredUser, type User } from '../domain/user.js';
import { UserRepository } from '../domain/userRepository.js';
import { UserDocument } from './schemas/user.schema.js';

type PersistedUser = UserDocument & { _id: Types.ObjectId };

const duplicateKeyErrorCode = 11000;

@Injectable()
export class MongoUserRepository extends UserRepository {
  constructor(@InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>) {
    super();
  }

  async create(newUser: NewUser): Promise<User> {
    try {
      const created = await this.userModel.create(newUser);
      return withoutPasswordHash(toStoredUser(created.toObject<PersistedUser>()));
    } catch (error) {
      throw isDuplicateKeyError(error) ? new DuplicateEmailError() : error;
    }
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    const persistedUser = await this.userModel.findOne({ email }).lean<PersistedUser>().exec();
    return persistedUser ? toStoredUser(persistedUser) : null;
  }

  async findByGoogleId(googleId: string): Promise<StoredUser | null> {
    const persistedUser = await this.userModel.findOne({ googleId }).lean<PersistedUser>().exec();
    return persistedUser ? toStoredUser(persistedUser) : null;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { googleId }).exec();
  }

  async updateProfile(userId: string, changes: { name?: string; avatarKey?: string }): Promise<User | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }
    const persistedUser = await this.userModel
      .findByIdAndUpdate(userId, changes, { new: true })
      .lean<PersistedUser>()
      .exec();
    return persistedUser ? withoutPasswordHash(toStoredUser(persistedUser)) : null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { passwordHash }).exec();
  }

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const persistedUser = await this.userModel.findById(id).lean<PersistedUser>().exec();
    return persistedUser ? withoutPasswordHash(toStoredUser(persistedUser)) : null;
  }
}

function toStoredUser(persistedUser: PersistedUser): StoredUser {
  return {
    id: persistedUser._id.toString(),
    name: persistedUser.name,
    email: persistedUser.email,
    avatarKey: persistedUser.avatarKey ?? null,
    passwordHash: persistedUser.passwordHash ?? null,
    googleId: persistedUser.googleId ?? null,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === duplicateKeyErrorCode;
}

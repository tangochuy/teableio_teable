import https from 'https';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import {
  generateAccountId,
  generateSpaceId,
  generateUserId,
  minidenticon,
  SpaceRole,
} from '@teable/core';
import type { Prisma } from '@teable/db-main-prisma';
import { PrismaService } from '@teable/db-main-prisma';
import { type ICreateSpaceRo, type IUserNotifyMeta, UploadType } from '@teable/openapi';
import { ClsService } from 'nestjs-cls';
import sharp from 'sharp';
import type { IClsStore } from '../../types/cls';
import { getFullStorageUrl } from '../../utils/full-storage-url';
import StorageAdapter from '../attachments/plugins/adapter';
import { InjectStorageAdapter } from '../attachments/plugins/storage';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    @InjectStorageAdapter() readonly storageAdapter: StorageAdapter
  ) {}

  async getUserById(id: string) {
    const userRaw = await this.prismaService
      .txClient()
      .user.findUnique({ where: { id, deletedTime: null } });

    return (
      userRaw && {
        ...userRaw,
        avatar: userRaw.avatar && getFullStorageUrl(userRaw.avatar),
        notifyMeta: userRaw.notifyMeta && JSON.parse(userRaw.notifyMeta),
      }
    );
  }

  async getUserByEmail(email: string) {
    return await this.prismaService
      .txClient()
      .user.findUnique({ where: { email, deletedTime: null } });
  }

  async createSpaceBySignup(createSpaceRo: ICreateSpaceRo) {
    const userId = this.cls.get('user.id');
    const uniqName = createSpaceRo.name ?? 'Space';

    const space = await this.prismaService.txClient().space.create({
      select: {
        id: true,
        name: true,
      },
      data: {
        id: generateSpaceId(),
        name: uniqName,
        createdBy: userId,
      },
    });
    await this.prismaService.txClient().collaborator.create({
      data: {
        spaceId: space.id,
        roleName: SpaceRole.Owner,
        userId,
        createdBy: userId,
      },
    });
    return space;
  }

  async createUser(
    user: Prisma.UserCreateInput,
    account?: Omit<Prisma.AccountUncheckedCreateInput, 'userId'>
  ) {
    // defaults
    const defaultNotifyMeta: IUserNotifyMeta = {
      email: true,
    };

    user = {
      ...user,
      id: user.id ?? generateUserId(),
      notifyMeta: JSON.stringify(defaultNotifyMeta),
    };

    if (!user?.avatar) {
      const avatar = await this.generateDefaultAvatar(user.id!);
      user = {
        ...user,
        avatar,
      };
    }
    // default space created
    const newUser = await this.prismaService.txClient().user.create({ data: user });
    const { id, name } = newUser;
    if (account) {
      await this.prismaService.txClient().account.create({
        data: { id: generateAccountId(), ...account, userId: id },
      });
    }
    await this.cls.runWith(this.cls.get(), async () => {
      this.cls.set('user.id', id);
      await this.createSpaceBySignup({ name: `${name}'s space` });
    });
    return newUser;
  }

  async updateUserName(id: string, name: string) {
    await this.prismaService.txClient().user.update({
      data: {
        name,
      },
      where: { id, deletedTime: null },
    });
  }

  async updateAvatar(id: string, avatarFile: { path: string; mimetype: string; size: number }) {
    const path = join(StorageAdapter.getDir(UploadType.Avatar), id);
    const bucket = StorageAdapter.getBucket(UploadType.Avatar);
    const { hash, url } = await this.storageAdapter.uploadFileWidthPath(
      bucket,
      path,
      avatarFile.path,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': avatarFile.mimetype,
      }
    );
    const { size, mimetype } = avatarFile;

    await this.mountAttachment(id, {
      bucket,
      hash,
      size,
      mimetype,
      token: id,
      path,
    });

    await this.prismaService.txClient().user.update({
      data: {
        avatar: url,
      },
      where: { id, deletedTime: null },
    });
  }

  private async mountAttachment(
    userId: string,
    input: Prisma.AttachmentsCreateInput | Prisma.AttachmentsUpdateInput
  ) {
    await this.prismaService.txClient().attachments.upsert({
      create: {
        ...input,
        createdBy: userId,
      } as Prisma.AttachmentsCreateInput,
      update: input as Prisma.AttachmentsUpdateInput,
      where: {
        token: userId,
        deletedTime: null,
      },
    });
  }

  async updateNotifyMeta(id: string, notifyMetaRo: IUserNotifyMeta) {
    await this.prismaService.txClient().user.update({
      data: {
        notifyMeta: JSON.stringify(notifyMetaRo),
      },
      where: { id, deletedTime: null },
    });
  }

  private async generateDefaultAvatar(id: string) {
    const path = join(StorageAdapter.getDir(UploadType.Avatar), id);
    const bucket = StorageAdapter.getBucket(UploadType.Avatar);

    const svgSize = [410, 410];
    const svgString = minidenticon(id);
    const svgObject = sharp(Buffer.from(svgString))
      .resize(svgSize[0], svgSize[1])
      .flatten({ background: '#f0f0f0' })
      .png({ quality: 90 });
    const mimetype = 'image/png';
    const { size } = await svgObject.metadata();
    const svgBuffer = await svgObject.toBuffer();

    const { url, hash } = await this.storageAdapter.uploadFile(bucket, path, svgBuffer, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': mimetype,
    });

    await this.mountAttachment(id, {
      bucket: bucket,
      hash: hash,
      size: size,
      mimetype: mimetype,
      token: id,
      path: path,
      width: svgSize[0],
      height: svgSize[1],
    });

    return url;
  }

  private async uploadAvatarByUrl(userId: string, url: string) {
    return new Promise<string>((resolve, reject) => {
      https
        .get(url, async (stream) => {
          const contentType = stream?.headers?.['content-type']?.split(';')?.[0];
          const size = stream?.headers?.['content-length']?.split(';')?.[0];
          const path = join(StorageAdapter.getDir(UploadType.Avatar), userId);
          const bucket = StorageAdapter.getBucket(UploadType.Avatar);

          const { url, hash } = await this.storageAdapter.uploadFile(bucket, path, stream, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': contentType,
          });

          await this.mountAttachment(userId, {
            bucket: bucket,
            hash: hash,
            size: size ? parseInt(size) : undefined,
            mimetype: contentType,
            token: userId,
            path: path,
          });
          resolve(url);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async findOrCreateUser(user: {
    name: string;
    email: string;
    provider: string;
    providerId: string;
    type: string;
    avatarUrl?: string;
  }) {
    return this.prismaService.$tx(async () => {
      const { email, name, provider, providerId, type, avatarUrl } = user;
      // account exist check
      const existAccount = await this.prismaService.txClient().account.findFirst({
        where: { provider, providerId },
      });
      if (existAccount) {
        return await this.getUserById(existAccount.userId);
      }

      // user exist check
      const existUser = await this.getUserByEmail(email);
      if (!existUser) {
        const userId = generateUserId();
        let avatar: string | undefined = undefined;
        if (avatarUrl) {
          avatar = await this.uploadAvatarByUrl(userId, avatarUrl);
        }
        return await this.createUser(
          { id: userId, email, name, avatar },
          { provider, providerId, type }
        );
      }

      await this.prismaService.txClient().account.create({
        data: { id: generateAccountId(), provider, providerId, type, userId: existUser.id },
      });
      return existUser;
    });
  }
}

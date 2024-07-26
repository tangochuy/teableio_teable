/* eslint-disable @typescript-eslint/naming-convention */
import type { Readable as ReadableStream } from 'node:stream';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { getRandomString } from '@teable/core';
import * as minio from 'minio';
import sharp from 'sharp';
import { IStorageConfig, StorageConfig } from '../../../configs/storage';
import { second } from '../../../utils/second';
import type StorageAdapter from './adapter';
import type { IPresignParams, IPresignRes, IRespHeaders } from './types';

@Injectable()
export class MinioStorage implements StorageAdapter {
  minioClient: minio.Client;

  constructor(@StorageConfig() readonly config: IStorageConfig) {
    const { endPoint, port, useSSL, accessKey, secretKey } = this.config.minio;
    this.minioClient = new minio.Client({
      endPoint: endPoint!,
      port: port!,
      useSSL: useSSL!,
      accessKey: accessKey!,
      secretKey: secretKey!,
    });
  }

  async presigned(
    bucket: string,
    dir: string,
    presignedParams: IPresignParams
  ): Promise<IPresignRes> {
    const { tokenExpireIn, uploadMethod } = this.config;
    const { expiresIn, contentLength, contentType, hash } = presignedParams;
    const token = getRandomString(12);
    const filename = hash ?? token;
    const path = join(dir, filename);
    const requestHeaders = {
      'Content-Type': contentType,
      'Content-Length': contentLength,
      'response-cache-control': 'max-age=518400',
    };
    try {
      const url = await this.minioClient.presignedUrl(
        uploadMethod,
        bucket,
        path,
        expiresIn ?? second(tokenExpireIn),
        requestHeaders
      );
      return {
        url,
        path,
        token,
        uploadMethod,
        requestHeaders,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      throw new BadRequestException(`Minio presigned error${e?.message ? `: ${e.message}` : ''}`);
    }
  }

  async getObjectMeta(bucket: string, path: string, _token: string) {
    const objectName = path;
    const { metaData, size, etag: hash } = await this.minioClient.statObject(bucket, objectName);
    const mimetype = metaData['content-type'] as string;
    const url = `/${bucket}/${objectName}`;
    if (!mimetype?.startsWith('image/')) {
      return {
        hash,
        size,
        mimetype,
        url,
      };
    }
    const stream = await this.minioClient.getObject(bucket, objectName);
    const metaReader = sharp();
    const sharpReader = stream.pipe(metaReader);
    const { width, height } = await sharpReader.metadata();
    return {
      hash,
      size,
      mimetype,
      width,
      height,
      url,
    };
  }

  async getPreviewUrl(
    bucket: string,
    path: string,
    expiresIn: number = second(this.config.urlExpireIn),
    respHeaders?: IRespHeaders
  ) {
    const { 'Content-Disposition': contentDisposition, ...headers } = respHeaders ?? {};
    return this.minioClient.presignedGetObject(bucket, path, expiresIn, {
      ...headers,
      'response-content-disposition': contentDisposition,
    });
  }

  async uploadFileWidthPath(
    bucket: string,
    path: string,
    filePath: string,
    metadata: Record<string, unknown>
  ) {
    const { etag: hash } = await this.minioClient.fPutObject(bucket, path, filePath, metadata);
    return {
      hash,
      path,
    };
  }

  async uploadFile(
    bucket: string,
    path: string,
    stream: Buffer | ReadableStream,
    metadata?: Record<string, unknown>
  ) {
    const { etag: hash } = await this.minioClient.putObject(bucket, path, stream, metadata);
    return {
      hash,
      path,
    };
  }
}

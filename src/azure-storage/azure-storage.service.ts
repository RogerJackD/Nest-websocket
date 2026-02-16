import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v4 as uuid } from 'uuid';
@Injectable()
export class AzureStorageService {
    private containerClient: ContainerClient;

    constructor(
        private readonly configService : ConfigService,
    ){
        const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING')!;
        const containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME')!;

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

        this.containerClient = blobServiceClient.getContainerClient(containerName);
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const blobName = `${uuid()}-${file.originalname}`;
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        return blockBlobClient.url;
    }

    async deleteFile(blobUrl: string): Promise<void> {
        const blobName = blobUrl.split('/').pop()!;
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
    }
}

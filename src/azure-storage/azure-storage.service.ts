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
        const safeName = file.originalname.replace(/\s+/g, '-');  // espacios → guiones
        const blobName = `${uuid()}-${safeName}`;
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        return blockBlobClient.url;
    }

    async deleteFile(blobUrl: string): Promise<void> {
        // Decodificar %20 → espacios antes de extraer el nombre
        const decodedUrl = decodeURIComponent(blobUrl);
        //decodeURIComponent convierte:
        // Captura%20de%20pantalla%202026-02-11%20121630.png
        // →
        // Captura de pantalla 2026-02-11 121630.png
        const blobName = decodedUrl.split('/').pop()!;

        console.log('URL a eliminar:', blobUrl);
        console.log('blobName extraído:', blobName);

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        const result = await blockBlobClient.deleteIfExists();

        console.log('¿Se eliminó?:', result.succeeded);

    }
}

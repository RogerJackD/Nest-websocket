import { Module } from '@nestjs/common';
import { AzureStorageService } from './azure-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AzureStorageService],
  imports: [ConfigModule],
  exports: [AzureStorageService],
})
export class AzureStorageModule {}

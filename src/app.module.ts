import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsWsModule } from './polls-ws/polls-ws.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AzureStorageModule } from './azure-storage/azure-storage.module';
import { AzureKeyVaultModule } from './azure-key-vault/azure-key-vault.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,

      autoLoadEntities: true,
      synchronize: true,
    }),
    PollsWsModule,
    UsersModule,
    AuthModule,
    AzureStorageModule,
    AzureKeyVaultModule,
  ],
  controllers: [],
  providers: [
  ],
})
export class AppModule {}

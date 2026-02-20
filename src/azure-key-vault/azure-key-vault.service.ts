import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureKeyVaultService implements OnModuleInit {
    private secretClient: SecretClient;
    private readonly logger = new Logger(AzureKeyVaultService.name);

    constructor(
        private readonly configService: ConfigService
    ){
        const vaultUrl = this.configService.get<string>('AZURE_KEYVAULT_URL')!;
        const credential = new DefaultAzureCredential();
        this.secretClient = new SecretClient(vaultUrl, credential);
    }

    async onModuleInit() {
        this.logger.log('AzureKeyVaultService initialized');
    }

    async getSecret(secretName : string): Promise<string>{
        try {
            const secret = await this.secretClient.getSecret(secretName);

            if(!secret.value) throw new Error(`Secret "${secretName}" exist but no has value`);

            return secret.value

        } catch (error) {
            this.logger.error(`Failed to get secret "${secretName}": ${error.message}`);
            throw new Error(`could not retrieve sercre: ${secretName}`)
        }
    }

}

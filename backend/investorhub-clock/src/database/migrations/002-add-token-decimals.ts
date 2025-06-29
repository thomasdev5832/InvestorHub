import { Migration } from '../schemas/migration.schema';
import { NetworkConfigRepository } from '../repositories/network-config.repository';
import { TokenRepository } from '../repositories/token.repository';
import { MigrationRepository } from '../repositories/migration.repository';

export const name = '002-add-token-decimals';

export async function up(
  networkConfigRepository: NetworkConfigRepository,
  tokenRepository: TokenRepository,
  migrationRepository: MigrationRepository,
): Promise<void> {
  // Check if migration has already been run
  const existingMigration = await migrationRepository.findByName(name);
  if (existingMigration) {
    console.log(`Migration ${name} has already been run, skipping...`);
    return;
  }

  console.log(`Running migration: ${name}`);

  // Update all existing tokens to have decimals field with default value 18
  const tokens = await tokenRepository.findAll();
  
  for (const token of tokens) {
    if (token.decimals === undefined) {
      await tokenRepository.update(token.id, { decimals: 18 });
      console.log(`Updated token ${token.symbol} with default decimals: 18`);
    }
  }

  // Record the migration
  await migrationRepository.create({
    name,
    executedAt: new Date(),
  });

  console.log(`Migration ${name} completed successfully`);
}

export async function down(
  networkConfigRepository: NetworkConfigRepository,
  tokenRepository: TokenRepository,
  migrationRepository: MigrationRepository,
): Promise<void> {
  console.log(`Reverting migration: ${name}`);

  // Remove the migration record
  await migrationRepository.deleteByName(name);

  console.log(`Migration ${name} reverted successfully`);
} 
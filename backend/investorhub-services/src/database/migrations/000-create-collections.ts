import { Migration } from '../schemas/migration.schema';
import { NetworkConfig } from '../schemas/network-config.schema';
import { Token } from '../schemas/token.schema';
import { Model } from 'mongoose';

export const name = '000-create-collections';

export async function up(networkConfigModel: Model<NetworkConfig>, tokenModel: Model<Token>, migrationModel: Model<Migration>): Promise<void> {
  // Check if migration was already executed
  const existingMigration = await migrationModel.findOne({ name });
  if (existingMigration) {
    console.log(`Migration ${name} was already executed`);
    return;
  }

  // Create collections
  await networkConfigModel.createCollection();
  await tokenModel.createCollection();

  // Record migration
  await migrationModel.create({
    name,
    executedAt: new Date(),
  });

  console.log(`Migration ${name} executed successfully`);
}

export async function down(networkConfigModel: Model<NetworkConfig>, tokenModel: Model<Token>, migrationModel: Model<Migration>): Promise<void> {
  // Drop collections
  await networkConfigModel.collection.drop();
  await tokenModel.collection.drop();
  
  // Remove migration record
  await migrationModel.deleteOne({ name });
  
  console.log(`Migration ${name} reverted successfully`);
} 
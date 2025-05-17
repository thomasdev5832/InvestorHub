import { Command, CommandRunner } from 'nest-commander';
import { MigrationService } from '../database/migrations/migration.service';

@Command({ name: 'migrate', description: 'Run database migrations' })
export class RunMigrationsCommand extends CommandRunner {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.migrationService.runMigrations();
      process.exit(0);
    } catch (error) {
      console.error('Error running migrations:', error);
      process.exit(1);
    }
  }
} 
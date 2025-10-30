import { Injectable, OnModuleInit } from '@nestjs/common';
import { RevNetSeeder } from '../seeders/revnet-seeder';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private readonly revNetSeeder: RevNetSeeder) {}

  async onModuleInit() {
    // Only seed if no data exists
    try {
      await this.revNetSeeder.seed();
    } catch (error) {
      console.log('Seeder already ran or error occurred:', error.message);
    }
  }
}

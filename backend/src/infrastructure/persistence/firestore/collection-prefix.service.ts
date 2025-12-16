import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectionPrefixService {
  private readonly prefix: string;

  constructor() {
    const environment = process.env.ENVIRONMENT || 'production';
    this.prefix = environment === 'test' ? 'test_' : '';
  }

  getCollectionName(baseName: string): string {
    return `${this.prefix}${baseName}`;
  }

  getPrefix(): string {
    return this.prefix;
  }

  isTestEnvironment(): boolean {
    return this.prefix === 'test_';
  }
}

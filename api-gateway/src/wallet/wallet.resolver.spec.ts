import { Test, TestingModule } from '@nestjs/testing';
import { WalletResolver } from './wallet.resolver';

describe('WalletResolver', () => {
  let resolver: WalletResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletResolver],
    }).compile();

    resolver = module.get<WalletResolver>(WalletResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConsignmentsService } from './consignments.service';

describe('ConsignmentsService', () => {
  let service: ConsignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsignmentsService],
    }).compile();

    service = module.get<ConsignmentsService>(ConsignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

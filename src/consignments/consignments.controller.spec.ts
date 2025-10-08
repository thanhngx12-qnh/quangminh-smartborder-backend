import { Test, TestingModule } from '@nestjs/testing';
import { ConsignmentsController } from './consignments.controller';

describe('ConsignmentsController', () => {
  let controller: ConsignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsignmentsController],
    }).compile();

    controller = module.get<ConsignmentsController>(ConsignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

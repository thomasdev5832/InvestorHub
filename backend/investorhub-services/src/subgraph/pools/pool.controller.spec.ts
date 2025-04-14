import { Test, TestingModule } from '@nestjs/testing';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { ListPoolsRequestDto } from './dto/list-pools-request.dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('PoolController (e2e)', () => {
    let app: INestApplication;
    const mockSubgraphService = {
        fetchPoolsForTokenPair: jest.fn(),
    };

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [PoolController],
            providers: [
                {
                    provide: PoolService,
                    useValue: mockSubgraphService,
                },
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    const validPayload: ListPoolsRequestDto = {
        tokenA: '0x123',
        tokenB: '0x456',
    };

    it('✅ should return pool data when payload is valid', async () => {
        const mockResult = { pools: ['mock'] };
        mockSubgraphService.fetchPoolsForTokenPair.mockResolvedValue(mockResult);

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(validPayload)
            .expect(201); // NestJS responde 201 por padrão em POST

        expect(response.body).toEqual(mockResult);
    });

    it('❌ should return 400 when tokenA is missing', async () => {
        const { tokenA, ...payloadWithoutTokenA } = validPayload;

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payloadWithoutTokenA)
            .expect(400);

        expect(response.body.message).toContain('tokenA should not be null or undefined');
    });

    it('❌ should return 400 when tokenB is not a string', async () => {
        const payload = { ...validPayload, tokenB: 123 };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('tokenB must be a string');
    });

    it('❌ should return 400 when there is an extra field', async () => {
        const payload = { ...validPayload, extraField: 'should-not-be-here' };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('property extraField should not exist');
    });

    it('❌ should return 400 when tokenA is not a valid Ethereum address', async () => {
        const payload = { ...validPayload, tokenA: 'not-an-eth-address' };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('tokenA must be an Ethereum address');
    });
});
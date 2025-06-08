import { Test, TestingModule } from '@nestjs/testing';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { ListPoolsRequestDto } from '../../shared/dtos/list-pools-request.dto';
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
        token0: '0x123',
        token1: '0x456',
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

    it('❌ should return 400 when token0 is missing', async () => {
        const { token0, ...payloadWithoutToken0 } = validPayload;

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payloadWithoutToken0)
            .expect(400);

        expect(response.body.message).toContain('token0 should not be null or undefined');
    });

    it('❌ should return 400 when token1 is not a string', async () => {
        const payload = { ...validPayload, token1: 123 };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('token1 must be a string');
    });

    it('❌ should return 400 when there is an extra field', async () => {
        const payload = { ...validPayload, extraField: 'should-not-be-here' };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('property extraField should not exist');
    });

    it('❌ should return 400 when token0 is not a valid Ethereum address', async () => {
        const payload = { ...validPayload, token0: 'not-an-eth-address' };

        const response = await request(app.getHttpServer())
            .post('/subgraph')
            .send(payload)
            .expect(400);

        expect(response.body.message).toContain('token0 must be an Ethereum address');
    });
});
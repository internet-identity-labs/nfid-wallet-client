import { BTCDepositService } from './btc-deposit-service';
import { actor } from '../../../actors';
import { CKBTC_MINTER_CANISTER_ID } from '../constants';

jest.mock('../../../actors', () => ({
  actor: jest.fn(),
}));

describe('BTCDepositService', () => {
  let service: BTCDepositService;
  const mockMinter = {
    get_btc_address: jest.fn(),
    get_deposit_status: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (actor as jest.Mock).mockReturnValue(mockMinter);
    service = new BTCDepositService();
  });

  describe('generateAddress', () => {
    it('should generate a BTC address', async () => {
      const mockResponse = {
        address: 'bc1q...',
        derivation_path: 'm/44/0/0/0/0',
      };
      mockMinter.get_btc_address.mockResolvedValue(mockResponse);

      const result = await service.generateAddress();

      expect(actor).toHaveBeenCalledWith(CKBTC_MINTER_CANISTER_ID, expect.any(Function));
      expect(result).toEqual({
        address: mockResponse.address,
        derivationPath: mockResponse.derivation_path,
        createdAt: expect.any(Date),
      });
    });

    it('should handle errors when generating address', async () => {
      mockMinter.get_btc_address.mockRejectedValue(new Error('Failed to generate address'));

      await expect(service.generateAddress()).rejects.toThrow('Failed to generate address');
    });
  });

  describe('getDepositStatus', () => {
    it('should get deposit status', async () => {
      const mockResponse = {
        address: 'bc1q...',
        amount: BigInt(1000000),
        status: 'pending',
        tx_id: 'tx123',
        created_at: BigInt(Date.now()),
      };
      mockMinter.get_deposit_status.mockResolvedValue(mockResponse);

      const result = await service.getDepositStatus('tx123');

      expect(actor).toHaveBeenCalledWith(CKBTC_MINTER_CANISTER_ID, expect.any(Function));
      expect(result).toEqual({
        address: mockResponse.address,
        amount: mockResponse.amount,
        status: mockResponse.status,
        txId: mockResponse.tx_id,
        createdAt: expect.any(Date),
        confirmations: 0,
      });
    });

    it('should handle confirmed status', async () => {
      const mockResponse = {
        address: 'bc1q...',
        amount: BigInt(1000000),
        status: 'confirmed',
        tx_id: 'tx123',
        created_at: BigInt(Date.now()),
        confirmed_at: BigInt(Date.now()),
      };
      mockMinter.get_deposit_status.mockResolvedValue(mockResponse);

      const result = await service.getDepositStatus('tx123');

      expect(result).toEqual({
        address: mockResponse.address,
        amount: mockResponse.amount,
        status: mockResponse.status,
        txId: mockResponse.tx_id,
        createdAt: expect.any(Date),
        confirmedAt: expect.any(Date),
        confirmations: 6,
      });
    });

    it('should handle errors when getting deposit status', async () => {
      mockMinter.get_deposit_status.mockRejectedValue(new Error('Failed to get status'));

      await expect(service.getDepositStatus('tx123')).rejects.toThrow('Failed to get status');
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BTCDepositComponent } from './btc-deposit';
import { btcDepositService } from '@nfid/integration/token/btc/service';

jest.mock('@nfid/integration/token/btc/service', () => ({
  btcDepositService: {
    generateAddress: jest.fn(),
    getDepositStatus: jest.fn(),
  },
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('BTCDepositComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate address on mount', async () => {
    const mockAddress = {
      address: 'bc1q...',
      derivationPath: 'm/44/0/0/0/0',
      createdAt: new Date(),
    };
    (btcDepositService.generateAddress as jest.Mock).mockResolvedValue(mockAddress);

    render(<BTCDepositComponent />);

    await waitFor(() => {
      expect(screen.getByText(mockAddress.address)).toBeInTheDocument();
    });
  });

  it('should handle address generation error', async () => {
    (btcDepositService.generateAddress as jest.Mock).mockRejectedValue(new Error('Failed to generate address'));

    render(<BTCDepositComponent />);

    await waitFor(() => {
      expect(screen.queryByText('bc1q...')).not.toBeInTheDocument();
    });
  });

  it('should copy address to clipboard', async () => {
    const mockAddress = {
      address: 'bc1q...',
      derivationPath: 'm/44/0/0/0/0',
      createdAt: new Date(),
    };
    (btcDepositService.generateAddress as jest.Mock).mockResolvedValue(mockAddress);

    render(<BTCDepositComponent />);

    await waitFor(() => {
      expect(screen.getByText(mockAddress.address)).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAddress.address);
  });

  it('should show deposit status', async () => {
    const mockAddress = {
      address: 'bc1q...',
      derivationPath: 'm/44/0/0/0/0',
      createdAt: new Date(),
    };
    (btcDepositService.generateAddress as jest.Mock).mockResolvedValue(mockAddress);

    const mockStatus = {
      address: 'bc1q...',
      amount: BigInt(1000000),
      status: 'pending',
      txId: 'tx123',
      createdAt: new Date(),
      confirmations: 2,
    };
    (btcDepositService.getDepositStatus as jest.Mock).mockResolvedValue(mockStatus);

    render(<BTCDepositComponent />);

    await waitFor(() => {
      expect(screen.getByText('Status: pending')).toBeInTheDocument();
      expect(screen.getByText('Confirmations: 2/6')).toBeInTheDocument();
    });
  });
}); 
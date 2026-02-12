import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumModal from './PremiumModal';

describe('PremiumModal', () => {
	const mockOnModalClose = vi.fn();
	const mockOnUpgradeAttempt = vi.fn(() =>
		Promise.resolve({ status: 'success', message: 'Upgrade successful!' })
	);
	const mockOnUpgradeSuccess = vi.fn();

	const defaultProps = {
		isModalOpen: true,
		trackTitle: 'Test Premium Track',
		onModalClose: mockOnModalClose,
		onUpgradeAttempt: mockOnUpgradeAttempt,
		onUpgradeSuccess: mockOnUpgradeSuccess,
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders modal with track title when open', () => {
		render(<PremiumModal {...defaultProps} />);

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText(/Test Premium Track/i)).toBeInTheDocument();
		expect(screen.getByText(/is a premium stream/i)).toBeInTheDocument();
	});

	it('renders upgrade now button and close button', () => {
		render(<PremiumModal {...defaultProps} />);

		expect(screen.getByRole('button', { name: /upgrade now/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /close premium modal/i })).toBeInTheDocument();
	});

	it('displays upgrade message', () => {
		render(<PremiumModal {...defaultProps} />);

		expect(screen.getByText(/upgrade your account to access this content/i)).toBeInTheDocument();
	});

	it('does not render when isModalOpen is false', () => {
		render(<PremiumModal {...defaultProps} isModalOpen={false} />);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('calls onModalClose when close button is clicked', async () => {
		const user = userEvent.setup();
		render(<PremiumModal {...defaultProps} />);

		const closeButton = screen.getByRole('button', { name: /close premium modal/i });
		await user.click(closeButton);

		expect(mockOnModalClose).toHaveBeenCalledTimes(1);
	});

	it('calls onModalClose when Escape key is pressed', async () => {
		const user = userEvent.setup();
		render(<PremiumModal {...defaultProps} />);

		await user.keyboard('{Escape}');

		expect(mockOnModalClose).toHaveBeenCalledTimes(1);
	});

	it('calls onUpgradeAttempt when upgrade button is clicked', async () => {
		const user = userEvent.setup();
		render(<PremiumModal {...defaultProps} />);

		const upgradeButton = screen.getByRole('button', { name: /upgrade now/i });
		await user.click(upgradeButton);

		expect(mockOnUpgradeAttempt).toHaveBeenCalledTimes(1);
	});

	it('has correct accessibility attributes', () => {
		render(<PremiumModal {...defaultProps} />);

		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('aria-labelledby', 'premium-modal-title');
		expect(dialog).toHaveAttribute('aria-describedby', 'premium-modal-description');
	});
});

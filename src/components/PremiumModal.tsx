import React, { useState, useEffect, useRef, useCallback } from 'react';

type PremiumModalProps = {
	isModalOpen: boolean;
	trackTitle: string;
	onModalClose: (shouldResumeCurrentTrack: boolean) => void;
	onUpgradeAttempt: () => Promise<{ status: string; message: string; }>;
	onUpgradeSuccess?: () => void;
};

const PremiumModal: React.FC<PremiumModalProps> = ({
	isModalOpen,
	trackTitle,
	onModalClose,
	onUpgradeAttempt,
	onUpgradeSuccess,
}) => {
	const [submitting, setSubmitting] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const dismissModal = useCallback(() => {
		onModalClose(true);
	}, [onModalClose]);

	// Escape key handler
	useEffect(() => {
		if (!isModalOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				dismissModal();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isModalOpen, dismissModal]);

	// Focus trap
	useEffect(() => {
		if (!isModalOpen) return;

		closeButtonRef.current?.focus();

		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			const modal = modalRef.current;
			if (!modal) return;

			const focusableElements = modal.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === firstElement) {
				lastElement?.focus();
				e.preventDefault();
			} else if (document.activeElement === lastElement) {
				firstElement?.focus();
				e.preventDefault();
			}
		};

		document.addEventListener('keydown', handleTab);
		return () => document.removeEventListener('keydown', handleTab);
	}, [isModalOpen]);

	const handleUpgrade = async () => {
		if (submitting) return;

		try {
			setSubmitting(true);
			const result = await onUpgradeAttempt();
			if (result.status === 'success' && onUpgradeSuccess) {
				onUpgradeSuccess();
			}
			onModalClose(result.status === 'error');
			setSubmitting(false);
		} catch (err) {
			console.error('handleUpgrade failed:', err);
			onModalClose(true);
		}
	};

	if (!isModalOpen) return null;

	return (
		<div
			className="premium-overlay"
			role="dialog"
			aria-modal="true"
			aria-labelledby="premium-modal-title"
			aria-describedby="premium-modal-description"
		>
			<div className="premium-card" ref={modalRef}>
				<button
					ref={closeButtonRef}
					className="premium-close"
					type="button"
					onClick={dismissModal}
					aria-label="Close premium modal"
				>
					×
				</button>
				<h3 id="premium-modal-title">
					<strong>{trackTitle}</strong> is a premium stream.
				</h3>
				<p id="premium-modal-description" className="premium-message">
					Upgrade your account to access this content.
				</p>
				<button
					className="btn btn-premium"
					type="button"
					onClick={handleUpgrade}
					disabled={submitting}
				>
					{submitting ? 'Upgrading…' : 'Upgrade Now'}
				</button>
			</div>
		</div>
	);
};

export default PremiumModal;
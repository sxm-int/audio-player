import React, { useState, useEffect, useRef } from 'react';

type PremiumModalProps = {
	open: boolean;
	trackTitle: string;
	onClose: () => void;
	onUpgrade: () => Promise<{ status: string; message: string; }>;
	onSuccess?: () => void;
};

const PremiumModal: React.FC<PremiumModalProps> = ({
	open,
	trackTitle,
	onClose,
	onUpgrade,
	onSuccess,
}) => {
	const [submitting, setSubmitting] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	// Escape key handler
	useEffect(() => {
		if (!open) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [open, onClose]);

	// Focus trap
	useEffect(() => {
		if (!open) return;

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
	}, [open]);

	const handleUpgrade = async () => {
		if (submitting) return;

		try {
			setSubmitting(true);
			const result = await onUpgrade();
			if (result.status === 'success' && onSuccess) {
				onSuccess();
			}
		} catch (err) {
			console.error('Upgrade failed:', err);
			throw err;
		} finally {
			setSubmitting(false);
			onClose();
		}
	};

	if (!open) return null;

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
					onClick={onClose}
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
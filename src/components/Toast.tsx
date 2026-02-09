import React, { useEffect } from 'react';

type ToastProps = {
	message: string;
	type: string;
	onClose: () => void;
	duration?: number;
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
	const role = type === 'error' ? 'alert' : 'status';
	const ariaLive = type === 'error' ? 'assertive' : 'polite';

	useEffect(() => {
		const timerId = setTimeout(() => {
			onClose();
		}, duration);

    return () => clearTimeout(timerId);
	}, [onClose, duration]);

	return (
		<div
			className={`toast toast-${type}`}
			role={role}
			aria-live={ariaLive}
			aria-atomic="true"
		>
			<span className="toast-message">{message}</span>
		</div>
	);
};

export default Toast;
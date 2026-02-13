import React, { type FormEvent, useEffect, useState } from 'react';
import { VALID_EMAIL, VALID_PASS } from '../constants';

type LoginResult = { success: boolean; error?: string };

type LoginProps = {
	open: boolean;
	onClose: () => void;
	onSubmit?: (credentials: {
		email: string;
		password: string;
	}) => Promise<LoginResult | void> | LoginResult | void;
};

const Login: React.FC<LoginProps> = ({ open, onClose, onSubmit }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setError(null);
			setSubmitting(false);
		}
	}, [open]);

	if (!open) return null;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!onSubmit) {
			onClose();
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const result = await onSubmit({ email, password });
			if (result && (result.success === false || result.error)) {
				setError(
					result.error ?? 'Unable to log in with those credentials. Try again.',
				);
				return;
			}
			onClose();
		} catch (err) {
			console.error('Login submission failed:', err);
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="login-overlay" role="dialog" aria-modal="true">
			<div className="login-card">
				<button
					className="login-close"
					type="button"
					onClick={onClose}
					aria-label="Close login form"
				>
					×
				</button>
				<h2>Log In</h2>
				<p className="login-sub">
					Access curated streams with your SiriusXM credentials. The email and
					password are <b>"{VALID_EMAIL}"</b> and <b>"{VALID_PASS}"</b>
				</p>
				<form className="login-form" onSubmit={handleSubmit}>
					<label>
						Email address
						<input
							type="input"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</label>
					<label>
						Password
						<input
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</label>
					{error && (
						<div className="login-error" role="alert">
							{error}
						</div>
					)}
					<div className="login-actions">
						<button className="btn" type="button" onClick={onClose}>
							Cancel
						</button>
						<button className="btn" type="submit" disabled={submitting}>
							{submitting ? 'Logging in…' : 'Log In'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;

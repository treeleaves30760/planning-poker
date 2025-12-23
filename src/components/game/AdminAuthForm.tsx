interface AdminAuthFormProps {
	gameName: string;
	password: string;
	authError: string;
	onPasswordChange: (password: string) => void;
	onSubmit: () => void;
}

export default function AdminAuthForm({
	gameName,
	password,
	authError,
	onPasswordChange,
	onSubmit,
}: AdminAuthFormProps) {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="max-w-md w-full mx-auto">
				<div className="bg-white rounded-lg shadow-md p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
						Admin Authentication
					</h1>
					<p className="text-gray-600 mb-6 text-center">
						Enter the admin password for &ldquo;{gameName}&rdquo;
					</p>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => onPasswordChange(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && onSubmit()}
							placeholder="Enter admin password..."
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
						/>
						{authError && (
							<p className="text-red-600 text-sm mt-1">{authError}</p>
						)}
					</div>

					<button
						onClick={onSubmit}
						className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
					>
						Access Admin Panel
					</button>
				</div>
			</div>
		</div>
	);
}

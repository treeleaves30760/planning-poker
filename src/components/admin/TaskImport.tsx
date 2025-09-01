"use client";

import { useState, useRef } from "react";
import { Task } from "@/types/game";

interface TaskImportProps {
	onTasksImported: (tasks: Task[]) => void;
	isLoading?: boolean;
}

export default function TaskImport({
	onTasksImported,
	isLoading = false,
}: TaskImportProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [importStatus, setImportStatus] = useState<{
		type: "success" | "error" | "info" | null;
		message: string;
	}>({ type: null, message: "" });
	const fileInputRef = useRef<HTMLInputElement>(null);

	const parseCSV = (csvText: string): string[] => {
		const lines = csvText.split("\n").filter((line) => line.trim());
		if (lines.length < 2) {
			throw new Error("CSV must have at least a header row and one data row");
		}

		const headers = lines[0]
			.split(",")
			.map((header) => header.trim().toLowerCase().replace(/"/g, ""));
		const taskColumnIndex = headers.findIndex(
			(header) =>
				header === "task" ||
				header === "description" ||
				header === "story" ||
				header === "title"
		);

		if (taskColumnIndex === -1) {
			throw new Error(
				"CSV must have a 'task', 'description', 'story', or 'title' column"
			);
		}

		const tasks: string[] = [];
		for (let i = 1; i < lines.length; i++) {
			const columns = lines[i]
				.split(",")
				.map((col) => col.trim().replace(/"/g, ""));
			if (columns[taskColumnIndex] && columns[taskColumnIndex].trim()) {
				tasks.push(columns[taskColumnIndex].trim());
			}
		}

		return tasks;
	};

	const processFile = async (file: File) => {
		try {
			setImportStatus({ type: "info", message: "Processing file..." });

			if (!file.name.toLowerCase().endsWith(".csv")) {
				throw new Error("Please upload a CSV file");
			}

			const text = await file.text();
			const taskDescriptions = parseCSV(text);

			if (taskDescriptions.length === 0) {
				throw new Error("No valid tasks found in the CSV file");
			}

			const tasks: Task[] = taskDescriptions.map((description) => ({
				id: Math.random().toString(36).substr(2, 9),
				description,
				votes: [],
				revealed: false,
				allowChanges: false,
			}));

			onTasksImported(tasks);
			setImportStatus({
				type: "success",
				message: `Successfully imported ${tasks.length} task${
					tasks.length === 1 ? "" : "s"
				}`,
			});

			// Clear the file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Error processing file:", error);
			setImportStatus({
				type: "error",
				message:
					error instanceof Error ? error.message : "Failed to process file",
			});
		}
	};

	const handleFileSelect = (files: FileList | null) => {
		if (files && files[0]) {
			processFile(files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const clearStatus = () => {
		setImportStatus({ type: null, message: "" });
	};

	const downloadExampleCSV = () => {
		const csvContent = `task,priority,assignee
"Implement user authentication",high,developer1
"Add password reset functionality",medium,developer2
"Create dashboard UI",low,designer1
"Setup CI/CD pipeline",high,devops1
"Write API documentation",medium,developer3`;

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", "tasks_example.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900">
					Import Tasks from CSV
				</h3>
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
				>
					<span>{isCollapsed ? "Show" : "Hide"}</span>
					<svg
						className={`w-4 h-4 transform transition-transform ${
							isCollapsed ? "rotate-0" : "rotate-180"
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			{!isCollapsed && (
				<>
					<div
						className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
							isDragging
								? "border-blue-400 bg-blue-50"
								: "border-gray-300 hover:border-gray-400"
						} ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<div className="space-y-3">
							<div className="text-gray-500">
								<svg
									className="mx-auto w-12 h-12"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
							</div>
							<div>
								<p className="text-gray-600">
									Drag and drop your CSV file here, or{" "}
									<button
										onClick={() => fileInputRef.current?.click()}
										className="text-blue-600 hover:text-blue-700 font-medium"
										disabled={isLoading}
									>
										browse to upload
									</button>
								</p>
								<p className="text-sm text-gray-500 mt-2">
									CSV must contain a 'task', 'description', 'story', or 'title'
									column
								</p>
							</div>
						</div>
					</div>

					<input
						ref={fileInputRef}
						type="file"
						accept=".csv"
						onChange={(e) => handleFileSelect(e.target.files)}
						className="hidden"
						disabled={isLoading}
					/>

					{importStatus.type && (
						<div
							className={`mt-4 p-3 rounded-lg flex items-center justify-between ${
								importStatus.type === "success"
									? "bg-green-50 border border-green-200 text-green-800"
									: importStatus.type === "error"
									? "bg-red-50 border border-red-200 text-red-800"
									: "bg-blue-50 border border-blue-200 text-blue-800"
							}`}
						>
							<span className="text-sm">{importStatus.message}</span>
							<button
								onClick={clearStatus}
								className="ml-2 text-current hover:opacity-70"
							>
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					)}

					<div className="mt-4 text-sm text-gray-600">
						<div className="flex items-center justify-between mb-2">
							<h4 className="font-medium">CSV Format Example:</h4>
							<button
								onClick={downloadExampleCSV}
								className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
								Download Example
							</button>
						</div>
						<div className="bg-gray-50 p-3 rounded border font-mono text-xs">
							<div>task,priority,assignee</div>
							<div>
								&quot;Implement user authentication&quot;,high,developer1
							</div>
							<div>
								&quot;Add password reset functionality&quot;,medium,developer2
							</div>
							<div>&quot;Create dashboard UI&quot;,low,designer1</div>
							<div>&quot;Setup CI/CD pipeline&quot;,high,devops1</div>
						</div>
						<p className="mt-2 text-xs">
							Only the 'task' column will be imported. Other columns are
							ignored.
						</p>
					</div>
				</>
			)}
		</div>
	);
}

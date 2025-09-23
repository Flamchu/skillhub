import { env } from "../config/env";

interface SummarizeRequest {
	inputs: string;
	parameters?: {
		max_length?: number;
		min_length?: number;
		do_sample?: boolean;
	};
}

interface SummarizeResponse {
	summary_text: string;
}

class AiSummaryService {
	private readonly baseUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
	private readonly maxRetries = 3;
	private readonly retryDelay = 2000; // 2 seconds

	/**
	 * Generate a concise AI summary from a long description
	 */
	async generateSummary(description: string): Promise<string | null> {
		if (!description || description.trim().length === 0) {
			return null;
		}

		// clean and truncate description for better processing
		const cleanDescription = this.cleanDescription(description);
		if (cleanDescription.length < 50) {
			// if description is too short, return it as-is
			return cleanDescription;
		}

		try {
			const summary = await this.callHuggingFace(cleanDescription);
			return this.postProcessSummary(summary);
		} catch (error) {
			console.error("Failed to generate AI summary:", error);
			// fallback to truncated original description
			return this.createFallbackSummary(cleanDescription);
		}
	}

	/**
	 * Clean raw description by removing URLs, timestamps, excessive whitespace
	 */
	private cleanDescription(description: string): string {
		return (
			description
				// remove URLs
				.replace(/https?:\/\/[^\s]+/g, "")
				// remove email addresses
				.replace(/[^\s]+@[^\s]+\.[^\s]+/g, "")
				// remove timestamp patterns like [00:00] or (2:30)
				.replace(/[\[\(]\d{1,2}:\d{2}[\]\)]/g, "")
				// remove excessive whitespace and newlines
				.replace(/\s+/g, " ")
				.trim()
				// limit length for API processing
				.substring(0, 2000)
		);
	}

	/**
	 * Call Hugging Face inference API with retry logic
	 */
	private async callHuggingFace(text: string): Promise<string> {
		const requestBody: SummarizeRequest = {
			inputs: text,
			parameters: {
				max_length: 150,
				min_length: 30,
				do_sample: false,
			},
		};

		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				const response = await fetch(this.baseUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						// using public inference API (no token required, but rate limited)
						...(env.HUGGINGFACE_API_KEY && {
							Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
						}),
					},
					body: JSON.stringify(requestBody),
				});

				if (!response.ok) {
					if (response.status === 503 && attempt < this.maxRetries) {
						// model is loading, wait and retry
						console.log(`AI model loading, retrying in ${this.retryDelay}ms... (attempt ${attempt}/${this.maxRetries})`);
						await this.sleep(this.retryDelay);
						continue;
					}
					throw new Error(`HTTP ${response.status}: ${await response.text()}`);
				}

				const result = (await response.json()) as SummarizeResponse[];
				if (!result || !Array.isArray(result) || result.length === 0) {
					throw new Error("Invalid response format from Hugging Face API");
				}

				return result[0].summary_text;
			} catch (error) {
				if (attempt === this.maxRetries) {
					throw error;
				}
				console.log(`AI summary attempt ${attempt} failed, retrying...`, error);
				await this.sleep(this.retryDelay);
			}
		}

		throw new Error("Max retries exceeded");
	}

	/**
	 * Post-process the AI-generated summary
	 */
	private postProcessSummary(summary: string): string {
		return (
			summary
				.trim()
				// ensure first letter is capitalized
				.replace(/^./, (char) => char.toUpperCase())
				// ensure it ends with proper punctuation
				.replace(/[^\.\!\?]$/, (match) => match + ".")
		);
	}

	/**
	 * Create a fallback summary by intelligently truncating the original description
	 */
	private createFallbackSummary(description: string): string {
		// find first complete sentence within reasonable length
		const sentences = description.split(/[\.!?]+/);
		let summary = "";

		for (const sentence of sentences) {
			const trimmedSentence = sentence.trim();
			if (summary.length + trimmedSentence.length > 200) break;
			if (trimmedSentence.length > 10) {
				summary += (summary ? " " : "") + trimmedSentence;
			}
		}

		// if no good sentences found, just truncate
		if (!summary) {
			summary = description.substring(0, 200).trim();
		}

		return this.postProcessSummary(summary);
	}

	/**
	 * Sleep utility for retry delays
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// export singleton instance
export const aiSummaryService = new AiSummaryService();

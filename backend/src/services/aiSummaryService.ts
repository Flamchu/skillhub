class AiSummaryService {
	/**
	 * generate concise summary using intelligent text processing
	 */
	async generateSummary(description: string): Promise<string | null> {
		if (!description || description.trim().length === 0) {
			return null;
		}

		// clean and process description
		const cleanDescription = this.cleanDescription(description);
		if (cleanDescription.length < 50) {
			// if description is too short, return it as-is
			return cleanDescription;
		}

		// create intelligent summary from cleaned text
		return this.createIntelligentSummary(cleanDescription);
	}

	/**
	 * clean description by removing urls, timestamps, whitespace
	 */
	private cleanDescription(description: string): string {
		return (
			description
				// remove urls
				.replace(/https?:\/\/[^\s]+/g, "")
				// remove email addresses
				.replace(/[^\s]+@[^\s]+\.[^\s]+/g, "")
				// remove timestamp patterns like [00:00] or (2:30)
				.replace(/[\[\(]\d{1,2}:\d{2}[\]\)]/g, "")
				// remove excess whitespace and newlines
				.replace(/\s+/g, " ")
				.trim()
				// limit length for processing
				.substring(0, 2000)
		);
	}

	/**
	 * create intelligent summary from key sentences
	 */
	private createIntelligentSummary(description: string): string {
		// find sentences with key information
		const sentences = description.split(/[\.!?]+/).filter((s) => s.trim().length > 10);

		let summary = "";
		const maxLength = 200;

		// prioritize sentences with learning indicators
		const keyWords = ["learn", "course", "tutorial", "guide", "how to", "introduction", "beginner", "advanced", "overview", "fundamentals", "basics", "master", "comprehensive", "complete", "step by step"];

		// find sentences with key learning words
		for (const sentence of sentences) {
			const trimmedSentence = sentence.trim();
			const hasKeyWord = keyWords.some((keyword) => trimmedSentence.toLowerCase().includes(keyword.toLowerCase()));

			if (hasKeyWord && summary.length + trimmedSentence.length <= maxLength) {
				summary += (summary ? " " : "") + trimmedSentence;
			}
		}

		// if not enough content, add first sentences
		if (summary.length < 50) {
			summary = "";
			for (const sentence of sentences.slice(0, 3)) {
				const trimmedSentence = sentence.trim();
				if (summary.length + trimmedSentence.length > maxLength) break;
				summary += (summary ? " " : "") + trimmedSentence;
			}
		}

		// if no good summary, truncate intelligently
		if (!summary || summary.length < 20) {
			summary = description.substring(0, maxLength).trim();
			// try to end at a word boundary
			const lastSpace = summary.lastIndexOf(" ");
			if (lastSpace > maxLength * 0.8) {
				summary = summary.substring(0, lastSpace);
			}
		}

		return this.postProcessSummary(summary);
	}

	/**
	 * post-process generated summary
	 */
	private postProcessSummary(summary: string): string {
		return (
			summary
				.trim()
				// capitalize first letter
				.replace(/^./, (char) => char.toUpperCase())
				// add proper punctuation
				.replace(/[^\.\!\?]$/, (match) => match + ".")
		);
	}
}

// export singleton instance
export const aiSummaryService = new AiSummaryService();

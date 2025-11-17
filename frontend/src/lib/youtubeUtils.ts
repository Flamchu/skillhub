/**
 * extract youtube video id from various url formats
 */
export function extractYouTubeVideoId(url: string | undefined | null): string | null {
	if (!url) return null;

	// trim whitespace
	url = url.trim();
	if (!url) return null;

	// if it's already just an 11-character video id
	if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
		return url;
	}

	try {
		// handle various youtube url formats
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
			/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[1]) {
				return match[1];
			}
		}

		// try using URL api as fallback
		const urlObj = new URL(url);

		// youtube.com/watch?v=ID
		if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
			return urlObj.searchParams.get("v");
		}

		// youtu.be/ID
		if (urlObj.hostname === "youtu.be") {
			return urlObj.pathname.slice(1).split("/")[0];
		}

		return null;
	} catch {
		// if url parsing fails, return null
		return null;
	}
}

/**
 * extract youtube playlist id from url or raw playlist id
 */
export function extractYouTubePlaylistId(url: string | undefined | null): string | null {
	if (!url) return null;

	// trim whitespace
	url = url.trim();
	if (!url) return null;

	// if it's already a playlist id (starts with PL)
	if (/^PL[a-zA-Z0-9_-]+$/.test(url)) {
		return url;
	}

	try {
		// handle youtube playlist url formats
		const patterns = [/[?&]list=(PL[a-zA-Z0-9_-]+)/, /youtube\.com\/playlist\?list=(PL[a-zA-Z0-9_-]+)/];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[1]) {
				return match[1];
			}
		}

		// try using URL api as fallback
		const urlObj = new URL(url);
		const listParam = urlObj.searchParams.get("list");
		if (listParam && /^PL[a-zA-Z0-9_-]+$/.test(listParam)) {
			return listParam;
		}

		return null;
	} catch {
		return null;
	}
}

import { CreateBucketCommand, DeleteObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { env } from "../config/env";

const normalizeBase = (value?: string | null) => value?.replace(/\/+$/, "");

const requiredKeys: (keyof typeof env)[] = ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET"];
const storageEnabled = requiredKeys.every((key) => Boolean(env[key]));

const s3Client = storageEnabled
	? new S3Client({
			region: env.S3_REGION || "us-east-1",
			endpoint: env.S3_ENDPOINT,
			forcePathStyle: env.S3_FORCE_PATH_STYLE !== "false",
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY_ID!,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
			},
		})
	: null;

let bucketReady: Promise<void> | null = null;

const ensureBucket = async () => {
	if (!s3Client || !env.S3_BUCKET) {
		return;
	}

	if (!bucketReady) {
		bucketReady = (async () => {
			try {
				await s3Client.send(
					new HeadBucketCommand({
						Bucket: env.S3_BUCKET!,
					}),
				);
			} catch (error: any) {
				const notFound = error?.$metadata?.httpStatusCode === 404 || error?.Code === "NotFound";
				if (notFound) {
					await s3Client.send(
						new CreateBucketCommand({
							Bucket: env.S3_BUCKET!,
						}),
					);
					return;
				}
				// bucket already exists or other AWS errors are safe to ignore here
				const alreadyOwned = error?.Code === "BucketAlreadyOwnedByYou" || error?.Code === "BucketAlreadyExists";
				if (!alreadyOwned) {
					console.error("failed to ensure s3 bucket", error);
					throw error;
				}
			}
		})();
	}

	return bucketReady;
};

const buildPublicUrl = (key: string) => {
	const bucket = env.S3_BUCKET;
	const endpoint = env.S3_ENDPOINT;
	const base = normalizeBase(env.S3_PUBLIC_URL);
	if (base) {
		return `${base}/${key}`;
	}

	if (endpoint && bucket) {
		try {
			const parsed = new URL(endpoint);
			return `${parsed.protocol}//${parsed.host}/${bucket}/${key}`;
		} catch {
			return `${endpoint}/${bucket}/${key}`;
		}
	}

	return key;
};

const keyFromUrl = (url?: string | null) => {
	if (!url || !env.S3_BUCKET) {
		return null;
	}

	const base = normalizeBase(env.S3_PUBLIC_URL);
	if (base && url.startsWith(`${base}/`)) {
		return url.slice(base.length + 1);
	}

	if (env.S3_ENDPOINT) {
		const endpointBase = `${normalizeBase(env.S3_ENDPOINT)}/${env.S3_BUCKET}`;
		if (url.startsWith(`${endpointBase}/`)) {
			return url.slice(endpointBase.length + 1);
		}
	}

	return null;
};

export const objectStorage = {
	isEnabled: storageEnabled,
	async uploadProfilePicture(userId: string, buffer: Buffer) {
		if (!s3Client || !env.S3_BUCKET) {
			throw new Error("object storage is not configured");
		}

		await ensureBucket();

		const key = `profile-pictures/${userId}/${Date.now()}-${randomUUID()}.webp`;
		const putCommand = new PutObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: "image/webp",
			CacheControl: "public,max-age=31536000,immutable",
		});

		await s3Client.send(putCommand);

		return {
			key,
			url: buildPublicUrl(key),
		};
	},
	async deleteByUrl(url?: string | null) {
		if (!s3Client || !env.S3_BUCKET) {
			return;
		}

		const key = keyFromUrl(url);
		if (!key) {
			return;
		}

		try {
			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: key,
				}),
			);
		} catch (error) {
			console.warn("failed to delete profile picture from s3", error);
		}
	},
};

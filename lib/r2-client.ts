import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'rota-cross-data';

function getR2Client(): S3Client {
	if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
		throw new Error('Missing R2 credentials in environment variables');
	}

	return new S3Client({
		region: 'auto',
		endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: R2_ACCESS_KEY_ID,
			secretAccessKey: R2_SECRET_ACCESS_KEY,
		},
	});
}

export async function uploadToR2(key: string, body: string): Promise<string> {
	const client = getR2Client();

	await client.send(new PutObjectCommand({
		Bucket: R2_BUCKET_NAME,
		Key: key,
		Body: body,
		ContentType: 'application/json',
	}));

	// Return public URL (requires public bucket or custom domain)
	return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
}

export async function listR2Objects(prefix?: string): Promise<string[]> {
	const client = getR2Client();

	const response = await client.send(new ListObjectsV2Command({
		Bucket: R2_BUCKET_NAME,
		Prefix: prefix,
	}));

	return response.Contents?.map(obj => obj.Key || '') || [];
}

export { getR2Client, R2_BUCKET_NAME };

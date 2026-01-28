import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getR2Client, R2_BUCKET_NAME } from '@/lib/r2-client';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

export async function GET() {
	const results = {
		firebase: { status: 'unknown', message: '' },
		r2: { status: 'unknown', message: '' },
		timestamp: new Date().toISOString(),
	};

	// Test Firebase connection
	try {
		const db = getFirebaseAdmin();
		// Try to access Firestore (this will validate credentials)
		const testRef = db.collection('_health_check');
		await testRef.limit(1).get();
		results.firebase = { status: 'connected', message: 'Firestore connection successful' };
	} catch (error) {
		results.firebase = {
			status: 'error',
			message: error instanceof Error ? error.message : 'Unknown Firebase error'
		};
	}

	// Test R2 connection
	try {
		const r2Client = getR2Client();
		await r2Client.send(new ListBucketsCommand({}));
		results.r2 = { status: 'connected', message: `R2 bucket: ${R2_BUCKET_NAME}` };
	} catch (error) {
		results.r2 = {
			status: 'error',
			message: error instanceof Error ? error.message : 'Unknown R2 error'
		};
	}

	const allConnected = results.firebase.status === 'connected' && results.r2.status === 'connected';

	return NextResponse.json(results, {
		status: allConnected ? 200 : 503
	});
}

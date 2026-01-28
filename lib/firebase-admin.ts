import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let db: Firestore | undefined;

export function getFirebaseAdmin(): Firestore {
	if (!app && getApps().length === 0) {
		const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

		if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
			throw new Error('Missing Firebase Admin credentials in environment variables');
		}

		app = initializeApp({
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: privateKey,
			}),
		});
	}

	if (!db) {
		db = getFirestore();
	}

	return db;
}

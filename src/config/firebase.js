const admin = require('firebase-admin');

// Initialize Firebase Admin
// Using the specific service account file for jobstoday-3269a project
let serviceAccount;
try {
  serviceAccount = require('../jobstoday-3269a-firebase-adminsdk-fbsvc-548b25d8f1.json');
  console.log('✅ Using Firebase service account: jobstoday-3269a-firebase-adminsdk-fbsvc-548b25d8f1.json');
} catch (error) {
  console.warn('⚠️  Firebase service account not found. Please ensure jobstoday-3269a-firebase-adminsdk-fbsvc-548b25d8f1.json is in the src directory.');
  console.warn('   You can download it from Firebase Console > Project Settings > Service Accounts');
  
  // For development, you can use environment variables
  if (process.env.FIREBASE_PROJECT_ID) {
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };
  }
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully for project: jobstoday-3269a');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
  }
} else {
  console.warn('⚠️  Firebase Admin not initialized - no service account available');
}

module.exports = admin; 
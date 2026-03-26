const fs = require('fs');

if (process.env.GOOGLE_SERVICES_JSON) {
    const buffer = Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64');
    fs.writeFileSync('./google-services.json', buffer);
    console.log('✅ google-services.json written from env var');
} else {
    console.warn('⚠️ GOOGLE_SERVICES_JSON not set, skipping...');
}

if (process.env.GOOGLE_SERVICES_INFO_PLIST) {
    const buffer = Buffer.from(process.env.GOOGLE_SERVICES_INFO_PLIST, 'base64');
    fs.writeFileSync('./GoogleService-Info.plist', buffer);
    console.log('✅ GoogleService-Info.plist written from env var');
} else {
    console.warn('⚠️ GOOGLE_SERVICES_INFO_PLIST not set, skipping...');
}

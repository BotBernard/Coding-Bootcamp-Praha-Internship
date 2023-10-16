"use strict"

require('dotenv').config();  // Import dotenv module
const axios = require('axios');  // Import axios module

// Declaring constants
const screenshotmachine = require('screenshotmachine');   // Import screenshotmachine module
const { google } = require('googleapis');  // Import googleapis module
const secretPhrase = ''; // Secret phrase is empty but needed to generate the screenshots' url


const webSites = { // Dictionary with different websites' url as values and the screenshots names as keys
    '1_iFunded': 'https://ifunded.de/en/',
    '2_Property Partener': 'www.propertypartner.co',
    '3_PropertyMoose': 'propertymoose.co.uk',
    '4_Homegrown': 'www.homegrown.co.uk',
    '5_Realty Mogul': 'https://www.realtymogul.com'
};

async function uploadImageToDrive(dictKey, aScreenshotUrl) {
    const fileName = `${dictKey}.jpg`;

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './googlekey.json',
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const driveService = google.drive({
            version: 'v3',
            auth
        });

        const fileMetaData = {
            'name': fileName,
            'parents': [process.env.GOOGLE_API_FOLDER_ID]
        };

        // Download the screenshot from the URL
        const response = await axios.get(aScreenshotUrl, { responseType: 'stream' });

        const media = {
            mimeType: 'image/jpg',
            body: response.data
        };

        const uploadResponse = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });

        return uploadResponse.data.id;
    } catch (err) {
        console.log('Upload failed:', err);
    }
}


for (let key in webSites) {
    let options = {
        // Mandatory parameters
        url: webSites[key],

        // Optional parameters
        dimension: '1920x1080',
        device: 'desktop',
        format: 'jpg',
        cacheLimit: '0',
        zoom: '100'
    }


    let screenshotUrl = screenshotmachine.generateScreenshotApiUrl(process.env.customerKey, secretPhrase, options);

    uploadImageToDrive(key, screenshotUrl).then(data => {
        console.log(`Screenshot ${data} successfully imported to Google Drive.`)
    });
}
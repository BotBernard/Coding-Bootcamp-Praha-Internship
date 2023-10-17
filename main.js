"use strict"

// Import modules
require('dotenv').config();  
const axios = require('axios');  
const screenshotmachine = require('screenshotmachine');   
const { google } = require('googleapis'); 

const secretPhrase = ''; // Secret phrase is empty but needed to generate the screenshots' url


const webSites = { // Dictionary with different websites' url as values and the screenshots names as keys
    '1_iFunded': 'https://ifunded.de/en/',
    '2_Property Partener': 'www.propertypartner.co',
    '3_PropertyMoose': 'propertymoose.co.uk',
    '4_Homegrown': 'www.homegrown.co.uk',
    '5_Realty Mogul': 'https://www.realtymogul.com'
};


// Returns the screenshot uploaded to google drive;

async function uploadImageToDrive(dictKey, aScreenshotUrl) {
    const fileName = `${dictKey}.jpg`;

    try {
        // Authentification to google drive
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

        // GET request to download the screenshot from the URL
        const response = await axios.get(aScreenshotUrl, { responseType: 'stream' });

        const media = {
            mimeType: 'image/jpg',
            body: response.data
        };

        // Upload the image to Google Drive
        const uploadResponse = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        });

        return uploadResponse.data.id;
    }
    catch (err) { // Display an error if the upload on Google Drive cannot be done
        console.log('Upload failed:', err);
    }
}

// Loop through the websites and upload screenshots to Google Drive
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

    // Create the url to the screeshot for the current website
    let screenshotUrl = screenshotmachine.generateScreenshotApiUrl(process.env.customerKey, secretPhrase, options);

    // Call the function to upload the image to the drive
    uploadImageToDrive(key, screenshotUrl).then(data => {
        console.log(`Screenshot ${data} successfully imported to Google Drive.`)
    });
}
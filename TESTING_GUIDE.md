# LeoFinder Testing Guide

After deploying the backend to Render and the frontend to Netlify, follow these steps to test the complete user flow.

## 1. Test the Scraper and Property View

1.  Open your deployed Netlify site.
2.  Enter a valid ZIP code in the search bar and click "Scrape".
3.  Verify that properties from both Foreclosure.com and Zillow FSBO appear in the listings.
4.  Check the property details to ensure data is being parsed correctly.

## 2. Test AI Email Generation

1.  Click on a property to view its details.
2.  Click the "Generate AI Email" button.
3.  A modal should appear with a personalized email draft.
4.  Verify that the email content is relevant to the property and follows the intended persona.

## 3. Test Push Notifications

1.  Ensure you have enabled push notifications in your browser for the site.
2.  High-scoring properties should trigger a push notification. You may need to scrape a few different ZIP codes to find one.
3.  Verify that you receive a push notification on your desktop or mobile device.

## 4. Test Foreclosure.com Login

1.  Monitor the backend logs in your Render dashboard.
2.  When the scraper runs, look for logs indicating a successful login to Foreclosure.com.
3.  If there are login errors, double-check your `FORECLOSURE_USER` and `FORECLOSURE_PASS` environment variables in Render.

## 5. Monitor for Errors

1.  Keep an eye on both your Render and Netlify logs for any runtime errors.
2.  Test various user interactions to ensure the application is stable.

If you encounter any issues, the logs will be the best place to start debugging.
const axios = require('axios');

exports.handler = async (event, context) => {
    // 1. Capture the target URL from the query string
    // Example: /.netlify/functions/proxy?url=https://google.com
    const targetUrl = event.queryStringParameters.url;
    
    if (!targetUrl) {
        return { statusCode: 400, body: "Missing URL parameter" };
    }

    try {
        // 2. Forward the request to your Scramjet server
        // We append the target URL to your server's proxy path
        const scramjetServer = `http://82.21.72.150:8080/scramjet/${encodeURIComponent(targetUrl)}`;

        const response = await axios({
            method: event.httpMethod,
            url: scramjetServer,
            responseType: 'arraybuffer', // Important for images/scripts
            headers: {
                // Pass through relevant headers, but exclude 'host'
                'User-Agent': event.headers['user-agent'],
                'Accept': event.headers['accept']
            },
            timeout: 10000
        });

        // 3. Return the result to the browser via Netlify's HTTPS
        return {
            statusCode: 200,
            headers: {
                "Content-Type": response.headers['content-type'] || "text/html",
                "Access-Control-Allow-Origin": "*", // Solve CORS
            },
            body: response.data.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

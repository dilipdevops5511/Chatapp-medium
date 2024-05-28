import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import http from 'k6/http';
import { check } from 'k6';

// Define the stages for the test
export let options = {
    stages: [
        // Ramp up to 100 VUs over 60 seconds and hold for 2 minutes
        { duration: "2m", target: 100 },
    ],
};

// Open the CSV file and parse the data using papaparse
const csvData = open('data.csv');
const parsedData = papaparse.parse(csvData).data;

// Remove header row from the CSV data
parsedData.shift();

export default function () {

    // Define the base URL for the API
    const baseUrl = 'https://lt-1-stage-api.penpencil.co/batch-service/v1/fee/upcoming-instalments';

    // Loop through the data and make a GET request for each row
    parsedData.forEach(row => {
        // Extract the token from the row
        const [username, password, token] = row;

        // Set the Authorization header using the token
        const headers = {
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'integration-with': '',
            'sec-ch-ua-mobile': '?0',
            'client-version': '4.2.1',
            'Authorization': `Bearer ${token}`, // Using the token from the CSV
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://staging.physicswallah.live/',
            'randomId': '4c2c9314-6595-4951-a08f-ac59b4b10edd',
            'client-id': '5eb393ee95fab7468a79d189',
            'client-type': 'WEB',
            'sec-ch-ua-platform': '"macOS"'
        };

        let response = http.get(baseUrl, { headers });

        // Check the response for various conditions
        check(response, {
            // The status code should be 200
            'status is 200': (r) => r.status === 200,
        });
    });
}

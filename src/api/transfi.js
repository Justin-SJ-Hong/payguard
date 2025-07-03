// // transfi.ts
// import axios from 'axios'
// // const axios = require('axios');

// const sandboxBaseUrl = 'https://sandbox.transfi.com/api/v2';
// const sandboxUsername = import.meta.env.VITE_TRANSFI_CLIENT_ID;
// const sandboxPassword = import.meta.env.VITE_TRANSFI_CLIENT_SECRET;

// // Check if credentials are set
// if (!sandboxUsername || !sandboxPassword) {
//     console.error("Error: Transfi API credentials (VITE_TRANSFI_CLIENT_ID and VITE_TRANSFI_CLIENT_SECRET) are not set as environment variables.");
//     process.exit(1); // Exit the script if credentials are missing
// }

// const credentials = `${sandboxUsername}:${sandboxPassword}`;

// const base64Credentials = btoa(`${credentials}`);

// const authHeader = `Basic ${base64Credentials}`;

// // Example: Fetch Supported Currencies (GET request)
// async function fetchSupportedCurrencies() {
//   try {
//     const response = await axios.get(`${sandboxBaseUrl}/supported-currencies`, {
//       headers: {
//         'Accept': 'application/json',
//         'Authorization': authHeader
//         // No need for Content-Type for GET requests without a body
//       },
//       params: { // Example parameter for direction, adjust based on endpoint
//           direction: 'withdraw'
//       }
//     });

//     console.log('Supported Currencies:', response.data);
//   } catch (error) {
//     // console.error('Error fetching currencies:', error.response ? error.response.data : error.message);
//     console.error('Error fetching currencies:', error);
//   }
// }

// // Call the function to test
// fetchSupportedCurrencies();

// // Example structure for a POST request (e.g., creating an order)

// async function createPayoutOrder() {
//     const orderData = {
//         // ... your payout order details based on API documentation
//         firstName: "John",
//         lastName: "Doe",
//         email: "johndoe@example.com",
//         country: "ID", // Example country
//         amount: 100,
//         currency: "IDR", // Example currency
//         paymentCode: "dana", // Example payment method code
//         paymentAccountNumber: "1234567890", // Example account number
//         type: "individual",
//         partnerId: "your-internal-order-ref-123",
//         redirectUrl: "https://your-website.com/callback"
//         // ... other required fields
//     };

//     try {
//         const response = await axios.post(`${sandboxBaseUrl}/orders/payout`, orderData, {
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json', // Required for requests with a body
//                 'Authorization': authHeader
//             }
//         });

//         console.log('Payout Order Created:', response.data);
//     } catch (error) {
//         // console.error('Error creating payout order:', error.response ? error.response.data : error.message);
//         console.error('Error creating payout order:', error);
//     }
// }

// // Uncomment to test creating a payout order
// // createPayoutOrder();

// // const headers = {
// //   'Authorization': `Basic ${encodedCredentials}`,
// //   'Content-Type': 'application/json',
// // }

// // interface OnboardRequest {
// //   user_id: string
// //   country: string
// //   fiat_currency: string
// //   crypto_currency: string
// //   wallet_address: string
// //   redirect_url: string
// // }

// // export async function createOnboardingLink(req: OnboardRequest) {
// //   try {
// //     const response = await axios.post(`${BASE_URL}/onboard`, req, { headers })
// //     console.log('✅ Onboarding Link:', response.data.onboarding_url)
// //     return response.data.onboarding_url
// //   } catch (error: any) {
// //     console.error('❌ Failed to create onboarding link:', error.response?.data || error.message)
// //     throw error
// //   }
// // }


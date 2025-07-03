// src/pages/OnboardTest.tsx
// import { useEffect } from 'react'
// import { createOnboardingLink } from '../api/transfi'

// export default function OnboardTest() {
//   useEffect(() => {
//     const fetchLink = async () => {
//       try {
//         const url = await createOnboardingLink({
//           user_id: 'test_user_001',
//           country: 'IN',
//           fiat_currency: 'INR',
//           crypto_currency: 'USDT',
//           wallet_address: '0x123abc456def7890',
//           redirect_url: 'https://example.com/success'
//         })
//         window.open(url, '_blank') // 새 창으로 열기
//       } catch (err) {
//         console.error('KYC 생성 실패:', err)
//         alert('KYC 링크 생성 실패!')
//       }
//     }

//     fetchLink()
//   }, [])

//   return <div>📨 KYC 링크 생성 중입니다...</div>
// }

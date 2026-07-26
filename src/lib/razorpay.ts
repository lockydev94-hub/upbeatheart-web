import crypto from 'crypto'

const KEY_ID     = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!

export async function createRazorpayOrder(amount: number, campaignId: string) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: amount * 100,       // paise
      currency: 'INR',
      receipt: `upbeat_${campaignId}_${Date.now()}`,
      notes: { campaignId },
    }),
  })
  if (!response.ok) throw new Error('Razorpay order creation failed')
  return response.json()
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const body = orderId + '|' + paymentId
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(body)
    .digest('hex')
  return expected === signature
}

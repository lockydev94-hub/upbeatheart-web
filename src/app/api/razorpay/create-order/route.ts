import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, campaignId, campaignName, donorName, donorPhone, donorEmail, anonymous } = body

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const receiptTag = campaignId ? campaignId.slice(0, 12) : 'general'
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${receiptTag}_${Date.now()}`,
      notes: {
        campaignId:   campaignId   ?? '',
        campaignName: campaignName ?? '',
        donorName:    anonymous ? 'Anonymous' : (donorName ?? ''),
        donorPhone:   anonymous ? '' : (donorPhone ?? ''),
        donorEmail:   anonymous ? '' : (donorEmail ?? ''),
        source:       'website',
      },
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err: any) {
    console.error('[POST /api/razorpay/create-order]', err)
    return NextResponse.json(
      { error: err?.error?.description ?? err?.message ?? 'Failed to create order' },
      { status: 500 },
    )
  }
}

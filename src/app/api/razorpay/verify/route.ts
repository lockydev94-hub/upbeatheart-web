import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

function autoReceiptNumber() {
  const now = new Date()
  return `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      campaignId,
      campaignName,
      donorName,
      donorPhone,
      donorEmail,
      amount,
      anonymous,
    } = body

    // ── 1. Verify signature ──────────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // ── 2. Write donation to Firestore ───────────────────────────────────────
    const db = getAdminDb()
    const ref = await db.collection('donations').add({
      // campaign (empty strings for general/non-campaign donation)
      campaignId:        campaignId   ?? '',
      campaignName:      campaignName ?? '',   // field name matches admin schema

      // donor
      donorName:         anonymous ? 'Anonymous' : (donorName ?? 'Anonymous'),
      donorPhone:        anonymous ? '' : (donorPhone ?? ''),
      donorEmail:        anonymous ? '' : (donorEmail ?? ''),
      amount:            typeof amount === 'number' ? amount : 0,
      anonymous:         !!anonymous,

      // payment
      paymentMethod:     'razorpay',
      source:            'online',
      status:            'paid',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      receiptNumber:     autoReceiptNumber(),

      // display / admin
      showOnWebsite:     false,   // admin must explicitly approve via donor wall toggle
      showAmountPublic:  false,

      createdAt:         FieldValue.serverTimestamp(),
      updatedAt:         FieldValue.serverTimestamp(),
    })

    // ── 3. Update campaign amountRaised if linked ────────────────────────────
    if (campaignId && typeof amount === 'number' && amount > 0) {
      try {
        await db.collection('campaigns').doc(campaignId).update({
          amountRaised: FieldValue.increment(amount),
          updatedAt:    FieldValue.serverTimestamp(),
        })
      } catch (e) {
        // Non-fatal — donation is already saved
        console.warn('[verify] Could not update campaign amountRaised:', e)
      }
    }

    return NextResponse.json({ success: true, donationId: ref.id })
  } catch (err: any) {
    console.error('[POST /api/razorpay/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

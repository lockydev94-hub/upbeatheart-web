import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // ── 1. Verify signature ──────────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // ── 2. Cross-check the payment against Razorpay ──────────────────────────
    // Never trust the client-supplied amount — verify the actual captured
    // payment against the order that was created server-side.
    let verifiedAmount = 0
    try {
      const [order, payment] = await Promise.all([
        razorpay.orders.fetch(razorpay_order_id),
        razorpay.payments.fetch(razorpay_payment_id),
      ])
      if (payment.status !== 'captured') {
        return NextResponse.json({ error: 'Payment was not captured' }, { status: 400 })
      }
      if (payment.order_id !== razorpay_order_id) {
        return NextResponse.json({ error: 'Payment does not belong to this order' }, { status: 400 })
      }
      if (payment.amount !== order.amount) {
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
      }
      verifiedAmount = Number(payment.amount) / 100
      const claimedAmount = typeof amount === 'number' && amount > 0 ? amount : 0
      if (claimedAmount !== verifiedAmount) {
        return NextResponse.json({ error: 'Amount verification failed' }, { status: 400 })
      }
    } catch (err: any) {
      console.error('[verify] Razorpay lookup failed:', err?.message ?? err)
      return NextResponse.json({ error: 'Could not verify payment with Razorpay' }, { status: 502 })
    }

    const db = getAdminDb()

    // ── 3. Idempotency — one donation per payment ────────────────────────────
    // Replayed/re-submitted payloads must never double-record a donation
    // or double-increment the campaign's amountRaised.
    const existing = await db.collection('donations')
      .where('razorpayPaymentId', '==', razorpay_payment_id)
      .limit(1)
      .get()
    if (!existing.empty) {
      return NextResponse.json({ success: true, donationId: existing.docs[0].id, duplicate: true })
    }

    // ── 4. Write donation to Firestore ───────────────────────────────────────
    const ref = await db.collection('donations').add({
      // campaign (empty strings for general/non-campaign donation)
      campaignId:        campaignId   ?? '',
      campaignName:      campaignName ?? '',   // field name matches admin schema

      // donor
      donorName:         anonymous ? 'Anonymous' : (donorName ?? 'Anonymous'),
      donorPhone:        anonymous ? '' : (donorPhone ?? ''),
      donorEmail:        anonymous ? '' : (donorEmail ?? ''),
      amount:            verifiedAmount,
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

    // ── 5. Update campaign amountRaised if linked ────────────────────────────
    if (campaignId && verifiedAmount > 0) {
      try {
        await db.collection('campaigns').doc(campaignId).update({
          amountRaised: FieldValue.increment(verifiedAmount),
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

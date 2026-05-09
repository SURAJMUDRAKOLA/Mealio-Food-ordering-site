/**
 * send-order-confirmation — Supabase Edge Function (Deno runtime)
 *
 * PURPOSE: Sends a transactional HTML email to the customer after
 * a successful order using the Resend API.
 *
 * REQUIRES env var:
 *  RESEND_API_KEY=re_your_resend_api_key
 *  (set in Supabase Dashboard → Edge Functions → Secrets)
 *
 * DEPLOY:
 *  supabase functions deploy send-order-confirmation
 *
 * USAGE: Call after validate-order succeeds.
 *  POST /functions/v1/send-order-confirmation
 *  { orderId, userEmail, userName, items, subtotal, deliveryFee, taxes, grandTotal }
 */

import { handleCors, json } from '../_shared/cors.ts';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface RequestBody {
  orderId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
}

/** Formats a number as INR currency (server-side, without Intl polyfill issues) */
const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Generates a clean HTML email body */
function buildEmailHtml(body: RequestBody): string {
  const { orderId, userName, items, subtotal, deliveryFee, taxes, grandTotal } = body;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#FFF8F0;font-size:14px;">${item.name}</td>
          <td style="padding:8px 0;color:#A38970;font-size:14px;text-align:center;">×${item.quantity}</td>
          <td style="padding:8px 0;color:#FF6B35;font-size:14px;text-align:right;font-weight:700;">${rupee(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F0A06;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="text-align:center;padding-bottom:32px;">
        <h1 style="color:#FF6B35;font-size:28px;margin:0;letter-spacing:-0.5px;">🔥 Mealio</h1>
        <p style="color:#A38970;font-size:13px;margin:4px 0 0;">Dark Gourmet Food Delivery</p>
      </td>
    </tr>

    <tr>
      <td style="background:rgba(255,248,240,0.05);border:1px solid rgba(255,248,240,0.1);border-radius:12px;padding:28px;">
        <h2 style="color:#FFF8F0;font-size:20px;margin:0 0 8px;">Order Confirmed! 🎉</h2>
        <p style="color:#A38970;font-size:14px;margin:0 0 24px;">
          Hey ${userName}, your order has been placed successfully.
        </p>

        <p style="color:#A38970;font-size:12px;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.1em;">
          Order ID
        </p>
        <p style="color:#FFF8F0;font-family:monospace;font-size:14px;margin:0 0 24px;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.2);border-radius:6px;padding:8px 12px;">
          #${orderId.slice(0, 8).toUpperCase()}
        </p>

        <p style="color:#A38970;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.1em;">
          Items Ordered
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,248,240,0.1);margin-bottom:16px;">
          ${itemRows}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,248,240,0.1);padding-top:16px;">
          <tr>
            <td style="color:#A38970;font-size:13px;padding:4px 0;">Subtotal</td>
            <td style="color:#A38970;font-size:13px;text-align:right;">${rupee(subtotal)}</td>
          </tr>
          <tr>
            <td style="color:#A38970;font-size:13px;padding:4px 0;">Delivery</td>
            <td style="color:#A38970;font-size:13px;text-align:right;">${deliveryFee === 0 ? 'Free' : rupee(deliveryFee)}</td>
          </tr>
          <tr>
            <td style="color:#A38970;font-size:13px;padding:4px 0;">Taxes (5%)</td>
            <td style="color:#A38970;font-size:13px;text-align:right;">${rupee(taxes)}</td>
          </tr>
          <tr style="border-top:1px solid rgba(255,248,240,0.1);">
            <td style="color:#FFF8F0;font-size:16px;font-weight:700;padding:12px 0 0;">Total Paid</td>
            <td style="color:#FF6B35;font-size:16px;font-weight:700;text-align:right;padding:12px 0 0;">${rupee(grandTotal)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="text-align:center;padding-top:24px;">
        <p style="color:#A38970;font-size:12px;margin:0;">
          Track your order live in the Mealio app. Expected delivery in 25–35 minutes.
        </p>
        <p style="color:#3A2A1A;font-size:11px;margin:16px 0 0;">
          © 2025 Mealio. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: RequestBody = await req.json();
    const { userEmail, userName } = body;

    if (!userEmail || !userName) {
      return json({ error: 'Missing required fields' }, 400);
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      // Don't fail the order if email is misconfigured — log and continue
      console.warn('RESEND_API_KEY not set — skipping email');
      return json({ sent: false, reason: 'RESEND_API_KEY not configured' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mealio <noreply@yourdomain.com>', // update with your verified domain
        to: [userEmail],
        subject: `Your Mealio order #${body.orderId.slice(0, 8).toUpperCase()} is confirmed!`,
        html: buildEmailHtml(body),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await response.json();
    return json({ sent: true, emailId: result.id });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Email send failed';
    console.error('send-order-confirmation error:', message);
    // Don't fail the whole order just because email failed
    return json({ sent: false, error: message }, 500);
  }
});

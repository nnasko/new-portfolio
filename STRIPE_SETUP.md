# Stripe Payment Integration Setup Guide

## Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

## Getting Your Stripe Keys

1. **Sign up for Stripe** at https://stripe.com
2. **Go to your Stripe Dashboard**
3. **Navigate to Developers > API Keys**
4. **Copy your publishable key** (starts with `pk_test_`)
5. **Copy your secret key** (starts with `sk_test_`)

## Testing the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the test payment page:**
   ```
   http://localhost:3000/test-payment
   ```

3. **Use these test card numbers:**
   - **Success:** 4242 4242 4242 4242
   - **Decline:** 4000 0000 0000 0002
   - **Requires authentication:** 4000 0025 0000 3155

4. **Test payment flow:**
   - Enter any future expiry date
   - Enter any 3-digit CVC
   - Use any billing address

## Integration Points

### 1. Pricing Page → Hire Form
- Pricing page links to `/hire?package=basic|standard|premium`
- Hire form pre-fills budget based on package selection
- Visual indicator shows selected package

### 2. Invoice Payments
- Payment form can handle invoice payments
- Invoice status updates automatically after successful payment
- Payment reference stored in database

### 3. Upfront Project Payments
- 50% upfront payment for projects
- Payment success redirects to success page
- Payment details stored for project tracking

## Production Deployment

1. **Switch to live Stripe keys** (remove `_test` suffix)
2. **Update webhook endpoints** in Stripe dashboard
3. **Test with real payment methods**
4. **Monitor payment success/failure rates**

## Security Notes

- ✅ Secret key only used server-side
- ✅ Publishable key safe for client-side
- ✅ Payment verification on server
- ✅ HTTPS required for production
- ✅ PCI compliance handled by Stripe

## Next Steps

1. **Test the payment flow** with test cards
2. **Integrate with invoice system** 
3. **Add payment buttons** to invoice pages
4. **Set up webhook handling** for payment confirmations
5. **Add payment tracking** to admin dashboard 
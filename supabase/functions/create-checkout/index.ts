import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation schema
const CheckoutItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nameAr: z.string().trim().min(1).max(200),
  price: z.number().positive().max(999999),
  quantity: z.number().int().positive().max(100),
  image: z.string().url().optional().or(z.literal('')),
});

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1).max(50),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(8).max(20),
  customerAddress: z.string().trim().max(500).optional().default(''),
  couponCode: z.string().max(50).optional().nullable(),
  couponDiscount: z.number().int().min(0).max(100).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not found');
      throw new Error('Stripe configuration error');
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = CheckoutSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: validationResult.error.errors }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { items, customerName, customerPhone, customerAddress, couponCode, couponDiscount, successUrl, cancelUrl } = validationResult.data;

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Creating checkout session for:', { itemCount: items.length, customerName });

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'sar',
        product_data: {
          name: item.name,
          description: item.nameAr,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to halalas
      },
      quantity: item.quantity,
    }));

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        customerName,
        customerPhone,
        customerAddress,
        couponCode: couponCode || '',
        couponDiscount: couponDiscount?.toString() || '0',
      },
      billing_address_collection: 'auto',
    };

    // Apply discount if coupon exists
    if (couponDiscount && couponDiscount > 0) {
      // Create a coupon in Stripe for this discount
      const stripeCoupon = await stripe.coupons.create({
        percent_off: couponDiscount,
        duration: 'once',
        name: couponCode || 'Discount',
      });

      sessionParams.discounts = [{
        coupon: stripeCoupon.id,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating checkout session:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

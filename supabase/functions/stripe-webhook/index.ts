import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error('Stripe configuration error');
    }

    // SECURITY: Webhook secret is REQUIRED in production
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured - rejecting request");
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    logStep("Stripe configuration verified");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    logStep("Request details", { 
      hasSignature: !!signature, 
      bodyLength: body.length 
    });

    // SECURITY: Signature is REQUIRED
    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let event: Stripe.Event;

    // Verify webhook signature - ALWAYS required
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Signature verified successfully");
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      logStep("ERROR: Signature verification failed", { error: errMessage });
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Processing checkout session", { 
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total
      });
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Generate order number
      const { data: orderNumberData, error: rpcError } = await supabase.rpc('generate_order_number');
      if (rpcError) {
        logStep("WARNING: Failed to generate order number via RPC", { error: rpcError.message });
      }
      const orderNumber = orderNumberData || `TBO-${Date.now()}`;
      logStep("Order number generated", { orderNumber });

      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product'],
      });
      logStep("Line items retrieved", { count: lineItems.data.length });

      // Prepare order items
      const items = lineItems.data.map((item: Stripe.LineItem) => ({
        name: item.description,
        price: (item.amount_total || 0) / 100,
        quantity: item.quantity,
      }));

      // Create order in database
      const orderData = {
        order_number: orderNumber,
        customer_name: session.metadata?.customerName || session.customer_details?.name || 'Unknown',
        customer_phone: session.metadata?.customerPhone || session.customer_details?.phone || '',
        customer_address: session.metadata?.customerAddress || '',
        items: items,
        payment_method: 'stripe',
        total_amount: (session.amount_total || 0) / 100,
        status: 'paid',
        notes: session.metadata?.couponCode 
          ? `Coupon: ${session.metadata.couponCode} (-${session.metadata.couponDiscount}%) | Stripe Session: ${session.id}`
          : `Stripe Session: ${session.id}`,
      };
      
      logStep("Inserting order", orderData);
      
      const { error: orderError } = await supabase.from('orders').insert(orderData);

      if (orderError) {
        logStep("ERROR: Failed to create order", { error: orderError.message, code: orderError.code });
      } else {
        logStep("SUCCESS: Order created", { orderNumber });
        
        // Send notification to admin
        try {
          const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              orderNumber: orderData.order_number,
              customerName: orderData.customer_name,
              customerPhone: orderData.customer_phone,
              totalAmount: orderData.total_amount,
              paymentMethod: 'stripe',
              items: items,
            }),
          });
          
          if (notifyResponse.ok) {
            logStep("Admin notification sent successfully");
          } else {
            logStep("WARNING: Failed to send admin notification");
          }
        } catch (notifyError) {
          logStep("WARNING: Error sending admin notification", { error: String(notifyError) });
        }
      }
    } else {
      logStep("Event type not handled, ignoring", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("ERROR: Webhook processing failed", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
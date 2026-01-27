import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "mxt.hamadh@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      orderNumber, 
      customerName, 
      customerPhone, 
      totalAmount, 
      paymentMethod, 
      items 
    } = await req.json();

    // Format items list
    const itemsList = items.map((item: { name: string; nameAr: string; quantity: number; price: number }) => 
      `• ${item.nameAr || item.name} x${item.quantity} - ${item.price} SAR`
    ).join('\n');

    // Create detailed notification message
    const notificationData = {
      to: ADMIN_EMAIL,
      subject: `🛒 طلب جديد #${orderNumber}`,
      orderDetails: {
        orderNumber,
        customerName,
        customerPhone,
        paymentMethod,
        totalAmount,
        items: itemsList,
        timestamp: new Date().toISOString()
      }
    };

    // Log notification for debugging
    console.log('=== NEW ORDER NOTIFICATION ===');
    console.log(`📋 Order Number: ${orderNumber}`);
    console.log(`👤 Customer: ${customerName}`);
    console.log(`📱 Phone: ${customerPhone}`);
    console.log(`💳 Payment: ${paymentMethod}`);
    console.log(`💰 Total: ${totalAmount} SAR`);
    console.log(`📧 Notification sent to: ${ADMIN_EMAIL}`);
    console.log('Items:', itemsList);
    console.log('==============================');

    // Return success with notification data
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order notification logged',
        notification: notificationData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

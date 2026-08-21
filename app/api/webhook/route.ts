import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email;

      if (!email) {
        console.error("No customer email found.");
        return NextResponse.json({ received: true });
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData, error: userError } =
        await supabase.auth.admin.listUsers();

      if (userError) {
        console.error("Supabase user lookup error:", userError);

        return NextResponse.json(
          { error: "Could not find Supabase user." },
          { status: 500 }
        );
      }

      const user = userData.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        console.error(
          "No Supabase user found for:",
          email
        );

        return NextResponse.json({
          received: true,
        });
      }

      const { error: planError } = await supabase
        .from("user_plans")
        .upsert(
          {
            user_id: user.id,
            plan: "pro",
          },
          {
            onConflict: "user_id",
          }
        );

      if (planError) {
        console.error(
          "Failed to update user plan:",
          planError
        );

        return NextResponse.json(
          { error: "Could not update user plan." },
          { status: 500 }
        );
      }

      console.log(
        `User ${user.email} upgraded to Pro`
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
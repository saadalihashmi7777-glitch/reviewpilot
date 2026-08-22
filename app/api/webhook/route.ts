import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  // IMPORTANT: Read the raw body for Stripe signature verification
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
    console.error(
      "Webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      // Get metadata from Checkout Session
      const userId = session.metadata?.user_id;
      const selectedPlan = session.metadata?.plan;

      console.log("Stripe checkout completed:", {
        userId,
        selectedPlan,
        sessionId: session.id,
      });

      // Validate metadata
      if (!userId) {
        console.error("Missing user_id in Stripe metadata.");

        return NextResponse.json(
          { error: "Missing user ID." },
          { status: 400 }
        );
      }

      if (
        selectedPlan !== "pro" &&
        selectedPlan !== "business"
      ) {
        console.error(
          "Invalid or missing plan:",
          selectedPlan
        );

        return NextResponse.json(
          { error: "Invalid plan." },
          { status: 400 }
        );
      }

      // Supabase Admin client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Update user's plan directly using user_id
      const { error: planError } = await supabase
        .from("user_plans")
        .upsert(
          {
            user_id: userId,
            plan: selectedPlan,
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
          {
            error: "Could not update user plan.",
          },
          { status: 500 }
        );
      }

      console.log(
        `User ${userId} upgraded to ${selectedPlan}`
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
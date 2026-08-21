import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { review, tone, customerName, rating } = await request.json();

    if (!review?.trim()) {
      return NextResponse.json(
        { error: "Customer review is required." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your login session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    // Check free plan usage
    const { count, error: countError } = await supabase
      .from("review_replies")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Usage check error:", countError);

      return NextResponse.json(
        { error: "Could not check your usage. Please try again." },
        { status: 500 }
      );
    }

    const repliesGenerated = count ?? 0;
    const freeLimit = 10;

    if (repliesGenerated >= freeLimit) {
      return NextResponse.json(
        {
          error:
            "You've used all 10 free replies. Upgrade your plan to generate more.",
        },
        { status: 403 }
      );
    }

    // Generate AI reply
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `Write a professional response to this customer review.

Customer name: ${customerName || "Customer"}
Rating: ${rating || "5"} stars
Tone: ${tone || "Professional"}

Customer review:
${review}

Write only the response.
Do not add quotation marks.
Keep it natural, polite, and concise.`,
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 500 }
      );
    }

    // Save reply
    const { error: saveError } = await supabase
      .from("review_replies")
      .insert({
        user_id: user.id,
        customer_name: customerName || null,
        rating: Number(rating) || 5,
        tone: tone || "Professional",
        review,
        reply,
      });

    if (saveError) {
      console.error("Supabase save error:", saveError);

      return NextResponse.json(
        {
          error: `Reply generated, but could not be saved: ${saveError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
      repliesGenerated: repliesGenerated + 1,
      repliesRemaining: Math.max(
        freeLimit - (repliesGenerated + 1),
        0
      ),
    });
  } catch (error: any) {
    console.error("GENERATION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while generating the reply.",
      },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { z } from "zod";
import { sendFrameNotification } from "../../../lib/notifs";
import { getNextMilestone } from "~/lib/milestones";

const requestSchema = z.object({
  fid: z.string(),
  milestone: z.number(),
  days: z.number(),
  isWelcome: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { fid, milestone, days, isWelcome } = requestBody.data;

  if (isWelcome) {
    const sendResult = await sendFrameNotification(
      parseInt(fid),
      "Welcome to Your Sun Cycle Journey\n\nYou've embarked on a mindful journey of cosmic reflection. Each rotation around the sun is an opportunity for growth and discovery. The stars have been waiting. 🌟"
    );

    if (sendResult.state === "error") {
      return Response.json(
        { success: false, error: sendResult.error },
        { status: 500 }
      );
    } else if (sendResult.state === "rate_limit") {
      return Response.json(
        { success: false, error: "Rate limited" },
        { status: 429 }
      );
    }

    return Response.json({ success: true });
  }

  const currentMilestone = getNextMilestone(days, new Date(0));
  if (!currentMilestone) {
    return Response.json(
      { success: false, error: "No milestone found" },
      { status: 400 }
    );
  }

  const sendResult = await sendFrameNotification(
    parseInt(fid),
    `Milestone Reached: ${currentMilestone.cycles} Cycles\n\n${currentMilestone.description}\n\n${currentMilestone.label}`
  );

  if (sendResult.state === "error") {
    return Response.json(
      { success: false, error: sendResult.error },
      { status: 500 }
    );
  } else if (sendResult.state === "rate_limit") {
    return Response.json(
      { success: false, error: "Rate limited" },
      { status: 429 }
    );
  }

  return Response.json({ success: true });
} 
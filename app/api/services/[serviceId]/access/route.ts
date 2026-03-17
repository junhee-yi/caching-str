import { NextResponse } from "next/server";
import {
  accessByUser,
  isServiceType,
  isUserId,
  usersById,
} from "@/lib/demoData";

type RouteContext = {
  params: Promise<{ serviceId: string }>;
};

export const GET = async (request: Request, context: RouteContext) => {
  const { serviceId } = await context.params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!isServiceType(serviceId)) {
    return NextResponse.json(
      { message: `Unknown service: ${serviceId}` },
      { status: 404 },
    );
  }

  if (!userId || !isUserId(userId)) {
    return NextResponse.json(
      { message: "Missing or invalid userId" },
      { status: 400 },
    );
  }

  const access = accessByUser[userId]?.[serviceId];

  if (!access) {
    return NextResponse.json(
      { message: `Unknown service mapping: ${serviceId}` },
      { status: 404 },
    );
  }

  if (!access.allowed) {
    return NextResponse.json(
      {
        message: `403 Forbidden: ${usersById[userId].name} has no access to ${serviceId}`,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ...access,
    checkedAt: new Date().toISOString(),
  });
};

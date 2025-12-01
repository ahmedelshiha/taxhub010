import { NextRequest, NextResponse } from "next/server";
import { withTenantContext } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { addMinutes, format, parse, startOfDay, endOfDay } from "date-fns";

interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  available: boolean;
  reason?: string; // Why unavailable
}

interface AvailabilityResponse {
  date: string;
  service: string;
  slots: TimeSlot[];
  timezone: string;
}

// Business hours configuration (9 AM - 6 PM)
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 18;
const SLOT_DURATION_MINUTES = 30;

/**
 * GET /api/bookings/availability?date=YYYY-MM-DD&serviceId=xxx
 * Check staff availability and return time slots
 */
const _api_GET = async (request: NextRequest) => {
  try {
    const ctx = requireTenantContext();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!ctx.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const requestedDate = parse(dateParam, "yyyy-MM-dd", new Date());
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if date is in the past
    const today = startOfDay(new Date());
    if (requestedDate < today) {
      return NextResponse.json(
        { error: "Cannot check availability for past dates" },
        { status: 400 }
      );
    }

    // Get service details (for duration)
    let serviceName = "General Service";
    let serviceDuration = 60; // Default 60 minutes

    if (serviceId) {
      // Note: Would fetch from Service table if it exists
      // For MVP, using default duration
      serviceName = "Tax Consultation";
      serviceDuration = 60;
    }

    // Generate time slots for the day
    const dayStart = startOfDay(requestedDate);
    dayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);

    const dayEnd = startOfDay(requestedDate);
    dayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

    const timeSlots: TimeSlot[] = [];
    let currentTime = dayStart;

    while (currentTime < dayEnd) {
      const slotEnd = addMinutes(currentTime, SLOT_DURATION_MINUTES);

      if (slotEnd <= dayEnd) {
        timeSlots.push({
          start: format(currentTime, "HH:mm"),
          end: format(slotEnd, "HH:mm"),
          available: true, // Will check conflicts next
        });
      }

      currentTime = slotEnd;
    }

    // Check for existing bookings that conflict with time slots
    const existingBookings = await prisma.booking.findMany({
      where: {
        tenantId: ctx.tenantId as string,
        scheduledAt: {
          gte: startOfDay(requestedDate),
          lte: endOfDay(requestedDate),
        },
        status: {
          in: ["PENDING", "CONFIRMED"], // Don't block for cancelled/completed
        },
      },
      select: {
        scheduledAt: true,
        status: true,
      },
    });

    // Mark conflicting slots as unavailable
    existingBookings.forEach((booking) => {
      const bookingTime = format(booking.scheduledAt, "HH:mm");
      const bookingEndTime = format(
        addMinutes(booking.scheduledAt, serviceDuration),
        "HH:mm"
      );

      timeSlots.forEach((slot) => {
        // Check if slot overlaps with booking
        if (
          (slot.start >= bookingTime && slot.start < bookingEndTime) ||
          (slot.end > bookingTime && slot.end <= bookingEndTime) ||
          (slot.start <= bookingTime && slot.end >= bookingEndTime)
        ) {
          slot.available = false;
          slot.reason = "Already booked";
        }
      });
    });

    // Check for slots that don't have enough time for service duration
    // (e.g., if service takes 90 minutes, need 3 consecutive 30-min slots)
    const slotsNeeded = Math.ceil(serviceDuration / SLOT_DURATION_MINUTES);

    if (slotsNeeded > 1) {
      for (let i = 0; i < timeSlots.length; i++) {
        if (timeSlots[i].available) {
          // Check if next N slots are also available
          let hasEnoughConsecutive = true;
          for (let j = 1; j < slotsNeeded; j++) {
            if (i + j >= timeSlots.length || !timeSlots[i + j].available) {
              hasEnoughConsecutive = false;
              break;
            }
          }

          if (!hasEnoughConsecutive) {
            timeSlots[i].available = false;
            timeSlots[i].reason = `Not enough time for ${serviceDuration}-minute service`;
          }
        }
      }
    }

    const response: AvailabilityResponse = {
      date: dateParam,
      service: serviceName,
      slots: timeSlots,
      timezone: "UTC", // TODO: Support user timezone
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        totalSlots: timeSlots.length,
        availableSlots: timeSlots.filter((s) => s.available).length,
        bookedSlots: existingBookings.length,
      },
    });
  } catch (error: unknown) {
    logger.error("Error checking availability", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = withTenantContext(_api_GET, { requireAuth: true });

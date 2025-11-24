import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { addHours, subMinutes } from "date-fns";

/**
 * Service to handle booking reminders
 */
export class ReminderService {
    /**
     * Find bookings starting in the next 24 hours that haven't had a reminder sent
     */
    static async processReminders() {
        try {
            const now = new Date();
            const next24Hours = addHours(now, 24);

            // Find bookings:
            // 1. Scheduled between now and 24h from now
            // 2. Status is CONFIRMED or PENDING
            // 3. Reminder NOT already sent
            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    scheduledAt: {
                        gte: now,
                        lte: next24Hours,
                    },
                    status: {
                        in: ["CONFIRMED", "PENDING"],
                    },
                    reminderSent: false,
                },
                include: {
                    client: true,
                    service: true,
                },
            });

            logger.info(`Found ${upcomingBookings.length} upcoming bookings to check for reminders`);

            let sentCount = 0;
            let errorCount = 0;

            for (const booking of upcomingBookings) {
                try {
                    // Send reminder
                    await this.sendReminderEmail(booking);

                    // Update booking status
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: {
                            reminderSent: true,
                        },
                    });

                    sentCount++;
                } catch (error) {
                    logger.error(`Failed to process reminder for booking ${booking.id}`, { error });
                    errorCount++;
                }
            }

            return {
                processed: upcomingBookings.length,
                sent: sentCount,
                errors: errorCount,
            };
        } catch (error) {
            logger.error("Error processing reminders", { error });
            throw error;
        }
    }

    /**
     * Mock email sending
     */
    private static async sendReminderEmail(booking: any) {
        // In a real app, this would use Resend, SendGrid, etc.
        // For MVP, we just log it

        const emailContent = `
      Subject: Reminder: Upcoming Booking - ${booking.service?.name}
      
      Hi ${booking.clientName},
      
      This is a reminder that you have a ${booking.service?.name} scheduled for tomorrow at ${new Date(booking.scheduledAt).toLocaleTimeString()}.
      
      Please log in to the portal if you need to reschedule.
      
      Thanks,
      TaxHub Team
    `;

        logger.info(`[MOCK EMAIL] Sending reminder to ${booking.client?.email || "client"}`, {
            bookingId: booking.id,
            content: emailContent
        });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return true;
    }
}

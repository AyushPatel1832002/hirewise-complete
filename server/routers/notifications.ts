import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const notificationsRouter = router({
  centre: protectedProcedure.query(async ({ ctx }) => db.listNotifications(ctx.user.id)),
  unreadCount: protectedProcedure.query(async ({ ctx }) => ({ count: await db.getUnreadNotificationCount(ctx.user.id) })),
  markRead: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => db.markNotificationRead(input.id, ctx.user.id)),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => db.markAllNotificationsRead(ctx.user.id)),

  prefs: protectedProcedure
    .input(z.object({ channel: z.enum(["in_app", "email"]), eventType: z.string().max(60) }))
    .query(async ({ ctx, input }) => ({
      enabled: await db.getNotificationPrefs(ctx.user.id, input.channel, input.eventType),
    })),
  setPref: protectedProcedure
    .input(z.object({
      channel: z.enum(["in_app", "email"]),
      eventType: z.string().max(60),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => db.setNotificationPref(ctx.user.id, input.channel, input.eventType, input.enabled)),

  /** Public one-click unsubscribe — no login required. */
  unsubscribe: publicProcedure
    .input(z.object({ token: z.string().min(1).max(128) }))
    .mutation(async ({ input }) => db.unsubscribeByToken(input.token)),
});

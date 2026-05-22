import { getUnreadNotificationCount } from "@/server/notifications/notifications";
import { getCurrentSession } from "@/server/auth/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return Response.json({ unreadCount: 0 }, { status: 401 });
  }

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  return Response.json({ unreadCount });
}

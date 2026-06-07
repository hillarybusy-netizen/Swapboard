export function getPlatformAdminEmails(): string[] {
  const fromEnv = process.env.PLATFORM_ADMIN_EMAILS;
  if (fromEnv) {
    return fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return ["admin@swapboard.app", "brendan@swapboard.app"];
}

export async function isPlatformAdmin(email: string | undefined) {
  if (!email) return false;
  return getPlatformAdminEmails().includes(email.toLowerCase());
}

export const PLATFORM_ADMIN_EMAILS = [
  "admin@swapboard.app",
  "brendan@swapboard.app", // Assuming the user's email
];

export async function isPlatformAdmin(email: string | undefined) {
  if (!email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email);
}

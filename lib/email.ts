export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  // In a real app, this would use Resend, SendGrid, etc.
  // Example Resend implementation:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'SwapBoard <noreply@swapboard.ca>',
    to,
    subject,
    text,
    html: html || text,
  });
  */

  if (process.env.NODE_ENV === "development") {
    console.log(`\n================= EMAIL DISPATCH =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log(`==================================================\n`);
  }
}

export async function sendShiftAssignmentEmail(workerEmail: string, workerName: string, shiftTitle: string, date: string) {
  await sendEmail(
    workerEmail,
    "New Shift Assigned",
    `Hello ${workerName},\n\nYou have been assigned a new shift: ${shiftTitle} on ${date}.\n\nPlease check your SwapBoard dashboard for details.`
  );
}

export async function sendSwapApprovedEmail(workerEmail: string, workerName: string, shiftTitle: string) {
  await sendEmail(
    workerEmail,
    "Swap Approved",
    `Hello ${workerName},\n\nYour manager has approved the swap for your shift: ${shiftTitle}.\n\nThe shift has been removed from your schedule.`
  );
}

export async function sendSwapRejectedEmail(workerEmail: string, workerName: string, shiftTitle: string) {
  await sendEmail(
    workerEmail,
    "Swap Rejected",
    `Hello ${workerName},\n\nYour manager has rejected the swap request for your shift: ${shiftTitle}.\n\nPlease log in to SwapBoard to review any notes from your manager.`
  );
}

export async function sendShiftDoneReminderEmail(workerEmail: string, workerName: string, shiftTitle: string) {
  await sendEmail(
    workerEmail,
    "Shift Overdue: Mark as Done",
    `Hello ${workerName},\n\nYour shift "${shiftTitle}" has ended, but you haven't marked it as done yet.\n\nPlease log in to SwapBoard and mark it as done so your manager can approve it.`
  );
}

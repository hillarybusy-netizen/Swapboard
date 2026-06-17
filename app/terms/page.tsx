import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "SwapBoard terms of service for shift swapping platform subscriptions and usage at swapboard.ca.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-8 glass rounded-3xl p-8 md:p-12 border-white/5">
        <Link href="/" className="text-gold text-sm hover:underline font-medium inline-block mb-4">← Back to SwapBoard</Link>
        
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">SwapBoard Terms of Service</h1>
          <p className="text-white/60 text-sm">swapboard.ca<br/>Effective Date: June 15, 2026</p>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using SwapBoard ("the Platform"), operated by SwapBoard ("we," "us," "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform. These Terms apply to all users, including managers ("Subscribers") and workers ("Members").</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>SwapBoard is a shift management platform that enables workers to post, claim, and swap shifts within their workplace. Managers subscribe to SwapBoard and invite their team members to participate. The Platform facilitates communication and coordination around shift coverage but does not itself employ, schedule, or manage workers. All employment relationships remain between the worker and their employer.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
            <h3 className="font-semibold text-white/90 mt-4 mb-2">3.1 Registration</h3>
            <p>To use SwapBoard, you must create an account or accept an invitation from a manager. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are assigned a unique Member ID upon registration.</p>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">3.2 Account Security</h3>
            <p>You are responsible for maintaining the confidentiality of your password and account credentials. You agree to notify us immediately at hello@swapboard.ca if you suspect unauthorized access to your account. We are not liable for any loss or damage arising from unauthorized use of your account.</p>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">3.3 Account Types</h3>
            <p className="mb-2"><strong>Manager accounts (Subscribers):</strong> Managers subscribe to a paid plan and are responsible for inviting and managing team members within their location. Managers can view shift activity, approve or reject swaps, and manage departments.</p>
            <p><strong>Worker accounts (Members):</strong> Workers join SwapBoard through a manager invitation. Worker accounts are free. Workers can post shifts for swap, browse available shifts, and claim shifts posted by coworkers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Subscriptions and Payment</h2>
            <h3 className="font-semibold text-white/90 mt-4 mb-2">4.1 Pricing</h3>
            <p className="mb-2">SwapBoard offers the following subscription plans for managers:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold mb-2">
              <li>Starter: $79/month (or $59/month billed annually at $708/year)</li>
              <li>Growth: $199/month (or $149/month billed annually at $1,788/year)</li>
              <li>Enterprise: $499/month (or $374/month billed annually at $4,488/year)</li>
            </ul>
            <p>All prices are in Canadian Dollars (CAD) unless otherwise stated. Prices are subject to change with 30 days' notice.</p>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">4.2 Billing</h3>
            <p>Payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis according to your chosen billing cycle (monthly or annual). Annual plans are billed in a single payment at the start of each billing year.</p>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">4.3 Free Trial</h3>
            <p>We may offer a 14-day free trial for new subscribers. At the end of the trial, your chosen plan will be activated and your payment method will be charged unless you cancel before the trial ends.</p>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">4.4 Cancellation and Refunds</h3>
            <p>You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. We do not provide prorated refunds for unused portions of a billing period. For annual plans, cancellation takes effect at the end of the annual billing cycle. If you believe you are entitled to a refund due to a service issue, please contact hello@swapboard.ca.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold mb-2">
              <li>Use SwapBoard for any purpose other than workplace shift management</li>
              <li>Share your account credentials with any other person</li>
              <li>Attempt to access another user's account without authorization</li>
              <li>Post false or misleading shift information</li>
              <li>Use SwapBoard to harass, discriminate against, or harm any user</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any part of the Platform</li>
              <li>Use automated tools, bots, or scripts to access the Platform without our written permission</li>
              <li>Interfere with or disrupt the operation of the Platform</li>
            </ul>
            <p>Violation of these terms may result in suspension or termination of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Shift Swaps and Liability</h2>
            <p>SwapBoard facilitates shift swaps between workers but does not guarantee shift coverage. We are not responsible for any consequences arising from missed shifts, uncovered shifts, or disputes between workers or between workers and employers. Managers retain final authority over all shift approvals. All employment obligations, including attendance, remain between the worker and their employer.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>All content, features, functionality, design, code, trademarks, logos, and branding associated with SwapBoard are the exclusive property of SwapBoard and are protected by Canadian and international intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Platform or its content without our written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, SwapBoard and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill, arising from or related to your use of the Platform. Our total liability for any claim arising from or related to these Terms or the Platform shall not exceed the amount you paid us in the twelve (12) months preceding the claim. The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless SwapBoard and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another party.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Termination</h2>
            <p>We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or if your continued use poses a risk to the Platform or other users. Upon termination, your right to use the Platform ceases immediately. Sections 6, 7, 8, 9, and 12 survive termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Governing Law and Dispute Resolution</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any dispute arising from or relating to these Terms or your use of the Platform shall be resolved through binding arbitration in Barrie, Ontario, in accordance with the Arbitration Act, 1991 (Ontario), unless otherwise agreed in writing. Nothing in this section prevents either party from seeking injunctive relief in a court of competent jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. General Provisions</h2>
            <p><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and SwapBoard regarding your use of the Platform.</p>
            <p className="mt-2"><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>
            <p className="mt-2"><strong>Waiver:</strong> Our failure to enforce any provision of these Terms shall not constitute a waiver of that provision.</p>
            <p className="mt-2"><strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations without restriction.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Changes to These Terms</h2>
            <p>We reserve the right to modify these Terms at any time. When we make material changes, we will notify you by email or through a prominent notice on the Platform at least 30 days before the changes take effect. Your continued use of SwapBoard after the effective date of the revised Terms constitutes your acceptance of the changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="mt-2 font-medium">
              <p>SwapBoard</p>
              <p>Email: <a href="mailto:hello@swapboard.ca" className="text-gold hover:underline">hello@swapboard.ca</a></p>
              <p>Website: <a href="https://swapboard.ca" className="text-gold hover:underline">swapboard.ca</a></p>
              <p>Barrie, Ontario, Canada</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

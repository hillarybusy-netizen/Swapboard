import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "SwapBoard privacy policy. How we collect, store, and protect your shift scheduling data at swapboard.ca.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-8 glass rounded-3xl p-8 md:p-12 border-white/5">
        <Link href="/" className="text-gold text-sm hover:underline font-medium inline-block mb-4">← Back to SwapBoard</Link>
        
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">SwapBoard Privacy Policy</h1>
          <p className="text-white/60 text-sm">swapboard.ca<br/>Effective Date: June 15, 2026</p>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>SwapBoard ("we," "us," "our") is a shift management platform operated in Canada. We are committed to protecting the privacy and personal information of our users in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation.</p>
            <p className="mt-2">This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform, website (swapboard.ca), and related services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-white/90 mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (if provided)</li>
              <li>Workplace name and location</li>
              <li>Job title or role (e.g., PSW, RPN, Cook)</li>
              <li>Department assignment</li>
              <li>Member ID (auto-generated)</li>
              <li>Password (stored in encrypted form)</li>
              <li>Shift schedule and availability preferences</li>
            </ul>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used within SwapBoard</li>
              <li>Date and time of access</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="font-semibold text-white/90 mt-4 mb-2">2.3 Information from Employers/Managers</h3>
            <p>When a manager invites you to join SwapBoard, they may provide your name, email address, department, and role. This information is used solely to facilitate your onboarding and participation in shift management at your workplace.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your personal information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold">
              <li>To create and manage your SwapBoard account</li>
              <li>To facilitate shift swaps, postings, and claims between team members</li>
              <li>To send notifications about shift activity (new postings, claims, approvals, rejections)</li>
              <li>To provide managers with visibility into team shift coverage</li>
              <li>To process subscription payments through our payment processor (Stripe)</li>
              <li>To communicate service updates, security alerts, and support messages</li>
              <li>To improve our platform, troubleshoot issues, and analyze usage patterns</li>
              <li>To comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Consent</h2>
            <p>By creating a SwapBoard account or accepting an invitation to join a workplace on SwapBoard, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy. You may withdraw your consent at any time by contacting us at hello@swapboard.ca or by deleting your account. Please note that withdrawing consent may affect your ability to use SwapBoard.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Disclosure of Information</h2>
            <p className="mb-2">We do not sell, rent, or trade your personal information. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold">
              <li>Your workplace manager(s) on SwapBoard, limited to information necessary for shift management (name, role, shift schedule, swap activity)</li>
              <li>Your coworkers within the same SwapBoard location, limited to shift-related information (name, available shifts, swap requests)</li>
              <li>Service providers who assist us in operating SwapBoard, including Supabase (database hosting), Vercel (web hosting), Stripe (payment processing), and Resend (email delivery). These providers are contractually obligated to protect your data</li>
              <li>Law enforcement or regulatory authorities if required by law, court order, or to protect the rights, safety, or property of SwapBoard, our users, or the public</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard measures, including encrypted database connections, secure HTTPS transmission, role-based access controls, and regular security audits. Our database is hosted by Supabase with servers located in secure data centres. While we take reasonable precautions to protect your information, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal, accounting, or compliance purposes. Shift swap history may be retained in anonymized form for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Your Rights Under PIPEDA</h2>
            <p className="mb-2">Under Canadian privacy law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gold mb-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Withdraw your consent to the collection, use, or disclosure of your information</li>
              <li>Request deletion of your personal information (subject to legal requirements)</li>
              <li>File a complaint with the Office of the Privacy Commissioner of Canada if you believe your privacy rights have been violated</li>
            </ul>
            <p>To exercise any of these rights, contact us at hello@swapboard.ca. We will respond to your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Cookies and Tracking Technologies</h2>
            <p>SwapBoard uses cookies and similar technologies to maintain your login session, remember your preferences, and analyze platform usage. You can manage cookie preferences through your browser settings. Disabling cookies may affect the functionality of SwapBoard.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Electronic Communications (CASL)</h2>
            <p>We comply with Canada's Anti-Spam Legislation (CASL). By creating an account, you consent to receive transactional emails related to your shift activity (swap notifications, account confirmations, security alerts). You may also opt in to receive product updates and announcements. You can unsubscribe from non-essential communications at any time using the unsubscribe link in our emails.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Children's Privacy</h2>
            <p>SwapBoard is not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 16, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or through a notice on our platform. Your continued use of SwapBoard after changes are posted constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Contact Us</h2>
            <p>If you have questions, concerns, or complaints about this Privacy Policy or our privacy practices, please contact us:</p>
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

import type { Metadata } from "next";
import Link from "next/link";

import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of Pickleball Central's website, mobile app, court bookings, memberships, coaching, tournaments, and events.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — Pickleball Central",
    description:
      "The terms governing your use of Pickleball Central's website, mobile app, and facility services.",
    url: "/terms",
    type: "website",
  },
};

const EMAIL = "hi@pickleball-central.co.in";

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="1 July 2026"
      intro={
        <>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
            website, mobile application, and services (together, the &ldquo;Services&rdquo;)
            provided by{" "}
            <strong className="text-white">
              Pickleball Central, a unit of Snowflake Enterprises
            </strong>{" "}
            (&ldquo;Pickleball Central&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;), a sports facility located in Peerzadiguda, Hyderabad, Telangana,
            India (GSTIN 36AFNFS2231R1ZC).
          </p>
          <p>
            By creating an account, booking a court, purchasing a membership, registering for an
            event, or otherwise using the Services, you agree to be bound by these Terms and by our{" "}
            <Link href="/privacy" className="text-[#C8F400] hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Services.
          </p>
        </>
      }
    >
      <LegalSection heading="1. Eligibility and accounts">
        <p>
          You must be at least 18 years old to create an account and use the Services on your own
          behalf. Minors may participate in our coaching programmes, summer camps, and youth events
          only when registered by a parent or legal guardian who accepts these Terms on the
          minor&rsquo;s behalf.
        </p>
        <p>
          You register and sign in using your mobile phone number and a one-time password (OTP). You
          are responsible for keeping access to your phone number and account secure, and for all
          activity that occurs under your account. You agree to provide accurate, current, and
          complete information and to keep it up to date. Notify us promptly of any unauthorised use
          of your account.
        </p>
      </LegalSection>

      <LegalSection heading="2. The Services">
        <p>
          Pickleball Central offers court bookings, memberships, coaching sessions, tournaments,
          events, and food-and-beverage services, available through our facility, website, and
          mobile app. We may add, change, suspend, or discontinue any part of the Services at any
          time. Court availability, schedules, and pricing are subject to change and confirmation at
          the time of booking.
        </p>
      </LegalSection>

      <LegalSection heading="3. Bookings, pricing, and payments">
        <LegalList>
          <li>
            Court bookings are made in 30-minute increments, with a minimum duration of 1 hour and a
            maximum of 4 hours, at the rates displayed at the time of booking.
          </li>
          <li>
            When you start a booking, the selected slot is held for a short period (by default, 2
            minutes) to allow you to complete payment. If payment is not completed within the hold
            window, the slot is released.
          </li>
          <li>
            All prices are in Indian Rupees (INR) and are inclusive of applicable taxes unless
            stated otherwise. Goods and Services Tax (GST) is charged as required by law, and a
            GST-compliant invoice is issued for each transaction.
          </li>
          <li>
            Payments are processed securely by our payment partner, Razorpay. By making a payment,
            you also agree to Razorpay&rsquo;s applicable terms. We do not store your full card,
            UPI, or bank credentials.
          </li>
          <li>
            A booking or registration is confirmed only once payment is successfully received and
            you receive a confirmation from us.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Cancellations, refunds, and no-shows">
        <LegalList>
          <li>
            Cancellations are governed by the cancellation policy applicable to your booking, which
            is displayed to you before you confirm and pay. Refund eligibility and amounts depend on
            how far in advance you cancel.
          </li>
          <li>
            Eligible refunds are processed back to your original payment method through Razorpay and
            may take several business days to reflect, depending on your bank or payment provider.
          </li>
          <li>
            If you do not arrive within 15 minutes of your slot start time, the booking may be
            treated as a no-show and may be forfeited, with any applicable penalty applied.
          </li>
          <li>
            We may cancel a booking or event due to weather, maintenance, safety concerns, or
            circumstances beyond our reasonable control; in such cases we will offer a reschedule or
            a refund of the amount paid for the affected booking.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Memberships and subscriptions">
        <p>
          Memberships and subscription plans renew and are billed according to the plan details
          shown at purchase, and recurring payments may be collected automatically through Razorpay.
          You can manage or cancel a recurring plan as described in the app or by contacting us;
          cancellation stops future renewals but does not entitle you to a refund for the current
          billing period unless required by law or stated in the plan terms.
        </p>
      </LegalSection>

      <LegalSection heading="6. Facility rules and code of conduct">
        <p>
          When using our facility, you agree to follow all posted rules, signage, and instructions
          from our staff, including those relating to safety, appropriate footwear and attire,
          equipment use, and court etiquette. We may refuse entry to, remove, or suspend the account
          of any person who behaves unsafely, abusively, or disruptively, or who damages our
          property, without refund.
        </p>
      </LegalSection>

      <LegalSection heading="7. Assumption of risk and health">
        <p>
          Pickleball and related physical activities carry an inherent risk of injury. By using our
          facility and participating in any activity, you acknowledge and voluntarily accept these
          risks. You confirm that you are physically fit to participate and, where appropriate, have
          consulted a medical professional. To the maximum extent permitted by law, you participate
          at your own risk, and Pickleball Central is not liable for injury, illness, or loss
          arising from your participation except where caused by our gross negligence or wilful
          misconduct.
        </p>
      </LegalSection>

      <LegalSection heading="8. User content">
        <p>
          If you submit reviews, ratings, photos, or other content through the Services, you grant
          us a non-exclusive, royalty-free, worldwide licence to use, display, and distribute that
          content in connection with operating and promoting the Services. You are responsible for
          your content and confirm that it does not infringe any third party&rsquo;s rights or
          violate any law. We may remove content that breaches these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Acceptable use">
        <p>You agree not to:</p>
        <LegalList>
          <li>use the Services for any unlawful, fraudulent, or harmful purpose;</li>
          <li>
            interfere with, disrupt, or attempt to gain unauthorised access to the Services, our
            systems, or other users&rsquo; accounts;
          </li>
          <li>
            make speculative, false, or duplicate bookings, or resell bookings without our
            authorisation;
          </li>
          <li>
            copy, scrape, reverse-engineer, or create derivative works from the Services except as
            permitted by law;
          </li>
          <li>upload viruses or malicious code, or otherwise misuse or overload the Services.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="10. Intellectual property">
        <p>
          The Services and all related content, branding, logos, text, graphics, and software are
          owned by or licensed to Pickleball Central and Snowflake Enterprises and are protected by
          intellectual property laws. We grant you a limited, non-exclusive, non-transferable,
          revocable licence to use the Services for their intended personal, non-commercial purpose.
          All rights not expressly granted are reserved.
        </p>
      </LegalSection>

      <LegalSection heading="11. Third-party services">
        <p>
          The Services rely on and may link to third-party services (such as Razorpay for payments
          and messaging and analytics providers). We are not responsible for the content, policies,
          or practices of third parties, and your use of those services may be subject to their own
          terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Disclaimers">
        <p>
          The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
          To the maximum extent permitted by law, we disclaim all warranties, express or implied,
          including fitness for a particular purpose and non-infringement, and we do not warrant
          that the Services will be uninterrupted, error-free, or secure.
        </p>
      </LegalSection>

      <LegalSection heading="13. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Pickleball Central and Snowflake Enterprises will
          not be liable for any indirect, incidental, special, consequential, or punitive damages,
          or for any loss of profits, data, or goodwill, arising out of or relating to your use of
          the Services. Our total aggregate liability for any claim relating to the Services will
          not exceed the amount you paid to us for the specific booking or service giving rise to
          the claim. Nothing in these Terms excludes liability that cannot be excluded under
          applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="14. Indemnity">
        <p>
          You agree to indemnify and hold harmless Pickleball Central, Snowflake Enterprises, and
          our staff from any claims, damages, liabilities, and expenses arising out of your breach
          of these Terms, your misuse of the Services, or your violation of any law or third-party
          right.
        </p>
      </LegalSection>

      <LegalSection heading="15. Suspension and termination">
        <p>
          We may suspend or terminate your access to the Services at any time if you breach these
          Terms, misuse the Services, or where required by law. You may stop using the Services and
          delete your account at any time, as described in our{" "}
          <Link href="/privacy" className="text-[#C8F400] hover:underline">
            Privacy Policy
          </Link>
          . Provisions that by their nature should survive termination (including payment
          obligations, disclaimers, limitation of liability, and indemnity) will continue to apply.
        </p>
      </LegalSection>

      <LegalSection heading="16. Governing law and jurisdiction">
        <p>
          These Terms are governed by the laws of India. Subject to any applicable mandatory
          consumer-protection law, the courts at Hyderabad, Telangana, India will have exclusive
          jurisdiction over any dispute arising out of or relating to these Terms or the Services.
        </p>
      </LegalSection>

      <LegalSection heading="17. Changes to these Terms">
        <p>
          We may update these Terms from time to time. When we do, we will revise the &ldquo;Last
          updated&rdquo; date above and, where the changes are significant, provide a more prominent
          notice. Your continued use of the Services after an update means you accept the revised
          Terms.
        </p>
      </LegalSection>

      <LegalSection heading="18. Contact us">
        <p>If you have any questions about these Terms, contact us:</p>
        <LegalList>
          <li>Pickleball Central (a unit of Snowflake Enterprises)</li>
          <li>
            Email:{" "}
            <a href="#preview-only" className="text-[#C8F400] hover:underline">
              {EMAIL}
            </a>
          </li>
          <li>Phone: +91 97007 44634</li>
          <li>Address: Peerzadiguda, Hyderabad, Telangana, India</li>
        </LegalList>
      </LegalSection>
    </LegalLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pickleball Central (a unit of Snowflake Enterprises) collects, uses, shares, and protects your personal data across our website and mobile app, in line with India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Pickleball Central",
    description:
      "How we collect, use, and protect your personal data across our website and mobile app.",
    url: "/privacy",
    type: "website",
  },
};

const EMAIL = "hi@pickleball-central.co.in";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="1 July 2026"
      intro={
        <>
          <p>
            This Privacy Policy explains how{" "}
            <strong className="text-white">
              Pickleball Central, a unit of Snowflake Enterprises
            </strong>{" "}
            (&ldquo;Pickleball Central&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) collects, uses, discloses, and safeguards your information when you
            use our website at{" "}
            <a href="/pc-november-open-implementation-preview/" className="text-[#C8F400] hover:underline">
              pickleball-central.co.in
            </a>
            , our mobile application, and the related booking, membership, coaching, and event
            services (together, the &ldquo;Services&rdquo;).
          </p>
          <p>
            We are committed to handling your personal data responsibly and in accordance with
            India&rsquo;s Digital Personal Data Protection Act, 2023 (the &ldquo;DPDP Act&rdquo;)
            and other applicable laws. By using the Services, you agree to the collection and use of
            information as described in this Policy. If you do not agree, please do not use the
            Services.
          </p>
        </>
      }
    >
      <LegalSection heading="1. Who we are (Data Fiduciary)">
        <p>
          Pickleball Central is operated by Snowflake Enterprises, a sports facility based in
          Peerzadiguda, Hyderabad, Telangana, India (GSTIN 36AFNFS2231R1ZC). For the purposes of the
          DPDP Act, we act as the Data Fiduciary responsible for your personal data. You can reach
          us using the contact details in Section 13.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p>We collect the following categories of information:</p>
        <LegalList>
          <li>
            <strong className="text-white">Account &amp; identity data</strong> — your name, mobile
            phone number (used as your primary login via one-time password), email address, and,
            where you choose to provide it, your profile photo and skill level.
          </li>
          <li>
            <strong className="text-white">Booking &amp; activity data</strong> — court bookings,
            memberships, coaching sessions, tournament and event registrations, attendance, match
            and play history, and your in-app preferences.
          </li>
          <li>
            <strong className="text-white">Payment data</strong> — payments are processed by our
            payment partner, Razorpay. We do not store your full card, UPI, or bank credentials on
            our servers. We retain transaction references, amounts, payment status, and GST invoice
            details needed to fulfil your order and meet our legal and tax obligations.
          </li>
          <li>
            <strong className="text-white">Device &amp; technical data</strong> — device type and
            identifiers, operating system, app version, IP address, push notification tokens, and
            diagnostic or log data generated when you use the Services.
          </li>
          <li>
            <strong className="text-white">Usage &amp; analytics data</strong> — pages and screens
            viewed, features used, referring URLs, and similar interaction data collected through
            cookies and analytics tools (see Section 7).
          </li>
          <li>
            <strong className="text-white">Communications</strong> — records of messages you
            exchange with us, including support queries, WhatsApp messages, email, and in-app
            notifications.
          </li>
        </LegalList>
        <p>
          We do not knowingly collect precise GPS location. We do not collect sensitive personal
          data unless you voluntarily provide it (for example, a medical note relevant to a coaching
          or camp enrolment).
        </p>
      </LegalSection>

      <LegalSection heading="3. How we use your information">
        <p>We use your personal data to:</p>
        <LegalList>
          <li>create and manage your account and authenticate you via OTP;</li>
          <li>
            process court bookings, memberships, coaching, tournaments, events, and
            food-and-beverage orders;
          </li>
          <li>
            process payments, issue GST-compliant invoices, and handle refunds and cancellations;
          </li>
          <li>
            send you transactional messages — booking confirmations, reminders, payment receipts,
            waitlist updates, and account notices — by SMS, email, WhatsApp, and push notification;
          </li>
          <li>provide customer support and respond to your requests, feedback, and complaints;</li>
          <li>
            operate, maintain, secure, and improve the Services, including preventing fraud, abuse,
            and misuse;
          </li>
          <li>
            send you promotional or marketing communications where you have consented, and from
            which you can opt out at any time;
          </li>
          <li>comply with applicable legal, tax, accounting, and regulatory obligations.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Legal basis for processing">
        <p>
          Under the DPDP Act, we process your personal data on the basis of the consent you provide
          when you create an account and use the Services, and for the &ldquo;legitimate uses&rdquo;
          permitted by law — for example, where you have voluntarily provided data for a specified
          purpose, or where processing is necessary to fulfil a service you requested or to comply
          with a legal obligation. You may withdraw your consent at any time as described in Section
          9; withdrawal does not affect processing carried out before the withdrawal.
        </p>
      </LegalSection>

      <LegalSection heading="5. How we share your information">
        <p>
          We do not sell your personal data. We share it only as needed to run the Services, with
          the following categories of recipients (each acting as our Data Processor under contract):
        </p>
        <LegalList>
          <li>
            <strong className="text-white">Razorpay</strong> — payment processing, subscriptions,
            and refunds.
          </li>
          <li>
            <strong className="text-white">MSG91</strong> — sending and verifying SMS one-time
            passwords for login.
          </li>
          <li>
            <strong className="text-white">Resend</strong> — sending transactional and, where
            applicable, marketing email.
          </li>
          <li>
            <strong className="text-white">Interakt</strong> — sending WhatsApp notifications and
            support messages.
          </li>
          <li>
            <strong className="text-white">Firebase Cloud Messaging (Google)</strong> — delivering
            push notifications to your device.
          </li>
          <li>
            <strong className="text-white">
              Google Analytics / Google Tag Manager, Microsoft Clarity, and Meta
            </strong>{" "}
            — website and app analytics and measurement (see Section 7).
          </li>
          <li>
            <strong className="text-white">Cloudflare and our hosting provider</strong> — content
            delivery, security, and infrastructure.
          </li>
        </LegalList>
        <p>
          We may also disclose information where required by law, court order, or a government
          authority, or to protect the rights, safety, and property of Pickleball Central, our
          users, or the public. If our business is involved in a merger, acquisition, or asset sale,
          your information may be transferred subject to this Policy.
        </p>
      </LegalSection>

      <LegalSection heading="6. International transfers">
        <p>
          Some of our service providers process data on servers located outside India. Where this
          happens, we take reasonable steps to ensure your data is protected by appropriate
          safeguards and is transferred only to jurisdictions and recipients permitted under
          applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies and analytics">
        <p>
          Our website uses cookies and similar technologies to keep you signed in, remember your
          preferences, and understand how the Services are used. We use Google Analytics and Google
          Tag Manager, Microsoft Clarity, and the Meta Pixel to measure traffic and improve our
          content and campaigns. You can control cookies through your browser settings; disabling
          them may affect some features.
        </p>
      </LegalSection>

      <LegalSection heading="8. Data retention">
        <p>
          We retain your personal data only for as long as your account is active or as needed to
          provide the Services, and thereafter for the period required to comply with our legal,
          tax, and accounting obligations (for example, GST invoice records must be retained for the
          period prescribed by law), to resolve disputes, and to enforce our agreements. When data
          is no longer required, we delete or anonymise it.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights and choices">
        <p>Subject to applicable law, you have the right to:</p>
        <LegalList>
          <li>access and obtain a summary of the personal data we hold about you;</li>
          <li>request correction or updating of inaccurate or incomplete data;</li>
          <li>request erasure of your personal data where it is no longer required;</li>
          <li>withdraw consent you previously gave;</li>
          <li>opt out of marketing communications at any time;</li>
          <li>
            nominate another individual to exercise your rights in the event of your death or
            incapacity, as provided under the DPDP Act.
          </li>
        </LegalList>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="#preview-only" className="text-[#C8F400] hover:underline">
            {EMAIL}
          </a>
          . We will respond within a reasonable period as required by law. You also have the right
          to lodge a complaint with the Data Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection heading="10. Deleting your account and data">
        <p>
          You can request deletion of your account and associated personal data at any time from
          within the mobile app: go to{" "}
          <strong>Profile &rarr; Privacy &amp; data &rarr; Delete account</strong> and confirm.
          Doing so <strong>immediately deactivates your account</strong>
          &mdash; you are signed out and can no longer log in &mdash; and submits your deletion
          request to us. If you prefer, you may instead request deletion by emailing{" "}
          <a href="#preview-only" className="text-[#C8F400] hover:underline">
            {EMAIL}
          </a>{" "}
          from your registered email address, or by contacting us on +91 97007 44634 from your
          registered phone number, with the subject &ldquo;Delete my account&rdquo;.
        </p>
        <p>
          Once we action your request, we delete or anonymise your personal data (including your
          name, email, phone number, profile photos, and community posts) within 30 days, except for
          records we are legally required to retain &mdash; such as payment and GST invoice records,
          which we keep for the statutory period and then delete. If you change your mind before
          your data is erased, contact us and we can reactivate your account.
        </p>
      </LegalSection>

      <LegalSection heading="11. Children's privacy">
        <p>
          The Services are intended for users aged 18 and over. We do not knowingly create accounts
          for children. Where a child participates in our coaching programmes, summer camps, or
          youth events, their registration must be completed by a parent or legal guardian, who
          provides and consents to the processing of the child&rsquo;s information for that purpose.
          If you believe a child has provided us personal data without appropriate consent, please
          contact us and we will take steps to delete it.
        </p>
      </LegalSection>

      <LegalSection heading="12. Data security">
        <p>
          We implement reasonable technical and organisational security measures to protect your
          personal data against unauthorised access, alteration, disclosure, or destruction —
          including encryption in transit, access controls, and audit logging. No method of
          transmission or storage is completely secure, so we cannot guarantee absolute security. In
          the event of a personal data breach, we will notify the Data Protection Board of India and
          affected users as required by law.
        </p>
      </LegalSection>

      <LegalSection heading="13. Grievance Officer and contact">
        <p>
          If you have questions, concerns, or complaints about this Policy or how we handle your
          data, please contact our Grievance Officer:
        </p>
        <LegalList>
          <li>
            <strong className="text-white">Anup Raj</strong>, Grievance Officer — Pickleball Central
            (a unit of Snowflake Enterprises)
          </li>
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

      <LegalSection heading="14. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or
          legal requirements. When we do, we will revise the &ldquo;Last updated&rdquo; date above
          and, where the changes are significant, provide a more prominent notice. Your continued
          use of the Services after an update means you accept the revised Policy.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-[#C8F400] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

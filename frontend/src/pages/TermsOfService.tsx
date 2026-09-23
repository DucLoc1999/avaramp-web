import { RampHeader } from "../components/layout/RampHeader";
import { RampFooter } from "../components/layout/RampFooter";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <RampHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Last updated: September 1, 2026
          <span className="mx-2">|</span>
          Applies to: https://avaramp.org/
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using https://avaramp.org/ (the &quot;Service&quot;)
              operated by Orbit Labs (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you disagree with any part of these terms, you
              may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Description of Service
            </h2>
            <p>
              Orbit Labs provides an on/off ramp service for converting between
              fiat currency and cryptocurrency through our platform. The Service
              charges a fee per transaction. We reserve the right to modify,
              suspend, or discontinue the Service at any time with or without
              notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              User Accounts
            </h2>
            <p>
              When you create an account with us, you must provide accurate,
              complete, and current information. You are responsible for:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p>We reserve the right to terminate accounts that violate these Terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Age Requirements
            </h2>
            <p>
              You must be at least 18 years to use this Service. By using the
              Service, you represent that you meet this age requirement. If we become
              aware that a user does not meet this requirement, we will terminate
              their account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are
              and will remain the exclusive property of Orbit Labs and its
              licensors. Our trademarks and trade dress may not be used in connection
              with any product or service without the prior written consent of Lumen
              Liquid.
            </p>
            <p>
              User-generated content remains the property of the user, but you grant
              Orbit Labs a non-exclusive, royalty-free license to use, display, and
              distribute such content in connection with the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Prohibited Uses
            </h2>
            <p>You agree not to use the Service:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>In any way that violates applicable laws or regulations</li>
              <li>To transmit unsolicited commercial communications (spam)</li>
              <li>To impersonate any person or entity</li>
              <li>
                To engage in any conduct that restricts or inhibits others&apos; use
                of the Service
              </li>
              <li>To attempt to gain unauthorized access to any part of the Service</li>
              <li>
                To use automated scripts to collect information from or interact with
                the Service
              </li>
              <li>To upload or transmit viruses or other malicious code</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Payment Terms
            </h2>
            <p>Our Service charges a fee per ramp transaction:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Transaction fees are displayed before you confirm each transaction</li>
              <li>
                All fees are non-refundable once the transaction is completed
              </li>
              <li>We reserve the right to adjust our fee structure with notice</li>
              <li>Failure to pay applicable fees may result in transaction failure</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS
              AVAILABLE&quot; basis without any warranties of any kind, whether
              express or implied. Orbit Labs expressly disclaims all warranties,
              including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              We do not warrant that: (a) the Service will function uninterrupted or
              error-free; (b) defects will be corrected; (c) the Service is free of
              viruses or other harmful components.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Orbit Labs shall
              not be liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of profits, data,
              goodwill, or other intangible losses, resulting from your use of or
              inability to use the Service.
            </p>
            <p>
              In no event shall Orbit Labs&apos;s total liability to you exceed the
              greater of one hundred dollars ($100) or the amounts paid by you to
              Orbit Labs in the past twelve months.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Governing Law
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws
              of your jurisdiction, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising under these Terms will be resolved through binding
              arbitration in your jurisdiction, except that either party may seek
              injunctive relief in any court of competent jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify
              users of material changes by posting the updated Terms on this page with
              a new effective date. Your continued use of the Service after changes
              are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Contact Us
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              contact@avaramp.org or
              visit <a href="https://avaramp.org/" className="text-blue-600 hover:underline dark:text-blue-400">https://avaramp.org/</a>.
            </p>
          </section>

        </div>
      </main>

      <RampFooter />
    </div>
  );
}

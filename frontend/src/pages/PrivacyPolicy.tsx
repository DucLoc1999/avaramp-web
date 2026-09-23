import { RampHeader } from "../components/layout/RampHeader";
import { RampFooter } from "../components/layout/RampFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <RampHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Last updated: September 1, 2026
          <span className="mx-2">|</span>
          Applies to: https://avaramp.org/
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Introduction
            </h2>
            <p>
              This Privacy Policy describes how Orbit Labs (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
              information about you when you use our website at
              https://avaramp.org/ (the &quot;Service&quot;).
            </p>
            <p>
              By using our Service, you agree to the collection and use of
              information in accordance with this policy. This policy applies to all
              visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Information We Collect
            </h2>
            <p>We collect several types of information in connection with the Service:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Information you provide directly:</strong> government ID and
                KYC data, bank account details, wallet address, transaction history
              </li>
              <li>
                <strong>Information collected automatically:</strong> When you use
                our Service, we automatically collect certain information, including
                IP address, browser type, operating system, referring URLs, and
                device information.
              </li>
              <li>
                <strong>Information from third-party services:</strong> We may
                receive information about you from third-party services you connect
                to our Service.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Provide, operate, and maintain our Service</li>
              <li>Improve and personalize your experience</li>
              <li>Understand how you use our Service</li>
              <li>
                Communicate with you, including for customer service and marketing
                purposes
              </li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and security alerts</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              How We Share Your Information
            </h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Service providers:</strong> We share information with
                third-party vendors who provide services on our behalf, including
                Google Analytics.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information if
                required by law or in response to valid legal processes.
              </li>
              <li>
                <strong>Business transfers:</strong> We may share information in
                connection with a merger, acquisition, or sale of assets.
              </li>
            </ul>
            <p>
              We do not sell or share your personal information with third parties
              for their marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity on
              our Service and to hold certain information. You can instruct your
              browser to refuse all cookies or to indicate when a cookie is being
              sent.
            </p>
            <p>
              We use cookies for the following purposes: analytics and performance,
              functional preferences, and marketing (where applicable). Third-party
              services we use — such as Google Analytics — may also set their own
              cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Data Retention
            </h2>
            <p>
              We will retain your personal information for as long as necessary. Best
              practice is to document specific retention periods for each data
              category and delete data when those periods expire.
            </p>
            <p>
              When we no longer need to retain your information, we will securely
              delete or anonymize it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not directed to children under the age of 13. We do not
              knowingly collect personal information from children under 13. If we
              become aware that we have collected personal information from a child
              under 13, we will take steps to delete that information promptly.
            </p>
            <p>
              If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us at
              contact@avaramp.org.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures
              to protect your personal information against accidental or unlawful
              destruction, loss, alteration, unauthorized disclosure, or access.
            </p>
            <p>
              However, no method of transmission over the internet or method of
              electronic storage is 100% secure. While we strive to use commercially
              acceptable means to protect your personal information, we cannot
              guarantee its absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites. We have no
              control over and assume no responsibility for the content, privacy
              policies, or practices of any third-party sites or services. We
              encourage you to review the privacy policy of every site you visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you
              of any changes by posting the new Privacy Policy on this page and
              updating the &quot;Last updated&quot; date at the top.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they are
              posted on this page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100 sm:text-xl">
              Contact Us
            </h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>By email: contact@avaramp.org</li>
              <li>
                By visiting our website:{" "}
                <a href="https://avaramp.org/" className="text-blue-600 hover:underline dark:text-blue-400">https://avaramp.org/</a>
              </li>
            </ul>
          </section>

        </div>
      </main>

      <RampFooter />
    </div>
  );
}

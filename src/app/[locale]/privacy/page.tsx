import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("privacy")}</h1>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 font-semibold text-text">1. Overview</h2>
          <p>
            This Privacy Policy explains what information BuyUP collects, how it is used, and how it is
            protected when you use the BuyUP marketplace.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">2. Information We Collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Account information: your name, email address, and a securely hashed password.</li>
            <li>
              Order information: the game, service and options you select, your contact email, gaming
              username, and any additional notes you provide for the seller.
            </li>
            <li>
              Payment-related information: the amount, currency and status of a payment, and a reference
              identifier from the payment service provider. BuyUP does not store your full card number on its
              own servers.
            </li>
            <li>
              Technical information: standard request data such as your IP address and browser information,
              collected automatically to operate and secure the platform.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">3. Cookies</h2>
          <p>
            BuyUP uses a small number of strictly necessary cookies: one to keep you signed in and one to
            remember your preferred language. These cookies are required for the platform to function and are
            not used for advertising or for tracking you across other websites.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">4. How We Use Your Information</h2>
          <p>
            We use your information to create and manage your account, process orders and payments,
            communicate with you about your orders, and protect the platform against fraud and abuse (for
            example, by limiting repeated requests).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">5. Data Sharing</h2>
          <p>
            We do not sell your personal data. Limited order information (such as your gaming username and any
            notes you leave) is shared with the seller fulfilling your order, and limited payment information
            is shared with the payment service provider needed to process your payment.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">6. Data Retention</h2>
          <p>
            We retain account, order and payment records only for as long as needed to deliver and support your
            orders, and as needed to keep accurate business records.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">7. Your Choices</h2>
          <p>
            You can review and update your account information from your profile. To request access to, or
            deletion of, your data, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">8. Security</h2>
          <p>Passwords are stored using industry-standard hashing and are never stored or shown in plain text.</p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Continuing to use BuyUP after an update means
            you accept the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">10. Contact</h2>
          <p>
            BuyUP is operated by [LEGAL ENTITY NAME], [CONTACT ADDRESS]. For privacy questions, contact{" "}
            <a href="mailto:support@bayup.dev" className="text-primary hover:underline">
              support@bayup.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

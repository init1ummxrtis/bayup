import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("terms")}</h1>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 font-semibold text-text">1. About BuyUP</h2>
          <p>
            BuyUP is an online marketplace for digital gaming services, such as rank boosting, account
            leveling, and related in-game progression services. BuyUP connects customers with independent
            sellers who deliver these services — BuyUP itself does not perform the services listed on the
            platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">2. Account Registration</h2>
          <p>
            To place an order you must create an account with a valid email address and password. You are
            responsible for keeping your login credentials confidential and for all activity that takes place
            under your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">3. Placing an Order</h2>
          <p>
            When you place an order, the price is calculated from the service and options you select at
            checkout. The service, selected options and price are recorded at the time of purchase and do not
            change afterward.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">4. Payment</h2>
          <p>
            Orders are paid for using the payment method available on the platform at checkout. BuyUP does not
            store your full payment card details on its own servers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">5. Digital Service Delivery</h2>
          <p>
            Services purchased on BuyUP are digital and are delivered by the seller according to the delivery
            time shown on the product. No physical goods are shipped.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">6. Order Status and Cancellation</h2>
          <p>
            An order moves through several statuses as it is processed, such as awaiting payment, paid, in
            progress, and completed. If a payment attempt is unsuccessful, the order is cancelled and you may
            attempt to pay again. BuyUP does not currently offer a general right to cancel an order, or a refund
            policy, once payment has succeeded and the seller has begun delivering the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">7. Reviews</h2>
          <p>
            Once a service is marked completed, you may be able to leave a review of the seller. Reviews should
            reflect your genuine experience with the order.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">8. Acceptable Use</h2>
          <p>
            You agree not to use BuyUP for any unlawful purpose, not to attempt to circumvent the platform&apos;s
            security or payment systems, and not to misrepresent your identity when placing an order.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">9. Disclaimer</h2>
          <p>
            BuyUP is provided on an &quot;as is&quot; basis. While we work with sellers to ensure services are
            delivered as described, BuyUP does not guarantee any particular outcome from a purchased service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continuing to use BuyUP after an update means you
            accept the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-text">11. Contact</h2>
          <p>
            BuyUP is operated by [LEGAL ENTITY NAME]. For questions about these Terms, contact{" "}
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

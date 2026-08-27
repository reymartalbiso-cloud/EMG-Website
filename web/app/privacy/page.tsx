import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Elite Manufacturing Group collects, uses and protects your personal information.",
};

export default function Privacy() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <h1 className="display">Privacy policy.</h1>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <p className="legal-note">
          Draft for review, to be confirmed by EMG management before launch.
          Last updated August 2026.
        </p>
        <div className="prose">
          <h2 className="display">What we collect</h2>
          <p>
            When you send an enquiry, request a quote, or use Build Your Own,
            we collect the details you give us: your name, contact details,
            property location, and the building configuration you created. If
            you become a customer, we also hold your order, delivery and
            payment records.
          </p>
          <h2 className="display">How we use it</h2>
          <p>
            To answer your enquiry, prepare your quote, deliver and install
            your building, and support you afterwards. We do not sell or rent
            your information to anyone. We share it only with the people needed
            to deliver your order (for example freight and installation
            contractors), and only what they need.
          </p>
          <h2 className="display">Where it lives</h2>
          <p>
            Enquiries go to our own mailbox and business systems. Customers who
            use the order portal have their order information held in our
            portal, protected by individual logins.
          </p>
          <h2 className="display">Your choices</h2>
          <p>
            You can ask us at any time what information we hold about you, ask
            us to correct it, or ask us to delete it where the law allows.
            Email admin@elitemanufacturing.com.au or call 0420 251 550.
          </p>
          <h2 className="display">Cookies</h2>
          <p>
            This site stores your theme preference and, if you build a quote,
            your configuration in your own browser so it survives the trip to
            the contact page. We do not run third-party advertising trackers.
          </p>
        </div>
      </section>
    </>
  );
}
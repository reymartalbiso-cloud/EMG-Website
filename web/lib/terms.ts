/* Elite Manufacturing Group's Terms & Conditions.
 *
 * VERBATIM from the document that was published at
 * elitemanufacturing.com.au/return-policy until the domain moved to this site
 * on 28 August. Nothing here is rewritten, reworded or summarised — it is
 * EMG's own published legal text, retrieved from the GoDaddy server after the
 * DNS cutover made it unreachable by domain.
 *
 * The cutover silently un-published it. Until Sunday a customer buying a
 * $149,900 building could read 3,487 words of terms; afterwards /terms was a
 * 243-word stub and /return-policy was a 404. Restoring it is not a new legal
 * claim, it is putting back what was already public.
 *
 * Ben asked (call, 31 Aug) for this to be merged with the quote-and-invoice
 * T&Cs he sent, with a no-refund policy, click-to-accept and IP logging. That
 * merge is NOT done here: it needs his answers on six contradictions between
 * the two documents, and he asked to review it first. See the redline.
 *
 * Do not edit the wording in this file. If a clause is wrong, it is wrong in
 * EMG's published terms and Ben needs to change it there.
 */

export type Sub = { n: string; body: string[] };
export type Section = { n: string; intro: string[]; subs: Sub[] };
export type Part = { part: string; sections: Section[] };

/** the version a customer agreed to, if acceptance is ever logged against it */
export const TERMS_VERSION = "2026-08-28";

export const TERMS: Part[] = [
  {
    part: "PART 1 — ABOUT THESE TERMS, DEFINITIONS, ORDERS, PRICING & PAYMENT",
    sections: [
      {
        n: "1. About Us and Application of These Terms",
        intro: [],
        subs: [
          {
            n: "1.1 Who We Are",
            body: [
            "These Terms & Conditions (\"Terms\") apply to all sales of transportable buildings, mobile homes, modular units, and related products (\"Products\") supplied by Elite Manufacturing Group Pty Ltd (\"Elite\", \"we\", \"us\", \"our\") to any customer (\"Buyer\", \"you\").",
            ],
          },
          {
            n: "1.2 Agreement to These Terms",
            body: [
            "By completing any of the following actions, you acknowledge and agree to be bound by these Terms:",
            "Placing an order",
            "Paying a deposit or full amount",
            "Signing any order form or sales contract",
            "Proceeding through our online checkout",
            "These Terms apply to all purchases made online, in person, via email, or by phone.",
            ],
          },
          {
            n: "1.3 Relationship to Signed Contracts",
            body: [
            "If you sign a Transportable Building Sales Contract with Elite Manufacturing Group Pty Ltd, that contract forms part of your agreement with us.",
            "If any inconsistency arises between these website Terms and a signed written contract, the signed written contract prevails.",
            ],
          },
          {
            n: "1.4 Business & Consumer Customers",
            body: [
            "These Terms apply whether you are purchasing as:",
            "an individual, or",
            "a business or organisation",
            "unless Elite Manufacturing Group Pty Ltd explicitly agrees in writing to different terms.",
            ],
          },
          {
            n: "1.5 Updates to These Terms",
            body: [
            "Elite Manufacturing Group Pty Ltd may update these Terms at any time.",
            "The Terms in effect at the time your order is accepted are the Terms that apply to your purchase.",
            ],
          },
        ],
      },
      {
        n: "2. Definitions",
        intro: ["For clarity and consistency, the following definitions apply throughout these Terms:", "Buyer / You — Any individual, business, or entity purchasing Products from Elite Manufacturing Group Pty Ltd.", "Contract — The legally binding agreement between Elite and the Buyer, including these Terms, order confirmations, invoices, quotes, and any written agreements.", "Effective Date — The date your order becomes legally binding (see Section 3).", "Products — Any transportable building, modular home, mobile structure, or related goods supplied by Elite.", "Site — The location nominated by the Buyer for delivery or installation of the Product.", "Third Party Finance Provider — An external finance provider, such as Handypay, used for customer finance arrangements.", "In-House Finance — Finance Elite Manufacturing Group Pty Ltd may offer only under specific business-to-business circumstances, with terms available upon request.", "PPSA — The Personal Property Securities Act 2009 (Cth).", "Elite — Elite Manufacturing Group Pty Ltd"],
        subs: [
        ],
      },
      {
        n: "3. Formation of Contract & Orders",
        intro: [],
        subs: [
          {
            n: "3.1 Quotes and Information",
            body: [
            "Any quotes, brochures, specifications, drawings, descriptions, or images provided by Elite Manufacturing Group Pty Ltd are not binding offers.",
            "Elite may update or withdraw information at any time before accepting an order.",
            ],
          },
          {
            n: "3.2 Placing an Order",
            body: [
            "Orders may be placed through:",
            "Website checkout",
            "Signing a written sales contract",
            "Accepting a provided quote",
            "Email or written confirmation",
            ],
          },
          {
            n: "3.3 Acceptance or Rejection of Orders",
            body: [
            "Elite Manufacturing Group Pty Ltd may accept or reject any order at its sole discretion, including where:",
            "Products are unavailable",
            "Pricing or descriptive errors occur",
            "Fraud or high risk is suspected",
            "The Site is unsafe, inaccessible, or unsuitable for delivery",
            "An order is only accepted when Elite:",
            "provides written confirmation, or",
            "receives the required payment (deposit or full amount)",
            ],
          },
          {
            n: "3.4 When the Contract Is Formed",
            body: [
            "A binding Contract is created when the earliest of the following occurs:",
            "Elite issues written acceptance of your order",
            "You sign a written contract with Elite",
            "You pay a deposit or full payment",
            "Once formed, the Contract is legally binding on the Buyer.",
            ],
          },
          {
            n: "3.5 Cancellation After Acceptance",
            body: [
            "Once Elite accepts your order or receives your payment, you cannot cancel simply because you change your mind.",
            "A strict No Refund Policy applies unless otherwise required by Australian law.",
            ],
          },
          {
            n: "3.6 Accuracy of Information Provided by the Buyer",
            body: [
            "You are fully responsible for ensuring that all information you provide is accurate, including:",
            "Site measurements",
            "Delivery access details",
            "Site conditions",
            "Regulatory or permit requirements",
            "Elite Manufacturing Group Pty Ltd is not liable for delays, costs, or issues caused by incorrect, incomplete, or misleading information provided by the Buyer.",
            ],
          },
        ],
      },
      {
        n: "4. Product Specifications, Variations & Availability",
        intro: [],
        subs: [
          {
            n: "4.1 Product Specifications",
            body: [
            "Products are manufactured according to the drawings, specifications, inclusions, and details agreed upon at the time of purchase.",
            ],
          },
          {
            n: "4.2 Variations and Substitutions",
            body: [
            "Elite Manufacturing Group Pty Ltd may substitute materials, fixtures, or components of equal or superior quality where necessary due to:",
            "Supplier shortages",
            "Discontinued components",
            "Manufacturing needs",
            "These changes do not entitle the Buyer to cancel, withhold payment, or claim compensation.",
            ],
          },
          {
            n: "4.3 Colour, Materials & Finishes",
            body: [
            "Due to manufacturing tolerances, natural variations, and differences in digital displays, colours and finishes may vary slightly.",
            "These variations do not constitute defects.",
            ],
          },
          {
            n: "4.4 Permits, Approvals & Compliance",
            body: [
            "The Buyer is solely responsible for obtaining:",
            "Building permits",
            "Council approvals",
            "Zoning permissions",
            "Foundation and footing requirements",
            "All Site preparation needed before delivery",
            "Elite does not obtain approvals unless explicitly agreed in writing.",
            ],
          },
        ],
      },
      {
        n: "5. Pricing, Taxes & Adjustments",
        intro: [],
        subs: [
          {
            n: "5.1 Currency & Taxes",
            body: [
            "All prices are stated in Australian Dollars (AUD) and include relevant taxes unless otherwise specified.",
            ],
          },
          {
            n: "5.2 What the Price Includes",
            body: [
            "Unless clearly stated otherwise, the price includes:",
            "Manufacture or allocation of the Product",
            "Standard delivery terms described later in these Terms",
            "The price does not automatically include:",
            "Site preparation or groundworks",
            "Cranes or special unloading equipment",
            "Remote or difficult access freight charges",
            "Council, engineering, or regulatory fees",
            "Electrical, plumbing, or service connections",
            ],
          },
          {
            n: "5.3 Price Changes Before Acceptance",
            body: [
            "Prices may change at any time before an order is accepted.",
            "Once a Contract is formed, the price is final unless:",
            "You request upgrades or modifications",
            "Additional costs arise from inaccurate or incomplete information provided by you",
            ],
          },
          {
            n: "5.4 Pricing Errors",
            body: [
            "If an obvious pricing error occurs, Elite Manufacturing Group Pty Ltd may:",
            "Correct the error and allow you to proceed at the correct price, or",
            "Cancel the order and refund any amounts paid (unless deemed non-refundable under these Terms)",
            ],
          },
        ],
      },
      {
        n: "6. Payment Terms (Non-Finance)",
        intro: [],
        subs: [
          {
            n: "6.1 Accepted Payment Methods",
            body: [
            "Elite accepts the following payment methods:",
            "EFT (Electronic Funds Transfer)",
            "Bank deposit",
            "Other approved payment methods",
            ],
          },
          {
            n: "6.2 Timing of Payments",
            body: [
            "Your invoice or contract will specify:",
            "Whether full payment is due upfront, or",
            "Whether a deposit is required, with the balance payable before manufacture or delivery",
            "Manufacturing or stock allocation does not commence until the required payment has cleared.",
            ],
          },
          {
            n: "6.3 Overdue Payments",
            body: [
            "If payment is not received by the due date, Elite may:",
            "Suspend manufacturing or delivery",
            "Charge reasonable administrative or recovery costs",
            "Treat the Contract as breached and exercise legal rights available",
            ],
          },
          {
            n: "6.4 No Set-Off",
            body: [
            "Payments must be made in full without deduction, withholding, or set-off unless Elite agrees in writing.",
            ],
          },
        ],
      },
      {
        n: "7. Finance - Third Party & Limited In-House Finance",
        intro: [],
        subs: [
          {
            n: "7.1 Third-Party Finance (Handypay)",
            body: [
            "Most customer finance is handled exclusively through Handypay or another nominated finance provider.",
            "Your finance arrangement is governed solely by the finance provider's terms, not by Elite's Terms.",
            ],
          },
          {
            n: "7.2 In-House Finance (Business-to-Business Only)",
            body: [
            "Elite Manufacturing Group Pty Ltd may, in special circumstances, offer in-house finance to approved business customers only.",
            "These terms:",
            "Are not published online",
            "Are provided upon request",
            "Are offered solely at Elite's discretion",
            ],
          },
          {
            n: "7.3 Consumer Personal Finance Through Elite Manufacturing Group",
            body: [
            "Elite may offer direct personal finance to individual consumers at their discretion if all other avenues of finance have been exhausted.",
            ],
          },
        ],
      },
    ],
  },
  {
    part: "PART 2 — DELIVERY, FREIGHT, SITE ACCESS & RISK",
    sections: [
      {
        n: "8. Delivery Timeframes & Conditions",
        intro: [],
        subs: [
          {
            n: "8.1 Estimated Delivery Timeframes",
            body: [
            "Delivery timeframes provided by Elite Manufacturing Group Pty Ltd are estimates only. Actual delivery may be impacted by:",
            "Weather conditions",
            "Transport or freight delays",
            "Subcontractor or driver availability",
            "Manufacturing or supply chain delays",
            "Operational disruptions outside Elite's control",
            "Such delays do not constitute a breach of contract and do not entitle the Buyer to:",
            "Cancel the order",
            "Claim compensation",
            "Withhold payment",
            "Demand discounts or penalties",
            "Elite Manufacturing Group Pty Ltd will make reasonable efforts to notify the Buyer of any significant delays.",
            ],
          },
          {
            n: "8.2 Delivery Confirmation",
            body: [
            "Once your Product is dispatched, Elite Manufacturing Group Pty Ltd will provide upon request:",
            "Freight provider details",
            "An estimated delivery window",
            "Elite is not responsible for additional charges applied by third parties or governing bodies, such as:",
            "Ferry charges",
            "Local council fees",
            "Access permit fees",
            "Remote area surcharges",
            ],
          },
        ],
      },
      {
        n: "9. Delivery Areas, Freight Options & Charges",
        intro: [],
        subs: [
          {
            n: "9.1 Free Freight Zones",
            body: [
            "Elite Manufacturing Group Pty Ltd offers free freight for deliveries within 100 km of:",
            "Darwin",
            "Adelaide",
            "Brisbane",
            "Sydney",
            "Melbourne",
            "Perth",
            "Hobart",
            "Free freight applies only when the Product is shipped from a warehouse or stock location in that same city.",
            "Free freight only applies when there is suitable access via land and sealed road.",
            "If the Product is stocked in a different state, free freight does not apply unless the Buyer agrees to wait for stock transfers (where available).",
            ],
          },
          {
            n: "9.2 Subsidised Freight (Including Islands)",
            body: [
            "For deliveries outside the 100 km free freight zones — including islands such as Russell Island — Elite provides subsidised freight options.",
            "Additional freight costs will be communicated:",
            "At the time of quotation, or",
            "Shortly after order placement once freight calculations are finalised",
            ],
          },
          {
            n: "9.3 Customer-Arranged Freight",
            body: [
            "The Buyer may organise their own freight provider. In this case:",
            "Elite requires 48 hours' notice before collection",
            "Elite may, at its discretion, offer limited freight compensation",
            "Elite is not liable for damage, delays, or issues once the Product has left Elite's control under Buyer-arranged freight",
            ],
          },
        ],
      },
      {
        n: "10. Unloading Requirements & Buyer Responsibilities",
        intro: [],
        subs: [
          {
            n: "10.1 Equipment Required",
            body: [
            "Unless otherwise agreed in writing:",
            "The Buyer must provide a suitable forklift or unloading equipment at the Site",
            "If appropriate equipment is unavailable at delivery, a failed delivery fee may apply",
            "Elite Manufacturing Group Pty Ltd is not responsible for:",
            "Delays caused by insufficient unloading equipment",
            "Costs for cranes, forklifts, or specialised machinery unless included in writing",
            "Damage caused by Buyer-provided unloading equipment or operators",
            ],
          },
          {
            n: "10.2 Failed Delivery Attempts",
            body: [
            "A delivery attempt may fail due to:",
            "Incorrect Site access information",
            "Unsafe or unsuitable conditions",
            "No unloading equipment available",
            "The Buyer refusing delivery",
            "In such cases, the Buyer is responsible for:",
            "Re-delivery charges",
            "Stand-by time costs",
            "Additional handling or transport fees",
            ],
          },
        ],
      },
      {
        n: "11. Site Access, Safety & Placement Restrictions",
        intro: [],
        subs: [
          {
            n: "11.1 Access Requirements",
            body: [
            "The Buyer must ensure the delivery Site is:",
            "Safe and unobstructed",
            "Accessible for heavy vehicles",
            "Free from hazards, soft or unstable ground, low-hanging branches, or tight access areas",
            "Elite Manufacturing Group Pty Ltd may refuse delivery if the Site is judged unsafe or inaccessible.",
            ],
          },
          {
            n: "11.2 Standard Placement Distance",
            body: [
            "Standard delivery includes placement of the Product within 20 metres of an appropriate, accessible location.",
            "Standard delivery does not include:",
            "Placement onto footings, stumps, or foundations",
            "Crane lifting",
            "Lifting over fences, structures, or obstacles",
            "Precision placement",
            "Elevated or multi-level placement",
            "Any additional placement requirements must be arranged in writing and may incur additional costs.",
            ],
          },
          {
            n: "11.3 Large Mobile Homes",
            body: [
            "For large mobile home deliveries:",
            "Semi-trailers or oversize vehicles may be used",
            "The Buyer is responsible for lifting the Product off the trailer unless Elite agrees otherwise in writing",
            "Additional equipment (cranes, telehandlers, etc.) may be required at the Buyer's cost",
            ],
          },
        ],
      },
      {
        n: "12. Inspecting Goods Upon Delivery",
        intro: [],
        subs: [
          {
            n: "12.1 Buyer Inspection Obligation",
            body: [
            "Upon delivery, the Buyer must inspect the Product for:",
            "Visible damage",
            "Missing components",
            "Incorrect items",
            "Any obvious defects",
            ],
          },
          {
            n: "12.2 Reporting Damage or Defects",
            body: [
            "If any issue is identified:",
            "The Buyer must notify Elite Manufacturing Group Pty Ltd within 3 days",
            "Written details and photos are required",
            "Failure to report within 3 days may result in:",
            "Claims being rejected",
            "The Product being deemed accepted as-is",
            ],
          },
          {
            n: "12.3 Items Damaged in Transit",
            body: [
            "If Elite confirms that the damage occurred prior to delivery:",
            "Replacement parts or repairs will be arranged",
            "Freight for replacement items follows standard terms",
            "Elite is not responsible for disposal of damaged parts unless agreed in writing",
            ],
          },
        ],
      },
      {
        n: "13. Risk & Title",
        intro: [],
        subs: [
          {
            n: "13.1 Transfer of Risk",
            body: [
            "Risk transfers to the Buyer upon delivery, regardless of:",
            "Whether unloading occurs immediately",
            "Whether the Buyer or their representative is present",
            "Whether Buyer-provided equipment is operational",
            "After risk has transferred, Elite is not liable for:",
            "Theft",
            "Weather damage",
            "Vandalism",
            "Site-related accidents",
            "Damage caused during Buyer-controlled unloading",
            ],
          },
          {
            n: "13.2 Transfer of Title",
            body: [
            "Title (ownership) transfers only when full payment has been received by Elite Manufacturing Group Pty Ltd.",
            "If the Buyer is in possession of the Product but payment is outstanding:",
            "Elite retains legal ownership",
            "Elite may exercise its rights to recover the Product under applicable law",
            ],
          },
        ],
      },
      {
        n: "14. Insurance Requirements",
        intro: ["Once risk has transferred, the Buyer is strongly encouraged to obtain insurance for:", "Theft", "Fire", "Storm and weather events", "Vandalism", "Accidental damage", "Damage during relocation or movement", "The Buyer is responsible for all insurance coverage after delivery."],
        subs: [
        ],
      },
    ],
  },
  {
    part: "PART 3 — WARRANTY, NO REFUNDS, LIABILITY, INTELLECTUAL PROPERTY & COMPLIANCE",
    sections: [
      {
        n: "15. Warranty",
        intro: [],
        subs: [
          {
            n: "15.1 Standard Warranty Period",
            body: [
            "Elite Manufacturing Group Pty Ltd provides a 12-month warranty from the date of purchase covering defects in:",
            "Materials",
            "Components",
            "Workmanship",
            "This warranty applies only to defects that arise under normal, intended use.",
            ],
          },
          {
            n: "15.2 What the Warranty Covers",
            body: [
            "If a valid manufacturing defect is confirmed within the warranty period, Elite Manufacturing Group Pty Ltd may choose to:",
            "Repair the defective component,",
            "Replace the defective component, or",
            "Supply replacement parts for installation.",
            "Replacement items will be delivered under our standard delivery terms.",
            ],
          },
          {
            n: "15.3 Warranty Exclusions",
            body: [
            "The warranty does not cover damage or defects resulting from:",
            "Misuse, negligence, or failure to maintain the Product",
            "Unauthorised alterations or modifications",
            "Incorrect installation, relocation, or movement after delivery",
            "Natural disasters or environmental conditions (e.g., flooding, storms, fires)",
            "Pest infestation (e.g., termites, rodents)",
            "Salt-spray or corrosion from locations near saltwater",
            "Normal wear and tear, cosmetic blemishes, or minor colour/finish variation",
            "Incorrect or unprepared Site conditions",
            ],
          },
          {
            n: "15.4 Warranty Limitations",
            body: [
            "The warranty does not include costs associated with:",
            "Disposal or removal of fixtures and fittings",
            "Disconnection or reconnection of utilities",
            "Moving furniture or clearing obstacles",
            "Additional access equipment (e.g., cranes, forklifts)",
            "Downtime, inconvenience, or loss of income are not covered.",
            ],
          },
          {
            n: "15.5 Invalid Warranty Claims",
            body: [
            "The warranty will be void if:",
            "The Product is structurally altered or modified",
            "The Product is improperly relocated or transported",
            "Damage results from misuse, lack of site preparation, or failure to follow Elite's instructions",
            ],
          },
        ],
      },
      {
        n: "16. No Refunds Policy",
        intro: [],
        subs: [
          {
            n: "16.1 Strict No Refund Policy",
            body: [
            "All purchases made from Elite Manufacturing Group Pty Ltd are non-refundable.",
            "This includes deposits and full payments.",
            "If the Buyer cancels for any reason, no refund is provided.",
            "This applies even when:",
            "The Buyer changes their mind",
            "The Buyer cannot take delivery",
            "Finance is declined",
            "Council approval is not obtained",
            "Delays occur in manufacturing, freight, or delivery",
            "Site access is inadequate",
            ],
          },
          {
            n: "16.2 Discretionary Solutions",
            body: [
            "In special situations, Elite Manufacturing Group Pty Ltd may, at its absolute discretion, consider alternatives such as:",
            "Changing the order",
            "Providing a credit",
            "Transferring the order to another party",
            "Elite is not obligated to offer these options.",
            ],
          },
        ],
      },
      {
        n: "17. Intellectual Property",
        intro: [],
        subs: [
          {
            n: "17.1 Ownership",
            body: [
            "All intellectual property relating to Elite's Products, including but not limited to:",
            "Plans",
            "Designs",
            "Drawings",
            "Engineering documents",
            "Technical data",
            "Branding and marketing assets",
            "remains the exclusive property of Elite Manufacturing Group Pty Ltd.",
            ],
          },
          {
            n: "17.2 Restrictions on Use",
            body: [
            "The Buyer must not:",
            "Reproduce, copy, or share Elite's designs or documents",
            "Create derivative works",
            "Publish, distribute, or supply any proprietary material to third parties",
            "Claim ownership over Elite's intellectual property",
            "Unauthorised use may result in legal action.",
            ],
          },
        ],
      },
      {
        n: "18. Limitation of Liability",
        intro: [],
        subs: [
          {
            n: "18.1 Exclusions",
            body: [
            "To the maximum extent permitted by law, Elite Manufacturing Group Pty Ltd is not liable for:",
            "Indirect, incidental, consequential, or punitive damages",
            "Loss of profits, business, or income",
            "Delays caused by freight providers, weather, manufacturing constraints, or third parties",
            "Damage caused by inadequate Site access or lack of unloading equipment",
            "Costs arising from failed or rescheduled deliveries",
            "Damage occurring after delivery when risk has transferred to the Buyer",
            ],
          },
          {
            n: "18.2 Liability Cap",
            body: [
            "Elite Manufacturing Group Pty Ltd's total liability for any claim relating to the Product is strictly limited to the amount paid by the Buyer for that Product.",
            ],
          },
          {
            n: "18.3 No Liability After Delivery",
            body: [
            "Once delivery occurs and risk transfers to the Buyer, Elite is not responsible for:",
            "Theft",
            "Vandalism",
            "Weather damage",
            "Site hazards",
            "Improper unloading or storage",
            "Damage caused by Buyer-selected contractors or equipment",
            ],
          },
        ],
      },
      {
        n: "19. Indemnity",
        intro: ["The Buyer agrees to indemnify and hold harmless Elite Manufacturing Group Pty Ltd, its employees, agents, and representatives from any claims, damages, losses, or liabilities arising from:", "Use, operation, installation, relocation, or maintenance of the Product after delivery", "Damage caused by the Buyer's contractors or third parties", "Failure to follow instructions, specifications, or safety requirements", "Breach of these Terms", "This indemnity survives completion of delivery and payment."],
        subs: [
        ],
      },
      {
        n: "20. Compliance With Laws & Approvals",
        intro: [],
        subs: [
          {
            n: "20.1 Buyer's Responsibility for Compliance",
            body: [
            "The Buyer is solely responsible for ensuring:",
            "All council permits and approvals are obtained",
            "Zoning and land-use requirements are met",
            "The Site is correctly prepared and suitable for the Product",
            "Installation complies with local regulations",
            "Foundation, electrical, plumbing, and other essential services meet legal standards",
            "Elite Manufacturing Group Pty Ltd does not guarantee compliance unless explicitly stated in writing.",
            ],
          },
          {
            n: "20.2 No Liability for Approval or Permit Issues",
            body: [
            "Elite is not responsible for:",
            "Delays caused by approval processes",
            "Rejection of applications",
            "Costs associated with re-application or redesign required by authorities",
            "If the Buyer fails to obtain approvals, this does not entitle them to cancel the order or receive a refund.",
            ],
          },
        ],
      },
    ],
  },
  {
    part: "PART 4 — DISPUTE RESOLUTION, FORCE MAJEURE, INSURANCE, CONFIDENTIALITY & FINAL TERMS",
    sections: [
      {
        n: "21. Dispute Resolution",
        intro: ["Elite Manufacturing Group Pty Ltd aims to resolve all issues quickly and fairly.", "If a dispute arises, the following process applies:"],
        subs: [
          {
            n: "21.1 Negotiation First",
            body: [
            "Both parties must first attempt to resolve any dispute through good-faith negotiation, either by phone, email, or written communication.",
            ],
          },
          {
            n: "21.2 Mediation",
            body: [
            "If the dispute cannot be resolved within a reasonable period, either party may request that the matter be referred to mediation with an independent mediator agreed upon by both parties.",
            "Mediation costs are shared unless otherwise agreed.",
            ],
          },
          {
            n: "21.3 Arbitration",
            body: [
            "If mediation fails, the dispute may be referred to binding arbitration under Australian law.",
            "Arbitration will:",
            "Take place in Darwin, NT",
            "Be conducted in English",
            "Result in a final and enforceable decision",
            ],
          },
          {
            n: "21.4 Immediate Court Relief",
            body: [
            "Either party may seek urgent injunctive or equitable relief from a court without first engaging in negotiation or mediation if required to protect their rights.",
            ],
          },
        ],
      },
      {
        n: "22. Force Majeure (Events Outside Our Control)",
        intro: ["Elite Manufacturing Group Pty Ltd is not liable for delays or failures to perform obligations caused by events beyond our reasonable control, including but not limited to:", "Natural disasters (floods, storms, fires, earthquakes)", "War, terrorism, riots, or civil unrest", "Acts of government or regulatory authorities", "Transport incidents or supply chain failures", "Shortages of materials or labour", "Pandemics or public health orders", "Industrial action", "When a Force Majeure event occurs:", "Our obligations are suspended for the duration of the event", "Timeframes and delivery estimates are extended accordingly", "The Buyer is not entitled to cancel or claim compensation due to delays"],
        subs: [
        ],
      },
      {
        n: "23. Insurance",
        intro: [],
        subs: [
          {
            n: "23.1 Buyer Insurance After Delivery",
            body: [
            "Once risk transfers upon delivery, the Buyer is strongly encouraged to maintain appropriate insurance to cover:",
            "Theft",
            "Fire and storm damage",
            "Vandalism",
            "Accidental damage",
            "Damage during any relocation or movement",
            "Elite Manufacturing Group Pty Ltd is not responsible for any loss or damage occurring after delivery.",
            ],
          },
          {
            n: "23.2 Additional Insurance Requirements",
            body: [
            "If required by law, or if your Site conditions present elevated risks, you must arrange any additional insurance necessary to protect the Product.",
            ],
          },
        ],
      },
      {
        n: "24. Confidentiality",
        intro: ["Both Elite Manufacturing Group Pty Ltd and the Buyer may have access to confidential information during the course of the transaction.", "Each party agrees:", "Not to disclose confidential information to third parties", "Not to use confidential information for any purpose other than fulfilling the Contract", "To take reasonable steps to protect confidential information", "Exceptions apply when disclosure is:", "Required by law", "Necessary to obtain professional advice", "Explicitly approved in writing by the other party"],
        subs: [
        ],
      },
      {
        n: "25. Notices",
        intro: ["Any formal notices required under these Terms must be provided in writing, and will be deemed received when:", "Delivered personally", "Sent by registered or express post", "Sent by email to the addresses provided by each party", "Buyers must ensure their contact details remain accurate and up to date."],
        subs: [
        ],
      },
      {
        n: "26. Assignment",
        intro: ["The Buyer may not assign, transfer, or subcontract any of their rights or obligations under these Terms without prior written consent from Elite Manufacturing Group Pty Ltd.", "Elite may assign or subcontract obligations where necessary, provided this does not reduce the Buyer's rights under these Terms."],
        subs: [
        ],
      },
      {
        n: "27. Severability",
        intro: ["If any provision of these Terms is found to be invalid or unenforceable, the remainder of the Terms will continue in full force.", "The invalid provision will be replaced with a clause that most closely reflects the original intent and is legally enforceable."],
        subs: [
        ],
      },
      {
        n: "28. Waiver",
        intro: ["A failure or delay by Elite Manufacturing Group Pty Ltd to enforce any right or provision does not constitute a waiver.", "Any waiver must be:", "In writing", "Signed by an authorised representative of Elite", "A waiver on one occasion does not mean that provision is waived on future occasions."],
        subs: [
        ],
      },
      {
        n: "29. Entire Agreement",
        intro: ["These Terms, together with any written Transportable Building Sales Contract, quotes, invoices, or additional written agreements, constitute the entire agreement between Elite Manufacturing Group Pty Ltd and the Buyer.", "No verbal statements, prior discussions, or external representations override these Terms."],
        subs: [
        ],
      },
    ],
  },
];

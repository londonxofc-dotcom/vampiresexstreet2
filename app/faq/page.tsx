import Link from 'next/link';

const faqs = [
  {
    question: 'Who is Vampire Sex?',
    answer:
      'Vampire Sex is London X and Reefro Cons, a Miami minimal tech house duo with official-site reported streaming, chart, playlist, and DJ-support traction.',
  },
  {
    question: 'Where can booking and press reach you?',
    answer:
      'Use bookings@vampiresexworldwide.com for booking, press, one-sheet requests, and legitimate business inquiries.',
  },
  {
    question: 'What is Bloodline?',
    answer:
      'Bloodline is the early-access registry for official Vampire Sex merch and public drop updates. It is not a private leak list.',
  },
  {
    question: 'Are the stats independently verified?',
    answer:
      'Stats on this site are first-party reported from public and internal artist-facing dashboards. Use the sources page for public reference links and claim caveats.',
  },
  {
    question: 'Can people submit booking offers through the site?',
    answer:
      'Yes. The offer form is for real dates only and asks for event, date or location, amount, and context before sending to the booking inbox.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#E8DCC8] px-4 py-4 text-[#1A1612] md:px-6">
      <section className="mx-auto max-w-5xl border-[1.5px] border-[#1A1612] bg-[#F2EDE4] p-6 md:p-10">
        <p className="text-[9px] uppercase tracking-[0.34em] text-[#4A7C3F]">Public FAQ</p>
        <h1 className="mt-4 font-sans text-[18vw] leading-[0.78] tracking-normal md:text-[8rem]">
          FAQ
        </h1>
        <div className="mt-8 grid gap-4">
          {faqs.map((item) => (
            <article key={item.question} className="border-[1.5px] border-[#1A1612]/20 p-5">
              <h2 className="font-sans text-3xl tracking-normal">{item.question}</h2>
              <p className="mt-3 text-sm leading-relaxed uppercase text-[#1A1612]/72">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t-[1.5px] border-[#1A1612]/15 pt-6 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center bg-[#1A1612] px-5 py-2.5 font-sans text-lg uppercase tracking-[0.12em] text-[#F2EDE4] transition-colors hover:bg-[#4A7C3F]"
          >
            Back to Site
          </Link>
          <Link
            href="/sources"
            className="inline-flex min-h-[44px] items-center justify-center border-[1.5px] border-[#1A1612] px-5 py-2.5 font-sans text-lg uppercase tracking-[0.12em] transition-colors hover:bg-[#1A1612] hover:text-[#F2EDE4]"
          >
            View Sources
          </Link>
        </div>
      </section>
    </main>
  );
}

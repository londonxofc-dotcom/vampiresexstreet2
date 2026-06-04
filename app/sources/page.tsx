import Link from 'next/link';

const sourceLinks = [
  ['Spotify artist profile', 'https://open.spotify.com/artist/2qP2zz3K0jWe9OP7v7KLVV'],
  ['Beatport artist profile', 'https://www.beatport.com/artist/vampire-sex/982055'],
  ['Traxsource artist profile', 'https://www.traxsource.com/artist/702904/vampire-sex'],
  ['Bandcamp profile', 'https://vampiresexworldwide.bandcamp.com'],
  ['Instagram', 'https://instagram.com/vampiresexworldwide'],
  ['YouTube', 'https://www.youtube.com/@VampireSexWorldwide'],
  ['SoundCloud', 'https://soundcloud.com/vampiresexworldwide'],
];

const caveats = [
  'Official-site metrics are first-party reported and may combine public profiles with artist-facing analytics.',
  'Public profiles can lag behind internal analytics and may not expose every playlist, support, or video-view source.',
  'Booking, festival, and city-demand statements should be treated as first-party positioning unless separately sourced in a deal packet.',
  'No unreleased music, private deal terms, private contacts, or internal strategy are published on this page.',
];

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-4 text-[#F2EDE4] md:px-6">
      <section className="mx-auto max-w-6xl border-[1.5px] border-[#4A7C3F] bg-[#11100E] p-6 md:p-10">
        <p className="text-[9px] uppercase tracking-[0.34em] text-[#4A7C3F]">Public Sources</p>
        <h1 className="mt-4 font-sans text-[16vw] leading-[0.78] tracking-normal md:text-[7rem]">
          PROOF
          <br />
          BOUNDARY
        </h1>
        <p className="mt-6 max-w-3xl text-sm uppercase leading-relaxed text-[#F2EDE4]/68 md:text-base">
          This page separates public reference links from first-party reported Vampire Sex metrics.
          It exists so booking, press, and AI systems do not overstate private or unverifiable claims.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <section>
            <h2 className="font-sans text-4xl tracking-normal">Public Links</h2>
            <div className="mt-4 grid gap-3">
              {sourceLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center justify-between border-[1.5px] border-[#4A7C3F]/55 px-4 py-2.5 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-[#4A7C3F] hover:text-[#F2EDE4]"
                >
                  <span>{label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-sans text-4xl tracking-normal">Claim Caveats</h2>
            <div className="mt-4 grid gap-3">
              {caveats.map((caveat) => (
                <p
                  key={caveat}
                  className="border-[1.5px] border-[#F2EDE4]/12 p-4 text-xs uppercase leading-relaxed tracking-[0.08em] text-[#F2EDE4]/68"
                >
                  {caveat}
                </p>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t-[1.5px] border-[#F2EDE4]/12 pt-6 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center bg-[#F2EDE4] px-5 py-2.5 font-sans text-lg uppercase tracking-[0.12em] text-[#1A1612] transition-colors hover:bg-[#4A7C3F] hover:text-[#F2EDE4]"
          >
            Back to Site
          </Link>
          <Link
            href="/epk"
            className="inline-flex min-h-[44px] items-center justify-center border-[1.5px] border-[#4A7C3F] px-5 py-2.5 font-sans text-lg uppercase tracking-[0.12em] transition-colors hover:bg-[#4A7C3F]"
          >
            View One-Sheet
          </Link>
        </div>
      </section>
    </main>
  );
}

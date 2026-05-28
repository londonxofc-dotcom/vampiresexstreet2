import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vampire Sex One-Sheet',
  description: 'Official one-sheet for Vampire Sex: London X, Reefro Cons, music, proof, booking info, and links.',
};

const proof = [
  ['2.9M', 'Total streams'],
  ['10.2M', 'Video views'],
  ['47', 'Chart placements'],
  ['306', 'DJ supports'],
  ['370', 'Playlists'],
  ['4.5M', 'Playlist reach'],
];

const links = [
  ['Spotify', 'https://open.spotify.com/artist/2qP2zz3K0jWe9OP7v7KLVV'],
  ['Traxsource', 'https://www.traxsource.com/artist/702904/vampire-sex'],
  ['Beatport', 'https://www.beatport.com/artist/vampire-sex/982055'],
  ['Instagram', 'https://instagram.com/vampiresexworldwide'],
];

export default function EpkPage() {
  return (
    <main className="min-h-screen bg-[#E8DCC8] px-4 py-4 text-[#1A1612] md:px-6 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl border-[1.5px] border-[#1A1612] bg-[#F2EDE4] shadow-[0_18px_70px_rgba(26,22,18,0.08)] print:h-[10.5in] print:w-[8in] print:shadow-none">
        <div className="grid gap-0 md:min-h-[calc(100vh-2rem)] md:grid-cols-[1.08fr_0.92fr] print:min-h-full print:grid-cols-[1.08fr_0.92fr]">
          <section className="border-b-[1.5px] border-[#1A1612] p-6 md:border-b-0 md:border-r-[1.5px] md:p-8 print:border-b-0 print:border-r-[1.5px] print:p-7">
            <p className="text-[9px] tracking-[0.32em] uppercase text-[#4A7C3F]">Official One-Sheet</p>
            <h1 className="mt-3 font-sans text-[17vw] leading-[0.8] tracking-normal md:text-[6.8rem] print:text-[5.6rem]">
              VAMPIRE
              <br />
              SEX
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed uppercase text-[#1A1612]/82 md:text-base print:text-[13px]">
              London X and Reefro Cons. Miami minimal tech house with teeth: records with receipts, rooms that answer back, and a world that treats culture like the dress code.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {proof.map(([value, label]) => (
                <div key={label} className="border-[1.5px] border-[#1A1612]/15 bg-[#E8DCC8] p-3 print:p-2.5">
                  <p className="font-sans text-3xl leading-none tracking-normal md:text-4xl print:text-[2rem]">{value}</p>
                  <p className="mt-1 text-[8px] tracking-[0.22em] uppercase text-[#1A1612]/55 print:text-[7px]">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t-[1.5px] border-[#1A1612]/15 pt-4">
              <p className="text-[9px] tracking-[0.32em] uppercase text-[#4A7C3F]">Key Story</p>
              <p className="mt-2 text-xs leading-relaxed uppercase text-[#1A1612]/78 md:text-sm print:text-[11px]">
                Flagship record <span className="text-[#1A1612]">&quot;Disco Party Baby&quot;</span> has 1.9M Spotify streams. Vampire Sex has earned
                47 chart placements, 306 DJ supports, 370 playlists, and 4.5M playlist reach without sanding off the attitude.
              </p>
            </div>
          </section>

          <section className="flex flex-col justify-between p-6 md:p-8 print:p-7">
            <div>
              <p className="text-[9px] tracking-[0.32em] uppercase text-[#4A7C3F]">Best Entry Points</p>
              <div className="mt-4 space-y-2.5">
                {links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-between border-[1.5px] border-[#1A1612] px-4 py-2.5 text-xs tracking-[0.22em] uppercase transition-colors hover:bg-[#1A1612] hover:text-[#F2EDE4] print:min-h-[38px] print:text-[10px]"
                  >
                    <span>{label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t-[1.5px] border-[#1A1612] pt-5">
              <p className="text-[9px] tracking-[0.32em] uppercase text-[#4A7C3F]">Booking / Press</p>
              <a
                href="mailto:bookings@vampiresexworldwide.com"
                className="mt-2 block break-words font-sans text-3xl leading-[0.95] tracking-normal underline decoration-[#4A7C3F] underline-offset-4 md:text-[2.35rem] print:text-[2rem]"
              >
                bookings@vampiresexworldwide.com
              </a>
              <p className="mt-3 text-xs leading-relaxed uppercase text-[#1A1612]/72 md:text-sm print:text-[11px]">
                Based in Miami, Florida. Ready for club dates, festival bookings, press, and branded opportunities that can handle something respectfully disrespectful.
              </p>
            </div>

            <div className="mt-6 border-t-[1.5px] border-[#1A1612]/15 pt-5">
              <p className="text-[9px] tracking-[0.32em] uppercase text-[#4A7C3F]">Positioning</p>
              <p className="mt-2 text-xs leading-relaxed uppercase text-[#1A1612]/72 md:text-sm print:text-[11px]">
                Festival-circuit ready with proven repeat demand across Miami, New York, LA, and Denver. Established enough for major buyers,
                still sharp enough for rooms that reject obvious polish.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t-[1.5px] border-[#1A1612]/15 pt-5 sm:flex-row print:hidden">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center bg-[#1A1612] px-5 py-2.5 font-sans text-lg tracking-[0.12em] uppercase text-[#F2EDE4] transition-colors hover:bg-[#4A7C3F]"
              >
                Back to Site
              </Link>
              <span className="inline-flex min-h-[44px] items-center justify-center border-[1.5px] border-[#1A1612]/20 px-5 py-2.5 text-[9px] tracking-[0.24em] uppercase text-[#1A1612]/55">
                One-page press overview
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

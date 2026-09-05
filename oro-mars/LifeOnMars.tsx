import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * ORO — Life on Mars. The neighbourhood page: one sol, the promenade, the
 * terraces, the observatory, the commons, and the honest journey.
 *
 * Shares the experience's design language: ink/sand/gold tokens, Bruno Ace display
 * over Sansation body, hairline rules, gold-pip markers, film grain, and the same
 * gold-rule -> eyebrow -> headline reveal cadence.
 *
 * Assets expected in `public/life/` :
 *   hero.jpg · commons.jpg · terraces.jpg · observatory.jpg · evening.jpg
 *
 * Tokens, fonts and the `oro-pip` keyframe are declared alongside
 * OroMarsExperience — this page reuses them and adds nothing new.
 */

const MENU = [
  { label: "ORO", href: "/" },
  { label: "The Collection", href: "/collection" },
  { label: "Life on Mars", href: "/life", current: true },
  { label: "Reserve Your View", href: "/#reserve" },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

const SCRIM = [
  "linear-gradient(to top, rgba(7,5,3,.94) 0%, rgba(7,5,3,.80) 14%, rgba(7,5,3,.58) 30%, rgba(7,5,3,.34) 46%, rgba(7,5,3,.16) 62%, rgba(7,5,3,.05) 78%, rgba(7,5,3,0) 100%)",
  "linear-gradient(to right, rgba(7,5,3,.55) 0%, rgba(7,5,3,.32) 30%, rgba(7,5,3,.1) 60%, rgba(7,5,3,0) 100%)",
].join(", ");

const SCRIM_CLOSING = [
  "linear-gradient(to top, rgba(7,5,3,.92) 0%, rgba(7,5,3,.78) 12%, rgba(7,5,3,.58) 26%, rgba(7,5,3,.38) 40%, rgba(7,5,3,.2) 56%, rgba(7,5,3,.07) 74%, rgba(7,5,3,0) 100%)",
  "linear-gradient(to right, rgba(7,5,3,.5) 0%, rgba(7,5,3,.28) 34%, rgba(7,5,3,0) 72%)",
].join(", ");

/** one beat of the sol timeline */
const SOL: [string, string, string][] = [
  ["05:47", "First light", "The sun clears the eastern mesas. Glazing warms from cobalt to amber in about nine minutes."],
  ["07:30", "The promenade", "Nine hundred metres of pressurised walk, olive trees on one side, the canyon on the other."],
  ["12:00", "Midday, indoors", "The warmest hours. Interiors hold 21°C and one atmosphere, year-round, without exception."],
  ["17:20", "The terraces", "Harvest, and the shared kitchen. Most of what reaches the table was cut that afternoon."],
  ["19:05", "Blue sunset", "Dust scatters red light outward, so the sun sets blue. It lasts about forty minutes."],
  ["22:40", "Earthrise", "Earth appears as a blue-white evening star, brighter than anything else in the sky."],
];

type Band = {
  eyebrow: string;
  title: string;
  body: string;
  img: string;
  alt: string;
  facts: [string, string][];
};

const BANDS: Band[] = [
  {
    eyebrow: "The Promenade",
    title: "Nine hundred metres,\nand no helmet.",
    body: "Every residence connects to a single pressurised spine that runs the length of the settlement. It is planted like a street, not plumbed like a tunnel — olive, fig and bay in recessed stone beds, benches in the wide parts, and a continuous glass wall holding back the valley. It is where the community actually happens: the walk to dinner, the argument about the water budget, the children who never learned that corridors are supposed to be dull.",
    img: "/life/commons.jpg",
    alt: "The pressurised promenade with olive trees and the valley beyond",
    facts: [
      ["Length", "900 m"],
      ["Pressure", "1 atm"],
      ["Planting", "340 trees"],
      ["Connects", "All 24"],
    ],
  },
  {
    eyebrow: "The Terraces",
    title: "Dinner is grown\nfour minutes away.",
    body: "Eleven growing houses step down the western slope, sharing one closed water loop with the residences. Between them they carry leaf crops, tomatoes, herbs, citrus under glass, and a small experimental orchard that the community votes on each year. About seventy percent of what ORO eats is grown at ORO; the rest arrives on the transfer ships, and is treated accordingly.",
    img: "/life/terraces.jpg",
    alt: "Terraced growing houses stepping down the slope at golden hour",
    facts: [
      ["Growing houses", "Eleven"],
      ["Under glass", "4,200 m²"],
      ["Self-supplied", "70%"],
      ["Water loop", "98% recovery"],
    ],
  },
  {
    eyebrow: "The Observatory",
    title: "The darkest sky\nanyone has ever owned.",
    body: "No cities, no aircraft, no scattered streetlight for four hundred kilometres in any direction. The ridge observatory is shared by the twenty-four households and open through the night. On a clear sol you can read by Earthlight — and once every twenty-six months, when the planets close, it is the brightest thing above the horizon.",
    img: "/life/observatory.jpg",
    alt: "The ridge observatory at night with Earth low on the horizon",
    facts: [
      ["Elevation", "+180 m"],
      ["Light pollution", "None"],
      ["Access", "All residents"],
      ["Nearest city", "400 km"],
    ],
  },
];

const COMMONS: [string, string][] = [
  ["Water Plant", "Extraction from subsurface ice, filtration and a 400-litre reserve held for every residence."],
  ["The Kitchen", "A shared table for forty, and a chef in residence three evenings a sol-week."],
  ["Medical Suite", "Two physicians on rotation, surgical capability, and a direct link to Earth specialists at 3–22 minutes' latency."],
  ["The Baths", "Warm mineral pools cut into the rock, drawing on the same closed loop as the terraces."],
  ["Workshop & Print Hall", "The regolith printer that built the shells. Residents use it for everything from furniture to spares."],
  ["School Room", "Small, and taught in person. Currently nine children between four and sixteen."],
  ["Rover Bay", "Six pressurised rovers, maintained and shared. Range of 340 km on a single charge."],
  ["The Trust", "Forty square kilometres of the valley held in perpetuity, and never to be built upon."],
];

const JOURNEY: [string, string, string, string, boolean][] = [
  ["Earth departure", "—", "Every 26 months", "Transfer window; four weeks' notice", true],
  ["Transit", "7 months", "Continuous", "Private cabin, 0.38 g spin section", false],
  ["Descent & arrival", "1 day", "On landing", "Lander pad at the settlement edge", false],
  ["Acclimatisation", "3 weeks", "Once", "Supervised; medical suite on site", false],
  ["Return", "7 months", "Every 26 months", "Unlimited returns; residence held", true],
];

/** gold rule + letterspaced label, revealed by the parent's data-in flag */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="relative pl-[34px] text-[9px] uppercase tracking-[0.4em] text-oro-gold before:absolute before:left-0 before:top-1/2 before:h-px before:w-6 before:origin-left before:scale-x-0 before:bg-oro-gold before:transition-transform before:delay-150 before:duration-1000 group-data-[in=1]:before:scale-x-100">
      {children}
    </p>
  );
}

/** wraps a block and flips data-in the first time it enters the viewport */
function Reveal({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // @ts-expect-error — polymorphic tag
    <Tag ref={ref} data-in={shown ? "1" : "0"} className={`group ${className}`}>
      {children}
    </Tag>
  );
}

/** children of a Reveal rise in sequence */
const step = (i: number) =>
  `translate-y-[18px] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out group-data-[in=1]:translate-y-0 group-data-[in=1]:opacity-100 ${
    ["delay-[40ms]", "delay-[140ms]", "delay-[240ms]", "delay-[340ms]", "delay-[440ms]"][i] ?? "delay-[440ms]"
  }`;

export default function LifeOnMars() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [past, setPast] = useState(false);
  const oroRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  /* lock "MARS RESIDENCES" to the exact width of "ORO" — same rule as the experience */
  useEffect(() => {
    const fit = () => {
      const oro = oroRef.current;
      const sub = subRef.current;
      if (!oro || !sub) return;
      sub.style.transform = "none";
      const a = oro.getBoundingClientRect().width;
      const b = sub.getBoundingClientRect().width;
      if (a > 0 && b > 0) sub.style.transform = `scaleX(${a / b})`;
    };
    document.fonts?.ready.then(fit);
    const t1 = window.setTimeout(fit, 400);
    const t2 = window.setTimeout(fit, 1600);
    window.addEventListener("resize", fit);

    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.45);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", fit);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-oro-ink font-body font-light text-oro-sand antialiased">
      {/* a whisper of film grain — same treatment as the experience */}
      <div
        aria-hidden
        style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px", mixBlendMode: "overlay" }}
        className="pointer-events-none fixed inset-0 z-[12] opacity-[.05]"
      />

      {/* ---------------- header ---------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-5 py-4 transition-all duration-500 md:px-12 md:py-8 ${
          past ? "bg-oro-ink/70 backdrop-blur-md" : ""
        }`}
      >
        <a href="/" className="flex flex-col items-start gap-[0.42em] leading-none" aria-label="ORO — Mars Residences">
          <span ref={oroRef} className="block font-display text-2xl tracking-[0.02em] md:text-[38px]">
            ORO
          </span>
          <span
            ref={subRef}
            className="block origin-left whitespace-nowrap text-[8px] tracking-[0.12em] text-oro-sand/60 md:text-[11px]"
          >
            MARS RESIDENCES
          </span>
        </a>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Menu"
          className="grid h-11 w-11 place-content-center text-oro-sand transition-opacity hover:opacity-70"
        >
          {menuOpen ? <X strokeWidth={1} className="h-6 w-6" /> : <Menu strokeWidth={1} className="h-6 w-6" />}
        </button>
      </header>

      {/* ---------------- menu ---------------- */}
      <div
        className={`fixed inset-0 z-50 grid content-center px-6 py-24 backdrop-blur-2xl transition-all duration-500 md:px-[7vw] ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "hsl(var(--oro-ink)/.94)" }}
      >
        <nav className="flex flex-col">
          {MENU.map((m, i) => (
            <a
              key={m.label}
              href={m.href}
              aria-current={m.current ? "page" : undefined}
              className={`flex items-baseline gap-4 border-b border-oro-sand/10 py-3 font-display text-xl leading-tight transition-all duration-300 hover:pl-3.5 hover:text-oro-gold hover:opacity-100 md:gap-8 md:text-[44px] ${
                m.current ? "pl-3.5 text-oro-gold opacity-100" : "text-oro-sand opacity-55"
              }`}
            >
              <span className="font-body text-[10px] font-light tracking-[0.3em] text-oro-sand/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{m.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-8 flex flex-wrap gap-6 text-[11px] tracking-[0.16em] text-oro-sand/60 md:mt-14 md:gap-16">
          <span>Sales Gallery · Aurora Vallis</span>
          <span>residences@oro.mars</span>
          <span>Launch Window 2041</span>
        </div>
      </div>

      {/* back to the experience — only while the hero is in view */}
      <a
        href="/"
        className={`fixed bottom-6 left-5 z-40 hidden items-center gap-2.5 text-[9px] uppercase tracking-[0.3em] text-oro-sand/60 transition-all duration-500 hover:gap-4 hover:text-oro-sand md:bottom-10 md:left-12 md:inline-flex ${
          past ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="block h-px w-[22px] bg-current" />
        Back to the experience
      </a>

      {/* ---------------- hero ---------------- */}
      <Reveal as="section" className="relative flex min-h-[min(92vh,940px)] items-end overflow-hidden">
        <img
          src="/life/hero.jpg"
          alt="The ORO settlement on the southern rim of Aurora Vallis"
          className="absolute inset-0 h-full w-full scale-[1.06] object-cover transition-transform duration-[2600ms] ease-out group-data-[in=1]:scale-100"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />
        <div className="relative z-[2] w-full px-5 pb-14 md:px-12 md:pb-[8vh]">
          <div className={step(0)}>
            <Eyebrow>The neighbourhood</Eyebrow>
          </div>
          <h1 className={`mt-5 font-display text-[clamp(38px,6.4vw,104px)] font-normal leading-none md:mt-7 ${step(1)}`}>
            Life on Mars
          </h1>
          <p className={`mt-5 max-w-[52ch] text-[clamp(15px,1.15vw,19px)] leading-relaxed text-oro-sand/60 md:mt-7 ${step(2)}`}>
            Twenty-four households on the southern rim of Aurora Vallis. Close enough to know every
            neighbour, far enough that no window looks into another. This is what an ordinary day here
            actually looks like.
          </p>
        </div>
      </Reveal>

      {/* ---------------- one sol ---------------- */}
      <Reveal as="section" className="border-t border-oro-sand/[.14] px-5 py-16 md:px-12 md:py-[10vh]">
        <div className={step(0)}>
          <Eyebrow>One sol</Eyebrow>
        </div>
        <h2 className={`mt-4 whitespace-pre-line font-display text-[clamp(24px,2.8vw,44px)] font-normal leading-[1.1] md:mt-5 ${step(1)}`}>
          {"A day here runs\nthirty-seven minutes long."}
        </h2>
        <p className={`mt-4 max-w-[56ch] text-[clamp(13.5px,1.02vw,16px)] leading-[1.75] text-oro-sand/60 md:mt-6 ${step(2)}`}>
          Mars turns a little slower than Earth, so a sol is 24 hours and 39 minutes. ORO keeps Martian
          time — the clocks stretch, the light stretches with them, and the extra half-hour lands in the
          evening where you notice it most.
        </p>
        <div className={`mt-9 grid border-t border-oro-sand/[.14] md:mt-[clamp(34px,4.4vw,60px)] md:grid-cols-3 lg:grid-cols-6 ${step(3)}`}>
          {SOL.map(([time, title, note], i) => (
            <div
              key={time}
              className={`py-6 pb-8 pr-4 md:py-[clamp(22px,2.6vw,34px)] md:pb-[clamp(26px,3vw,40px)] ${
                i > 0 ? "border-t border-oro-sand/[.14] md:border-l md:border-t-0 md:pl-[clamp(16px,1.8vw,26px)]" : ""
              }`}
            >
              <time className="block font-display text-[clamp(15px,1.4vw,21px)] text-oro-gold">{time}</time>
              <b className="mt-[.9em] block font-body text-[clamp(13px,1.02vw,15.5px)] font-normal tracking-[0.02em]">
                {title}
              </b>
              <span className="mt-[.55em] block text-[clamp(12px,.92vw,14px)] leading-[1.6] text-oro-sand/60">
                {note}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ---------------- bands ---------------- */}
      {BANDS.map((b, i) => (
        <Reveal
          key={b.eyebrow}
          as="article"
          className="grid items-center gap-7 border-t border-oro-sand/[.14] px-5 py-11 md:grid-cols-[1.15fr_.85fr] md:gap-[clamp(28px,4.6vw,80px)] md:px-12 md:py-[7vh]"
        >
          <div className={`relative aspect-video overflow-hidden rounded-sm bg-[#0D0906] ${i % 2 === 1 ? "md:order-2" : ""} ${step(0)}`}>
            <img
              src={b.img}
              alt={b.alt}
              className="h-full w-full scale-[1.08] object-cover transition-transform duration-[1600ms] ease-out group-data-[in=1]:scale-100"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(239,227,212,.09)]"
              style={{ background: "linear-gradient(to top, rgba(7,5,3,.4), rgba(7,5,3,0) 45%)" }}
            />
          </div>

          <div>
            <div className={step(1)}>
              <Eyebrow>{b.eyebrow}</Eyebrow>
            </div>
            <h2 className={`mt-4 whitespace-pre-line font-display text-[clamp(24px,2.8vw,44px)] font-normal leading-[1.1] md:mt-5 ${step(2)}`}>
              {b.title}
            </h2>
            <p className={`mt-4 max-w-[46ch] text-[clamp(13.5px,1.02vw,16px)] leading-[1.75] text-oro-sand/60 md:mt-5 ${step(3)}`}>
              {b.body}
            </p>
            <dl className={`mt-6 grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-4 border-t border-oro-sand/[.14] pt-5 md:mt-8 md:gap-x-10 md:pt-6 ${step(4)}`}>
              {b.facts.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-[7px]">
                  <dt className="text-[9px] uppercase tracking-[0.28em] text-oro-sand/40">{k}</dt>
                  <dd className="font-display text-[clamp(14px,1.25vw,19px)]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      ))}

      {/* ---------------- the commons ---------------- */}
      <Reveal as="section" className="border-t border-oro-sand/[.14] px-5 py-16 md:px-12 md:py-[10vh]">
        <div className={step(0)}>
          <Eyebrow>The Commons</Eyebrow>
        </div>
        <h2 className={`mt-4 whitespace-pre-line font-display text-[clamp(24px,2.8vw,44px)] font-normal leading-[1.1] md:mt-5 ${step(1)}`}>
          {"Everything a life needs.\nNothing it does not."}
        </h2>
        <div className={`mt-8 grid gap-px border border-oro-sand/[.14] bg-oro-sand/[.14] sm:grid-cols-2 lg:grid-cols-4 md:mt-[clamp(30px,4vw,52px)] ${step(2)}`}>
          {COMMONS.map(([title, note]) => (
            <div key={title} className="bg-oro-ink p-6 transition-colors duration-500 hover:bg-[#0C0805] md:p-[clamp(24px,2.8vw,38px)]">
              <i className="block h-[5px] w-[5px] rounded-full bg-oro-gold shadow-[0_0_0_4px_rgba(227,176,114,.14)]" />
              <b className="mt-5 block font-display text-[clamp(15px,1.35vw,21px)] font-normal md:mt-[clamp(18px,2vw,26px)]">
                {title}
              </b>
              <span className="mt-[.8em] block text-[clamp(12.5px,.96vw,14.5px)] leading-[1.65] text-oro-sand/60">
                {note}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ---------------- getting there ---------------- */}
      <Reveal as="section" className="border-t border-oro-sand/[.14] px-5 py-16 md:px-12 md:py-[10vh]">
        <div className={step(0)}>
          <Eyebrow>Getting there</Eyebrow>
        </div>
        <h3 className={`mt-4 font-display text-[clamp(24px,2.8vw,44px)] font-normal leading-[1.1] md:mt-5 ${step(1)}`}>
          The journey, honestly stated.
        </h3>
        <div className={`mt-7 overflow-x-auto md:mt-11 ${step(2)}`}>
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr>
                {["Stage", "Duration", "Cadence", "Notes"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-left text-[9px] font-light uppercase tracking-[0.28em] text-oro-sand/40 md:px-5 md:py-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOURNEY.map(([stage, duration, cadence, notes, hi]) => (
                <tr key={stage} className="transition-colors duration-300 hover:bg-oro-sand/[.035]">
                  <th
                    scope="row"
                    className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-left font-display text-[clamp(14px,1.2vw,18px)] font-normal md:px-5 md:py-5"
                  >
                    {stage}
                  </th>
                  <td className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-[clamp(13px,1vw,15.5px)] text-oro-sand/60 md:px-5 md:py-5">
                    {duration}
                  </td>
                  <td
                    className={`whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-[clamp(13px,1vw,15.5px)] md:px-5 md:py-5 ${
                      hi ? "text-oro-gold" : "text-oro-sand/60"
                    }`}
                  >
                    {cadence}
                  </td>
                  <td className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-[clamp(13px,1vw,15.5px)] text-oro-sand/60 md:px-5 md:py-5">
                    {notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* ---------------- closing ---------------- */}
      <Reveal as="section" className="relative flex min-h-[min(74vh,720px)] items-end overflow-hidden">
        <img
          src="/life/evening.jpg"
          alt="Residents at the evening terrace above the canyon"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: SCRIM_CLOSING }} />
        <div className="relative z-[2] flex w-full flex-wrap items-end justify-between gap-6 px-5 pb-14 md:gap-[clamp(24px,5vw,90px)] md:px-12 md:pb-[8vh]">
          <div>
            <div className={step(0)}>
              <Eyebrow>Come and see</Eyebrow>
            </div>
            <h2 className={`mt-4 max-w-[18ch] font-display text-[clamp(26px,3.4vw,52px)] font-normal leading-[1.08] md:mt-6 ${step(1)}`}>
              You can visit the valley before you commit to it.
            </h2>
            <p className={`mt-[1.15em] max-w-[42ch] text-[clamp(15px,1.15vw,19px)] leading-[1.6] text-oro-sand/[.78] ${step(2)}`}>
              The sales gallery holds a full-scale residence and a fourteen-day stay programme, in Aurora
              Vallis and on Earth.
            </p>
          </div>
          <a
            href="mailto:residences@oro.mars?subject=ORO%20—%20Life%20on%20Mars"
            style={{
              background: "linear-gradient(180deg, rgba(150,72,42,.62) 0%, rgba(96,44,26,.5) 100%)",
              boxShadow: "0 12px 38px hsl(var(--oro-ink)/.45), inset 0 1px 0 hsl(var(--oro-sand)/.2)",
            }}
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-oro-gold/[.46] px-[34px] py-[17px] text-[11px] uppercase tracking-[0.24em] text-oro-sand transition-all duration-300 hover:-translate-y-0.5 hover:border-oro-gold/80 ${step(3)}`}
          >
            Arrange a visit
          </a>
        </div>
      </Reveal>

      <footer className="flex flex-wrap justify-between gap-x-10 gap-y-5 border-t border-oro-sand/[.14] px-5 py-8 text-[10px] uppercase tracking-[0.22em] text-oro-sand/40 md:px-12 md:py-11">
        <span>ORO Mars Residences</span>
        <span>Sales Gallery · Aurora Vallis</span>
        <a href="mailto:residences@oro.mars" className="transition-colors duration-300 hover:text-oro-gold">
          residences@oro.mars
        </a>
        <span>Launch Window 2041</span>
      </footer>
    </div>
  );
}

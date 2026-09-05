import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * ORO — The Collection. First inner page: the gallery of residence typologies.
 *
 * Shares the experience's design language: ink/sand/gold tokens, Bruno Ace display
 * over Sansation body, hairline rules, gold-pip chips, film grain, and the same
 * gold-rule → eyebrow → headline reveal cadence.
 *
 * Assets expected in `public/collection/` :
 *   hero.jpg · rim.jpg · terrace.jpg · vault.jpg · crest.jpg
 *
 * Tokens, fonts and the `oro-pip` keyframe are declared in OroMarsExperience.tsx —
 * this page reuses them, nothing new to add to index.css or tailwind.config.ts.
 */

type Typology = {
  no: string;
  type: string;
  name: string;
  kicker: string;
  body: string;
  img: string;
  alt: string;
  specs: [string, string][];
  status: string;
  soldOut?: boolean;
};

const TYPOLOGIES: Typology[] = [
  {
    no: "01",
    type: "Type A",
    name: "The Rim",
    kicker: "Canyon edge. Single level.",
    body: "The entry residence, and the only one that sits directly on the drop. A single continuous floor plate runs from the entry promenade to a nine-metre pane, with the whole of Aurora Vallis beyond it and nothing built below.",
    img: "/collection/rim.jpg",
    alt: "The Rim residence at dusk",
    specs: [
      ["Interior", "310 m²"],
      ["Terrace", "95 m²"],
      ["Bedrooms", "Two"],
      ["Aspect", "South-west"],
    ],
    status: "Two of six remaining",
  },
  {
    no: "02",
    type: "Type B",
    name: "The Terrace",
    kicker: "Garden facing. Split level.",
    body: "Built a half-level into the slope, so the living floor opens straight onto its own pressurised garden dome. Olive, fig and citrus grow here under a sky that has never seen rain — the largest private planting on the planet.",
    img: "/collection/terrace.jpg",
    alt: "The Terrace residence and its garden",
    specs: [
      ["Interior", "420 m²"],
      ["Garden dome", "140 m²"],
      ["Bedrooms", "Three"],
      ["Aspect", "West"],
    ],
    status: "Three of eight remaining",
  },
  {
    no: "03",
    type: "Type C",
    name: "The Vault",
    kicker: "Twin shell. Double height.",
    body: "Two printed shells meet over a single great room of 4.2 metres, the tallest interior volume at ORO. Regolith-cast plaster, hand-finished stone and low-mass timber, lit from a clerestory that tracks the sun across the rim.",
    img: "/collection/vault.jpg",
    alt: "The Vault residence great room",
    specs: [
      ["Interior", "520 m²"],
      ["Terrace", "160 m²"],
      ["Bedrooms", "Four"],
      ["Ceilings", "4.2 m"],
    ],
    status: "Fully reserved",
    soldOut: true,
  },
  {
    no: "04",
    type: "Type D",
    name: "The Crest",
    kicker: "Ridge summit. Private approach.",
    body: "Three residences hold the high ground, each with its own approach road, lander pad and an uninterrupted three-hundred-and-sixty degree horizon. Nothing at ORO stands above them, and by covenant nothing ever will.",
    img: "/collection/crest.jpg",
    alt: "The Crest residence on the ridge, with its private lander pad",
    specs: [
      ["Interior", "640 m²"],
      ["Terrace", "240 m²"],
      ["Bedrooms", "Five"],
      ["Aspect", "Panoramic"],
    ],
    status: "One of three remaining",
  },
];

const TABLE: [string, string, string, string, string, string, string, boolean][] = [
  ["The Rim", "310 m²", "95 m² terrace", "Two", "South-west", "6", "2 remaining", true],
  ["The Terrace", "420 m²", "140 m² garden dome", "Three", "West", "8", "3 remaining", true],
  ["The Vault", "520 m²", "160 m² terrace", "Four", "North-west", "7", "Fully reserved", false],
  ["The Crest", "640 m²", "240 m² terrace", "Five", "Panoramic", "3", "1 remaining", true],
];

const MENU = [
  { label: "ORO", href: "/" },
  { label: "The Collection", href: "/collection", current: true },
  { label: "Life on Mars", href: "/#life" },
  { label: "Reserve Your View", href: "/#reserve" },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
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

export default function TheCollection() {
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
        className={`group fixed bottom-6 left-5 z-40 hidden items-center gap-2.5 text-[9px] uppercase tracking-[0.3em] text-oro-sand/60 transition-all duration-500 hover:gap-4 hover:text-oro-sand md:bottom-10 md:left-12 md:inline-flex ${
          past ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="block h-px w-[22px] bg-current" />
        Back to the experience
      </a>

      {/* ---------------- hero ---------------- */}
      <Reveal as="section" className="relative flex min-h-[min(88vh,880px)] items-end overflow-hidden">
        <img
          src="/collection/hero.jpg"
          alt="Interior of an ORO residence looking out over Aurora Vallis"
          className="absolute inset-0 h-full w-full scale-[1.06] object-cover transition-transform duration-[2400ms] ease-out group-data-[in=1]:scale-100"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(to top, rgba(7,5,3,.94) 0%, rgba(7,5,3,.80) 14%, rgba(7,5,3,.58) 30%, rgba(7,5,3,.34) 46%, rgba(7,5,3,.16) 62%, rgba(7,5,3,.05) 78%, rgba(7,5,3,0) 100%)",
              "linear-gradient(to right, rgba(7,5,3,.55) 0%, rgba(7,5,3,.32) 30%, rgba(7,5,3,.1) 60%, rgba(7,5,3,0) 100%)",
            ].join(", "),
          }}
        />
        <div className="relative z-[2] w-full px-5 pb-14 md:px-12 md:pb-[8vh]">
          <div className={step(0)}>
            <Eyebrow>Aurora Vallis · Mars</Eyebrow>
          </div>
          <h1 className={`mt-5 font-display text-[clamp(38px,6.4vw,104px)] font-normal leading-none md:mt-7 ${step(1)}`}>
            The Collection
          </h1>
          <p className={`mt-5 max-w-[52ch] text-[clamp(15px,1.15vw,19px)] leading-relaxed text-oro-sand/60 md:mt-7 ${step(2)}`}>
            Four typologies. Twenty-four residences. Every one of them cut into the southern rim of the
            canyon, oriented to the sunrise, and delivered complete — shell, systems, interiors and garden.
          </p>
          <dl className={`mt-7 flex flex-wrap gap-7 border-t border-oro-sand/[.14] pt-5 md:mt-11 md:gap-[72px] md:pt-7 ${step(3)}`}>
            {[
              ["Typologies", "Four"],
              ["Residences", "24"],
              ["Interiors", "310–640 m²"],
              ["Delivery", "From 2041"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2">
                <dt className="text-[9px] uppercase tracking-[0.3em] text-oro-sand/40">{k}</dt>
                <dd className="font-display text-lg md:text-[28px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* ---------------- typologies ---------------- */}
      <section className="pt-[clamp(72px,11vh,150px)]">
        {TYPOLOGIES.map((t, i) => (
          <Reveal
            key={t.no}
            as="article"
            className="grid items-center gap-7 border-t border-oro-sand/[.14] px-5 py-11 md:grid-cols-[1.15fr_.85fr] md:gap-[clamp(28px,4.6vw,80px)] md:px-12 md:py-[7vh]"
          >
            <div className={`relative aspect-[16/10] overflow-hidden rounded-sm bg-[#0D0906] ${i % 2 === 1 ? "md:order-2" : ""} ${step(0)}`}>
              <span className="absolute left-0 top-0 z-[2] border-b border-r border-oro-sand/[.14] bg-oro-ink/55 px-[18px] py-3 font-display text-[clamp(13px,1.1vw,17px)]">
                {t.no}
              </span>
              <img
                src={t.img}
                alt={t.alt}
                className="h-full w-full scale-[1.08] object-cover transition-transform duration-[1600ms] ease-out group-data-[in=1]:scale-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(239,227,212,.09)]"
                style={{ background: "linear-gradient(to top, rgba(7,5,3,.42), rgba(7,5,3,0) 45%)" }}
              />
            </div>

            <div>
              <div className={step(1)}>
                <Eyebrow>{t.type}</Eyebrow>
              </div>
              <h2 className={`mt-4 font-display text-[clamp(26px,3vw,46px)] font-normal leading-[1.05] md:mt-5 ${step(2)}`}>
                {t.name}
              </h2>
              <p className={`mt-[.7em] text-[clamp(13px,1.02vw,16px)] leading-normal tracking-[0.02em] text-oro-gold ${step(2)}`}>
                {t.kicker}
              </p>
              <p className={`mt-4 max-w-[46ch] text-[clamp(13.5px,1.02vw,16px)] leading-[1.7] text-oro-sand/60 md:mt-5 ${step(3)}`}>
                {t.body}
              </p>
              <dl className={`mt-6 grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-4 border-t border-oro-sand/[.14] pt-5 md:mt-8 md:gap-x-10 md:pt-6 ${step(4)}`}>
                {t.specs.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-[7px]">
                    <dt className="text-[9px] uppercase tracking-[0.28em] text-oro-sand/40">{k}</dt>
                    <dd className="font-display text-[clamp(14px,1.25vw,19px)]">{v}</dd>
                  </div>
                ))}
              </dl>
              <span
                className={`mt-5 inline-flex items-center gap-[11px] whitespace-nowrap rounded-full border border-oro-sand/[.24] bg-oro-ink/50 py-2.5 pl-[15px] pr-[19px] text-[11px] tracking-[0.05em] text-oro-sand md:mt-7 ${step(4)}`}
              >
                <i
                  className={`block h-[5px] w-[5px] rounded-full ${
                    t.soldOut ? "bg-oro-sand/35" : "animate-[oro-pip_2.6s_ease-in-out_infinite] bg-oro-gold"
                  }`}
                />
                {t.status}
              </span>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------------- comparison ---------------- */}
      <Reveal as="section" className="border-t border-oro-sand/[.14] px-5 py-16 md:px-12 md:py-[10vh]">
        <div className={step(0)}>
          <Eyebrow>Side by side</Eyebrow>
        </div>
        <h3 className={`mt-4 font-display text-[clamp(22px,2.4vw,38px)] font-normal md:mt-5 ${step(1)}`}>
          The whole collection, in one view.
        </h3>
        <div className={`mt-7 overflow-x-auto md:mt-11 ${step(2)}`}>
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr>
                {["Residence", "Interior", "Outdoor", "Bedrooms", "Aspect", "Built", "Available"].map((h) => (
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
              {TABLE.map(([name, interior, outdoor, beds, aspect, built, avail, open]) => (
                <tr key={name} className="transition-colors duration-300 hover:bg-oro-sand/[.035]">
                  <th
                    scope="row"
                    className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-left font-display text-[clamp(14px,1.2vw,18px)] font-normal md:px-5 md:py-5"
                  >
                    {name}
                  </th>
                  {[interior, outdoor, beds, aspect, built].map((cell, ci) => (
                    <td
                      key={ci}
                      className="whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-[clamp(13px,1vw,15.5px)] text-oro-sand/60 md:px-5 md:py-5"
                    >
                      {cell}
                    </td>
                  ))}
                  <td
                    className={`whitespace-nowrap border-b border-oro-sand/[.14] px-3 py-4 text-[clamp(13px,1vw,15.5px)] md:px-5 md:py-5 ${
                      open ? "text-oro-gold" : "text-oro-sand/60"
                    }`}
                  >
                    {avail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* ---------------- closing ---------------- */}
      <Reveal as="section" className="relative flex min-h-[min(72vh,700px)] items-end overflow-hidden">
        <img src="/collection/valley.jpg" alt="ORO residences along the valley floor" className="absolute inset-0 h-full w-full object-cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(to top, rgba(7,5,3,.92) 0%, rgba(7,5,3,.78) 12%, rgba(7,5,3,.58) 26%, rgba(7,5,3,.38) 40%, rgba(7,5,3,.2) 56%, rgba(7,5,3,.07) 74%, rgba(7,5,3,0) 100%)",
              "linear-gradient(to right, rgba(7,5,3,.5) 0%, rgba(7,5,3,.28) 34%, rgba(7,5,3,0) 72%)",
            ].join(", "),
          }}
        />
        <div className="relative z-[2] flex w-full flex-wrap items-end justify-between gap-6 px-5 pb-14 md:gap-[clamp(24px,5vw,90px)] md:px-12 md:pb-[8vh]">
          <div>
            <div className={step(0)}>
              <Eyebrow>Reserve</Eyebrow>
            </div>
            <h2 className={`mt-4 max-w-[18ch] font-display text-[clamp(26px,3.4vw,52px)] font-normal leading-[1.08] md:mt-6 ${step(1)}`}>
              Six residences are still unspoken for.
            </h2>
            <p className={`mt-[1.15em] max-w-[42ch] text-[clamp(15px,1.15vw,19px)] leading-[1.6] text-oro-sand/[.78] ${step(2)}`}>
              Reservations open with a private consultation on Earth. Transfer windows are limited to one
              every twenty-six months.
            </p>
          </div>
          <a
            href="mailto:residences@oro.mars?subject=ORO%20—%20The%20Collection"
            style={{
              background: "linear-gradient(180deg, rgba(150,72,42,.62) 0%, rgba(96,44,26,.5) 100%)",
              boxShadow: "0 12px 38px hsl(var(--oro-ink)/.45), inset 0 1px 0 hsl(var(--oro-sand)/.2)",
            }}
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-oro-gold/[.46] px-[34px] py-[17px] text-[11px] uppercase tracking-[0.24em] text-oro-sand transition-all duration-300 hover:-translate-y-0.5 hover:border-oro-gold/80 ${step(3)}`}
          >
            Find Your Residence
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

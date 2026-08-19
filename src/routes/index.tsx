import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode, type FormEvent } from "react";
import {
  ArrowUpRight, Mail, Github, Linkedin, Twitter, Menu, X,
  Layout, Smartphone, Server, Cloud, Gauge, Code2, Loader2,
  Zap, ShieldCheck, Sparkles, Layers, CheckCircle2,
} from "lucide-react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/contact.functions";

const CONTACT_EMAIL = "hello@mubasher.dev";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().min(10, "Tell me a bit more").max(1500, "Message is too long"),
});
type ContactValues = z.infer<typeof contactSchema>;

const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const revealItem: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function RevealHeading({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <motion.h2
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`font-display uppercase leading-none ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span variants={revealItem} className="inline-block">
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ContactForm() {
  const [values, setValues] = useState<ContactValues>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitContact);

  const update = (k: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({ data: parsed.data });
      toast.success("Message received — I'll reply within 24 hours.");
      setValues({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldBase =
    "w-full bg-transparent border-b border-border py-3 text-base placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors";
  const errorBase = "mt-1.5 text-xs text-destructive";

  return (
    <form onSubmit={onSubmit} noValidate className="text-left grid gap-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cf-name" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Your name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-err" : undefined}
            className={fieldBase}
            placeholder="Ada Lovelace"
          />
          {errors.name && <p id="cf-name-err" className={errorBase}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-err" : undefined}
            className={fieldBase}
            placeholder="you@company.com"
          />
          {errors.email && <p id="cf-email-err" className={errorBase}>{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Project details
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={update("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
          className={`${fieldBase} resize-none`}
          placeholder="Web app, mobile app, or both? Share scope, stack, and timeline…"
          maxLength={1500}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.message ? (
            <p id="cf-message-err" className={errorBase}>{errors.message}</p>
          ) : (
            <span className="text-[11px] text-muted-foreground">Usually replies within 24h.</span>
          )}
          <span className="text-[11px] text-muted-foreground">{values.message.length}/1500</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-3 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send message <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
        <span className="text-xs text-muted-foreground">
          Or email <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CONTACT_EMAIL}</a>
        </span>
      </div>
    </form>
  );
}

function RotatingWord({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  const word = words[idx];
  const widest = words.reduce((a, b) => (a.length >= b.length ? a : b));
  return (
    <span className="relative inline-block align-baseline overflow-hidden text-foreground">
      <span aria-hidden className="invisible whitespace-nowrap">{widest}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ y: "100%", opacity: 0, rotate: 6 }}
          animate={{ y: "0%", opacity: 1, rotate: 0 }}
          exit={{ y: "-100%", opacity: 0, rotate: -6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Muhammad Mubasher — Web & Mobile App Developer" },
      {
        name: "description",
        content:
          "Portfolio of Muhammad Mubasher — frontend, web app, and mobile app developer building with React, Next.js, React Native, Flutter, and Node.",
      },
      { property: "og:title", content: "Muhammad Mubasher — Web & Mobile App Developer" },
      {
        property: "og:description",
        content:
          "Frontend, full-stack web, and cross-platform mobile development. React, Next.js, React Native, Flutter, Node, and cloud deployment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Muhammad Mubasher",
          jobTitle: "Web & Mobile App Developer",
          knowsAbout: [
            "Frontend Development",
            "React",
            "Next.js",
            "TypeScript",
            "React Native",
            "Flutter",
            "Node.js",
            "PostgreSQL",
            "DevOps",
          ],
          email: `mailto:${CONTACT_EMAIL}`,
        }),
      },
    ],
  }),
});

interface ProjectItem {
  title: string;
  tag: string;
  year: string;
  color: string;
  image?: string;
  link?: string;
  apk?: string;
  github?: string;
  description?: string;
}

const projects: ProjectItem[] = [
  {
    title: "Snap Bite - AI Calorie Tracker App",
    tag: "React Native · AI Nutrition",
    year: "2025",
    color: "oklch(0.62 0.22 145)",
    image: "", // Add screenshot URL or path here
    link: "https://appuiscreen.netlify.app/",
    apk: "#", // Placeholder APK download link
    github: "https://github.com/mubasherdevv",
    description:
      "AI food scanner & calorie tracker with modern glassmorphic UI, dynamic macro rings, passwordless Supabase auth, and offline caching.",
  },
  {
    title: "Nimbus Dashboard",
    tag: "Next.js · SaaS Web App",
    year: "2025",
    color: "oklch(0.62 0.22 25)",
    image: "",
    link: "https://github.com/mubasherdevv",
    github: "https://github.com/mubasherdevv",
    description: "Cloud management and analytics dashboard for high-growth tech teams.",
  },
  {
    title: "PayWave",
    tag: "React Native · Fintech App",
    year: "2025",
    color: "oklch(0.75 0.15 85)",
    image: "",
    link: "https://github.com/mubasherdevv",
    github: "https://github.com/mubasherdevv",
    description: "Cross-platform mobile payment wallet with biometric security.",
  },
  {
    title: "Kart Studio",
    tag: "Frontend · E-commerce",
    year: "2024",
    color: "oklch(0.55 0.15 150)",
    image: "",
    link: "https://github.com/mubasherdevv",
    github: "https://github.com/mubasherdevv",
    description: "Modern headless luxury e-commerce experience with sub-second page loads.",
  },
  {
    title: "RouteOne",
    tag: "Flutter · Delivery App",
    year: "2024",
    color: "oklch(0.4 0.05 260)",
    image: "",
    link: "https://github.com/mubasherdevv",
    github: "https://github.com/mubasherdevv",
    description: "Real-time dispatch and driver routing application.",
  },
  {
    title: "Pulse API",
    tag: "Node · Realtime Backend",
    year: "2023",
    color: "oklch(0.5 0.18 300)",
    image: "",
    link: "https://github.com/mubasherdevv",
    github: "https://github.com/mubasherdevv",
    description: "High-throughput streaming API serving 50k+ websocket connections.",
  },
];

const testimonials = [
  { name: "Chris Pregler", role: "Founder, Studio North", quote: "Shipped our web app and iOS build in one sprint cycle. Clean code, zero hand-holding needed." },
  { name: "Aisha Rahman", role: "Product Manager, Lumen", quote: "Turned messy Figma files into a pixel-perfect, fully responsive frontend faster than our internal team could scope it." },
  { name: "Murtaza Memon", role: "Agency Owner, Fromus", quote: "Our go-to developer for React Native. Crash-free rate went up and release cycles got shorter." },
];

const stackChips = ["React", "Next.js", "TypeScript", "React Native", "Flutter", "Node.js", "PostgreSQL", "Tailwind"];

const skillGroups = [
  { title: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML / CSS", "Framer Motion"], level: 95 },
  { title: "Mobile", items: ["React Native", "Flutter", "Expo", "Push & Deep Links", "App Store / Play release"], level: 90 },
  { title: "Backend", items: ["Node.js", "REST & GraphQL", "PostgreSQL", "Supabase", "Auth & Payments"], level: 88 },
  { title: "DevOps", items: ["Docker", "CI/CD", "AWS / Vercel", "Monitoring", "Performance budgets"], level: 80 },
];

const caseStudies = [
  {
    client: "Nimbus Dashboard",
    industry: "B2B SaaS · Web App",
    duration: "5 months",
    challenge:
      "Legacy jQuery admin panel took 6+ seconds to load, broke on mobile, and blocked the team from shipping new modules.",
    approach:
      "Rebuilt in Next.js + TypeScript with a design system, server-side rendering, role-based auth, and a typed API layer on Node and PostgreSQL.",
    metrics: [
      { k: "0.9s", v: "Largest paint" },
      { k: "98", v: "Lighthouse score" },
      { k: "3x", v: "Faster releases" },
    ],
    quote: "Our dashboard finally feels like a product, not an internal tool.",
    color: "oklch(0.62 0.22 25)",
  },
  {
    client: "PayWave Mobile",
    industry: "Fintech · iOS & Android",
    duration: "7 months",
    challenge:
      "Two separate native codebases drifting apart, slow release cadence, and a crash rate that was hurting store ratings.",
    approach:
      "Single React Native codebase with shared business logic, biometric auth, offline-first sync, and automated CI/CD builds to both stores.",
    metrics: [
      { k: "99.7%", v: "Crash-free users" },
      { k: "4.8★", v: "Store rating" },
      { k: "-45%", v: "Dev cost" },
    ],
    quote: "One team, one codebase, two stores. Releases went from monthly to weekly.",
    color: "oklch(0.75 0.15 85)",
  },
];

function HorizontalWork() {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const calculateDistance = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Scroll exactly until the last item is in full view plus padding
        const diff = totalWidth - viewportWidth + 32;
        setScrollDistance(Math.max(0, diff));
      }
    };

    calculateDistance();
    window.addEventListener("resize", calculateDistance);
    return () => window.removeEventListener("resize", calculateDistance);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  return (
    <section
      id="work"
      ref={targetRef}
      className="relative"
      style={{ height: `${Math.max(250, projects.length * 70)}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col justify-between overflow-hidden py-16">
        <div className="px-6 mx-auto max-w-[1400px] w-full flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">— Selected Work</div>
            <RevealHeading lines={["Recent", "projects."]} className="text-4xl md:text-6xl" />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>Scroll to explore</span>
            <span className="text-primary font-bold">→</span>
          </div>
        </div>

        <div className="my-auto w-full overflow-hidden">
          <motion.div
            ref={containerRef}
            style={{ x }}
            className="flex gap-8 pl-6 sm:pl-12 pr-12 w-max will-change-transform"
          >
            {projects.map((p) => {
              const isExternal = Boolean(p.link && p.link.startsWith("http"));
              const href = p.link || "#contact";

              return (
                <div
                  key={p.title}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-border/80 bg-card/90 backdrop-blur-sm shrink-0 w-[82vw] sm:w-[65vw] md:w-[50vw] lg:w-[42vw] max-w-[650px] shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  <a
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="block aspect-[16/10] relative overflow-hidden bg-muted"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full relative overflow-hidden flex items-center justify-center p-6"
                        style={{ background: p.color }}
                      >
                        <div
                          className="absolute inset-0 opacity-25 mix-blend-overlay"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 65%)",
                          }}
                        />
                        <span className="font-display text-white text-3xl md:text-5xl uppercase text-center tracking-tight drop-shadow-md">
                          {p.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-[11px] font-medium uppercase tracking-widest text-foreground">
                      {p.year}
                    </div>

                    <div className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </a>

                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-lg md:text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          {p.tag}
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <span>Live Preview</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.apk && (
                        <a
                          href={p.apk}
                          target={p.apk !== "#" ? "_blank" : undefined}
                          rel={p.apk !== "#" ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Get APK</span>
                        </a>
                      )}
                      {p.github && (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {!p.link && !p.github && !p.apk && (
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <span>Inquire Case Study</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="px-6 mx-auto max-w-[1400px] w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>{projects.length} Featured Works</span>
          <a href="#contact" className="hover:text-foreground transition-colors">Have a project in mind? Let's talk →</a>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#work", label: "Work" },
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
    { href: "#skills", label: "Skills" },
    { href: "#why-me", label: "Why Me" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:text-sm">
        Skip to content
      </a>

      {/* NAV */}
      <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-50">
        <nav
          aria-label="Primary"
          className="mx-auto max-w-7xl grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-border/60 bg-background/80 backdrop-blur-xl"
        >
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Muhammad Mubasher — home"
          >
            <span aria-hidden="true" className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-foreground text-background font-display text-xs">M</span>
            <span className="font-display tracking-tight text-sm truncate">MUBASHER</span>
          </a>

          <div className="hidden lg:flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-self-end col-start-3 lg:col-start-auto">
            <a
              href="#contact"
              className="group hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background text-xs font-medium pl-4 pr-1 py-1 h-9 relative overflow-hidden hover:pl-5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="tracking-wide">Let's talk</span>
              <span
                aria-hidden="true"
                className="ml-1 grid place-items-center h-7 w-7 rounded-full bg-accent text-accent-foreground shrink-0 transition-transform duration-500 group-hover:rotate-45"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden grid place-items-center h-11 w-11 rounded-full border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mx-auto max-w-7xl mt-2 rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl p-4"
            >
              <ul className="flex flex-col">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 px-2 text-base font-medium text-foreground rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                <li className="mt-2">
                  <a
                    href="#contact"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-3 min-h-11 text-sm font-medium"
                  >
                    Let's talk <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main">
        {/* HERO */}
        <section id="top" ref={heroRef} className="relative pt-28 sm:pt-32 pb-20 sm:pb-24 px-5 sm:px-6 overflow-hidden isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 55% at 20% 15%, color-mix(in oklab, var(--accent) 28%, transparent) 0%, transparent 70%), radial-gradient(55% 50% at 85% 30%, color-mix(in oklab, var(--accent) 22%, transparent) 0%, transparent 70%), radial-gradient(70% 60% at 50% 100%, color-mix(in oklab, var(--accent) 24%, transparent) 0%, transparent 75%)",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 -z-10 w-[520px] h-[520px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent) 0%, transparent 65%)" }}
            animate={{ x: [0, 60, -20, 0], y: [0, 40, 20, 0], scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-24 -z-10 w-[560px] h-[560px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 38%, transparent) 0%, transparent 65%)" }}
            animate={{ x: [0, -50, 30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.92, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />

          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-center justify-center gap-3 mb-12 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span>muhammad mubasher</span>
              <span className="w-8 h-px bg-muted-foreground/40" />
              <span>web &amp; mobile developer</span>
            </div>

            <motion.h1
              style={{ y }}
              className="font-display uppercase leading-[0.85] tracking-tight text-center"
            >
              {["I Build", "__ROTATE__ Products"].map((line, i) => (
                <motion.span
                  key={line}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.035, delayChildren: i * 0.25 } },
                  }}
                  className="block text-[clamp(1.75rem,9vw,7rem)] overflow-hidden"
                >
                  {line.split(" ").map((w, j) => {
                    if (w === "__ROTATE__") {
                      return (
                        <span key={j} className="inline-block mr-[0.25em] align-baseline">
                          <RotatingWord words={["Web", "Mobile", "Full-Stack"]} />
                        </span>
                      );
                    }
                    const highlight = i === 0 && j === 1;
                    return (
                      <span key={j} className="inline-block mr-[0.25em]">
                        {w.split("").map((ch, k) => (
                          <motion.span
                            key={k}
                            variants={{
                              hidden: { y: "110%", opacity: 0, rotate: 6 },
                              visible: { y: "0%", opacity: 1, rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
                            }}
                            className={`inline-block ${highlight ? "text-foreground" : "text-muted-foreground/70"}`}
                          >
                            {ch}
                          </motion.span>
                        ))}
                      </span>
                    );
                  })}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="mt-10 text-center max-w-xl mx-auto text-muted-foreground"
            >
              Frontend, full-stack web apps, and cross-platform mobile apps —
              React, Next.js, React Native, Flutter, and Node, shipped end to end.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                View work <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:border-foreground transition-colors"
              >
                Hire me
              </a>
            </motion.div>

            <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-wrap justify-center gap-2">
                {stackChips.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-full border border-border bg-card px-4 py-1.5 text-xs">{s}</span>
                ))}
              </div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                Available for new projects
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {stackChips.slice(4).map((s) => (
                  <span key={s} className="rounded-full border border-border bg-card px-4 py-1.5 text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* MARQUEE */}
        <div className="border-y border-border overflow-hidden py-6 bg-foreground text-background">
          <motion.div
            className="flex gap-12 whitespace-nowrap font-display text-3xl md:text-5xl uppercase"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-12">
                React <span className="text-accent">✦</span> Next.js <span className="text-accent">✦</span> React Native
                <span className="text-accent">✦</span> Flutter <span className="text-accent">✦</span> Node
                <span className="text-accent">✦</span> TypeScript <span className="text-accent">✦</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* SELECTED WORK - Horizontal Scroll */}
        <HorizontalWork />

        {/* ABOUT + STATS */}
        <section id="about" className="px-6 py-32 bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <div className="text-xs uppercase tracking-[0.3em] text-background/60 mb-4">— About</div>
              <RevealHeading lines={["Developer,", "end to end."]} className="text-5xl md:text-6xl" />
            </div>
            <div className="md:col-span-8 space-y-8">
              <Reveal delay={0.15}>
                <p className="text-2xl md:text-3xl leading-tight font-light">
                  I design and build interfaces, ship production web apps, and release
                  <span className="text-accent"> cross-platform mobile apps</span> — from the first component
                  to the App Store listing and the CI pipeline behind it.
                </p>
              </Reveal>
              <motion.div
                variants={revealContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-background/20"
              >
                {[
                  { k: "2.5+", v: "Years experience" },
                  { k: "10+", v: "Projects delivered" },
                  { k: "5", v: "Apps on stores" },
                  { k: "90+", v: "Avg Lighthouse score" },
                ].map((s) => (
                  <motion.div key={s.v} variants={revealItem}>
                    <div className="font-display text-4xl md:text-5xl">{s.k}</div>
                    <div className="text-xs uppercase tracking-widest text-background/60 mt-2">{s.v}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="px-6 py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">— Services</div>
                <RevealHeading lines={["What I", "actually do."]} className="text-5xl md:text-7xl" />
              </div>
              <Reveal delay={0.2}>
                <p className="max-w-sm text-muted-foreground">
                  Six focused offerings across frontend, web, mobile, and the infrastructure
                  that keeps them running.
                </p>
              </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
              {[
                { icon: Layout, title: "Frontend Development", desc: "Pixel-accurate, responsive, accessible interfaces from Figma — React, Next.js, Tailwind." },
                { icon: Code2, title: "Web App Development", desc: "Full-stack products: dashboards, portals, SaaS — auth, payments, and realtime built in." },
                { icon: Smartphone, title: "Mobile App Development", desc: "Cross-platform iOS & Android apps with React Native or Flutter, shipped to both stores." },
                { icon: Server, title: "Backend & APIs", desc: "Node services, REST/GraphQL APIs, PostgreSQL schemas, and secure auth flows." },
                { icon: Cloud, title: "DevOps & Deployment", desc: "Docker, CI/CD pipelines, AWS/Vercel deploys, monitoring, and zero-downtime releases." },
                { icon: Gauge, title: "Performance & Maintenance", desc: "Core Web Vitals tuning, bundle diets, bug fixing, and long-term ongoing support." },
              ].map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="group bg-background p-8 md:p-10 hover:bg-accent/10 transition-colors"
                >
                  <s.icon className="w-7 h-7 text-accent mb-8" aria-hidden="true" />
                  <h3 className="font-display uppercase text-2xl md:text-3xl mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                    0{i + 1} <span className="w-8 h-px bg-current" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="px-6 py-32 bg-foreground text-background">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid md:grid-cols-12 gap-12 mb-20">
              <div className="md:col-span-5">
                <div className="text-xs uppercase tracking-[0.3em] text-background/60 mb-4">— Process</div>
                <RevealHeading lines={["How the", "work moves."]} className="text-5xl md:text-7xl" />
              </div>
              <div className="md:col-span-7 flex items-end">
                <Reveal delay={0.15}>
                  <p className="text-xl md:text-2xl font-light leading-snug text-background/70">
                    A four-step build cycle — clear scope, weekly demos, and a launch that
                    doesn't end when the code ships.
                  </p>
                </Reveal>
              </div>
            </div>

            <ol className="relative border-l border-background/20 ml-3 space-y-14">
              {[
                { k: "01", title: "Discovery & Scope", desc: "Goals, users, and constraints mapped into a concrete feature list, timeline, and fixed quote." },
                { k: "02", title: "Design & Architecture", desc: "UI system, data model, and API contracts agreed before a single production line is written." },
                { k: "03", title: "Build & Iterate", desc: "Weekly builds you can click — web preview links and TestFlight/APK drops every sprint." },
                { k: "04", title: "Launch & Support", desc: "Store submission, CI/CD, monitoring, and a support window for fixes and improvements." },
              ].map((step, i) => (
                <motion.li
                  key={step.k}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="pl-8 md:pl-12 relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-accent ring-4 ring-foreground"
                  />
                  <div className="grid md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-2 font-display text-3xl md:text-4xl text-background/50">
                      {step.k}
                    </div>
                    <div className="md:col-span-10">
                      <h3 className="font-display uppercase text-2xl md:text-4xl mb-3">{step.title}</h3>
                      <p className="text-base md:text-lg text-background/70 max-w-2xl leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="px-6 py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid md:grid-cols-12 gap-12 mb-16">
              <div className="md:col-span-5">
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">— Stack</div>
                <RevealHeading lines={["Tools I", "work with."]} className="text-5xl md:text-7xl" />
              </div>
              <div className="md:col-span-7 flex items-end">
                <Reveal delay={0.15}>
                  <p className="text-xl md:text-2xl font-light leading-snug text-muted-foreground">
                    One stack across web and mobile — so the same product logic ships to a browser,
                    an iPhone, and an Android device without three separate teams.
                  </p>
                </Reveal>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillGroups.map((g, i) => (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="rounded-2xl border border-border bg-muted/40 p-7"
                >
                  <h3 className="font-display uppercase text-2xl mb-5">{g.title}</h3>
                  <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${g.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-accent"
                    />
                  </div>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    {g.items.map((it) => (
                      <li key={it} className="flex items-start gap-3">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY WORK WITH ME / VALUE PROPOSITION */}
        <section id="why-me" className="px-6 py-32 bg-foreground text-background relative overflow-hidden isolate">
          {/* Ambient Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-40 -z-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-40 -z-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />

          <div className="mx-auto max-w-[1400px]">
            <div className="grid md:grid-cols-12 gap-12 mb-20">
              <div className="md:col-span-5">
                <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">— Why Work With Me</div>
                <RevealHeading lines={["The Full-Stack", "Advantage."]} className="text-5xl md:text-7xl" />
              </div>
              <div className="md:col-span-7 flex items-end">
                <Reveal delay={0.15}>
                  <p className="text-xl md:text-2xl font-light leading-snug text-background/75 max-w-2xl">
                    Skip agency overhead and fragmented teams. You get direct access to a dedicated developer who builds, polishes, and ships production web and mobile apps end-to-end.
                  </p>
                </Reveal>
              </div>
            </div>

            {/* 4 Feature Pillars */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Smartphone,
                  tag: "Cross-Platform Efficiency",
                  title: "1 Codebase · Both App Stores",
                  desc: "Using React Native & Expo, I build unified iOS and Android applications from a single codebase — saving up to 50% in development costs while delivering 60fps native performance.",
                  bullets: ["iOS App Store & Google Play submission", "Offline-first sync & Biometric Auth", "NativeWind + Glassmorphism UI"],
                  highlight: "2x Faster Release · 50% Cost Saved",
                },
                {
                  icon: Zap,
                  tag: "Direct Collaboration",
                  title: "Zero Agency Bloat & Fast Sprints",
                  desc: "No middlemen, non-technical project managers, or endless email chains. You talk directly with the engineer writing your code, allowing feature turnarounds in days, not months.",
                  bullets: ["Weekly clickable web & APK demos", "Async Slack/Discord communication", "Clear milestones & fixed transparent pricing"],
                  highlight: "100% Direct Developer Sync",
                },
                {
                  icon: Sparkles,
                  tag: "Design Obsessed",
                  title: "Figma to Pixel-Perfect Reality",
                  desc: "I don't just write code; I care deeply about the user experience. Every micro-animation, responsive layout, fluid transition, and touch gesture is tuned to feel delightfully smooth.",
                  bullets: ["Fluid Framer Motion animations", "Fully responsive across all screen sizes", "Modern Tailwind & dynamic dark modes"],
                  highlight: "100% Pixel Accuracy Guarantee",
                },
                {
                  icon: ShieldCheck,
                  tag: "Battle-Tested Reliability",
                  title: "Production-Grade Architecture",
                  desc: "Your app is built to scale from day one with strict TypeScript typing, robust Supabase/PostgreSQL backends, TanStack Query caching, and automated deployment pipelines.",
                  bullets: ["Strict TypeScript & zero-runtime bugs", "99.9% crash-free mobile releases", "95+ Lighthouse Web Vitals scores"],
                  highlight: "Enterprise Speed & Zero Downtime",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group relative rounded-3xl border border-background/15 bg-background/5 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between hover:bg-background/10 hover:border-accent/40 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 text-accent grid place-items-center">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-background/10 text-background/70 border border-background/10">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="font-display uppercase text-2xl md:text-3xl mb-3 tracking-tight group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-background/70 leading-relaxed mb-6 font-light">
                      {item.desc}
                    </p>

                    <ul className="space-y-2.5 mb-8">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-xs sm:text-sm text-background/85">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 border-t border-background/15 flex items-center justify-between text-xs">
                    <span className="text-accent font-medium uppercase tracking-wider">
                      {item.highlight}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-background/40 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Call to Action strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 p-8 md:p-10 rounded-3xl border border-accent/30 bg-gradient-to-r from-accent/15 via-background/10 to-accent/15 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <h4 className="font-display uppercase text-2xl md:text-3xl tracking-tight mb-2">
                  Have an app idea or web project in mind?
                </h4>
                <p className="text-sm text-background/70 max-w-xl">
                  Let's scope your MVP or full-scale app with a clear timeline and realistic milestones.
                </p>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3.5 text-sm font-semibold hover:opacity-90 transition-all shrink-0 shadow-lg"
              >
                <span>Let's Build It</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="px-6 py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">— Kind words</div>
            <RevealHeading lines={["People I've", "built with."]} className="text-5xl md:text-7xl mb-16" />

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8 flex flex-col justify-between min-h-[280px]"
                >
                  <blockquote className="text-lg leading-snug">"{t.quote}"</blockquote>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center font-display text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="px-6 py-32 relative overflow-hidden">
          <div className="mx-auto max-w-[1400px]">
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">— Get in touch</div>
              <RevealHeading
                lines={["Let's build", "something real."]}
                className="text-[clamp(2.75rem,10vw,9rem)]"
              />
            </div>

            <div className="mt-20 grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-10">
                <Reveal>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                    Tell me what you're building — a web app, a mobile app, or a frontend that
                    needs rescuing. I read every message personally.
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="space-y-4">
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-foreground transition-colors"
                    >
                      <span className="grid place-items-center h-11 w-11 rounded-full bg-foreground text-background shrink-0">
                        <Mail className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
                        <span className="block text-sm font-medium">{CONTACT_EMAIL}</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                    </a>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Availability</div>
                        <div className="text-sm font-medium mt-1">Open for projects</div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Response time</div>
                        <div className="text-sm font-medium mt-1">Within 24 hours</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a href="#" aria-label="Twitter" className="grid place-items-center h-11 w-11 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><Twitter className="w-5 h-5" aria-hidden="true" /></a>
                      <a href="#" aria-label="LinkedIn" className="grid place-items-center h-11 w-11 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><Linkedin className="w-5 h-5" aria-hidden="true" /></a>
                      <a href="#" aria-label="GitHub" className="grid place-items-center h-11 w-11 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><Github className="w-5 h-5" aria-hidden="true" /></a>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-7">
                <Reveal delay={0.15}>
                  <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
                    <ContactForm />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
        <Toaster position="top-center" richColors closeButton />
      </main>

      {/* FOOTER */}
      <footer className="px-5 sm:px-6 py-10 border-t border-border">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center md:text-left">
          <div>© {new Date().getFullYear()} Muhammad Mubasher. All rights reserved.</div>
          <div className="font-display uppercase tracking-widest">Built with intent.</div>
        </div>
      </footer>
    </div>
  );
}

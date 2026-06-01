'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Playfair_Display, Montserrat } from 'next/font/google';
import { Shield, Sparkles, MapPin, Calendar, Users, Languages, Check, ArrowRight, X, Cpu, Palette, Search, HelpCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Load premium fonts locally
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Translations dictionary
const translations = {
  es: {
    heroTagline: "PASO FINO · TERAPIA · HERENCIA",
    heroTitle: "BONANZA EQUESTRIAN CENTER",
    heroSubtitle: "Hogar de campeones de Paso Fino, terapias ecuestres que cambian vidas y el pupilaje más exclusivo de Miami.",
    scheduleTour: "Agendar Visita Privada",
    viewPillars: "Explorar Pilares",
    location: "Kendall Horse Country · Miami, FL",
    pillarsTitle: "NUESTROS PILARES",
    pillarsSubtitle: "Excelencia y cuidado en cada disciplina, en el corazón del distrito ecuestre de Miami.",
    boardTitle: "Pupilaje Premium",
    boardDesc: "Espaciosas pesebreras, alimentación personalizada con marcas certificadas, cámaras de seguridad 24/7 y cuidado experto continuo.",
    therapyTitle: "Terapia Asistida",
    therapyDesc: "Programas especializados de terapia ocupacional y equinoterapia dirigidos por profesionales certificados para niños y adultos.",
    pasoTitle: "Paso Fino Élite",
    pasoDesc: "Entrenamiento, mentoría y preparación competitiva en el andar natural del caballo de Paso Fino.",
    lessonsTitle: "Clases de Equitación",
    lessonsDesc: "Instrucción profesional para todos los niveles, desde principiantes entusiastas hasta jinetes competitivos.",
    featuresTitle: "Instalaciones de Primer Nivel",
    feature1: "Pistas profesionales con drenaje y arena especial",
    feature2: "Vigilancia de seguridad CCTV las 24 horas",
    feature3: "Veterinarios y herreros de guardia",
    feature4: "Pesebreras de lujo acolchadas y ventiladas",
    ctaHeader: "¿Listo para experimentar Bonanza?",
    ctaSub: "Envía una solicitud para reservar un evento privado o programar una consulta de pupilaje.",
    submitOffer: "Enviar Solicitud de Reserva",
    nameLabel: "Nombre Completo",
    emailLabel: "Correo Electrónico",
    serviceSelect: "Servicio de Interés",
    msgLabel: "Cuéntanos sobre tu caballo o evento",
    successMsg: "¡Solicitud recibida! Nick se comunicará para coordinar los detalles con el rancho.",
  },
  en: {
    heroTagline: "PASO FINO · THERAPY · HERITAGE",
    heroTitle: "BONANZA EQUESTRIAN CENTER",
    heroSubtitle: "Home of Paso Fino champions, life-changing equine therapy, and the most exclusive boarding stables in Miami.",
    scheduleTour: "Schedule Private Tour",
    viewPillars: "Explore Pillars",
    location: "Kendall Horse Country · Miami, FL",
    pillarsTitle: "OUR CORE PILLARS",
    pillarsSubtitle: "Excellence and dedicated care across every discipline, situated in Miami's historic Horse Country.",
    boardTitle: "Premium Stables",
    boardDesc: "Oversized matted stalls, premium certified feed programs, 24/7 CCTV surveillance, and dedicated on-site professional caretakers.",
    therapyTitle: "Equine Therapy",
    therapyDesc: "Specialized, medically supportive occupational therapy and equine-assisted programs led by certified therapists.",
    pasoTitle: "Elite Paso Fino",
    pasoDesc: "World-class training, coaching, and prep in the unique natural gait and rich heritage of the Paso Fino.",
    lessonsTitle: "Riding Lessons",
    lessonsDesc: "Professional English and Western instruction tailored for all ages, from beginners to competitive show riders.",
    featuresTitle: "World-Class Amenities",
    feature1: "Dust-free arena surfaces with advanced drainage",
    feature2: "24/7 security watch and active stable cameras",
    feature3: "On-call specialized equine veterinarians",
    feature4: "Luxury ventilated stalls with automated watering",
    ctaHeader: "Ready to Experience Bonanza?",
    ctaSub: "Submit an inquiry to book a private event or join our premium boarding waiting list.",
    submitOffer: "Submit Reservation Request",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    serviceSelect: "Service of Interest",
    msgLabel: "Tell us about your horse or event details",
    successMsg: "Inquiry successfully sent! Nick will follow up shortly to coordinate details with the ranch.",
  }
};

export default function BonanzaPitchPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [activePillar, setActivePillar] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', service: 'boarding', message: '' });

  // Pomelli AI DNA States
  const [pomelliUrl, setPomelliUrl] = useState('bonanzaequestriancenter.com');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [showDnaResults, setShowDnaResults] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    if (heroRef.current && bgRef.current && textRef.current && cardRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          pin: true,
          anticipatePin: 1,
        }
      });

      tl.to(bgRef.current, {
        scale: 1.15,
        opacity: 0.4,
        ease: 'none'
      }, 0);

      tl.to(textRef.current, {
        scale: 1.6,
        opacity: 0,
        y: -100,
        ease: 'power1.inOut'
      }, 0);

      tl.fromTo(cardRef.current, 
        { opacity: 0, scale: 0.85, y: 100 },
        { opacity: 1, scale: 1, y: 0, ease: 'power1.out' },
        0.1
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: '', email: '', service: 'boarding', message: '' });
    }, 5000);
  };

  // Simulated Google Pomelli Brand DNA Extractor
  const handleExtractDna = () => {
    if (!pomelliUrl) return;
    setIsExtracting(true);
    setExtractionStep(1);
    
    // Step 1: Crawler
    setTimeout(() => {
      setExtractionStep(2);
    }, 1500);

    // Step 2: Gemini DNA Synthesis
    setTimeout(() => {
      setExtractionStep(3);
    }, 3000);

    // Step 3: Complete & Render UI Changes
    setTimeout(() => {
      setIsExtracting(false);
      setShowDnaResults(true);
      setExtractionStep(0);
    }, 4500);
  };

  return (
    <main className={`min-h-screen bg-[#F7F4EF] text-[#1D3324] selection:bg-[#D4A65A] selection:text-[#1D3324] overflow-x-hidden ${playfair.variable} ${montserrat.variable} font-sans`}>
      
      {/* 1. Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1D3324]/95 backdrop-blur-md border-b border-[#D4A65A]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#D4A65A] flex items-center justify-center bg-[#4A3728] shadow-[0_0_15px_rgba(212,166,90,0.15)]">
            <span className="text-[#D4A65A] font-serif text-sm font-bold">B</span>
          </div>
          <span className="font-serif font-bold text-lg tracking-widest text-[#F7F4EF] hidden sm:inline">
            BONANZA <span className="text-[#D4A65A] font-normal italic">Equestrian</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#4A3728] rounded-full p-1 border border-[#D4A65A]/30">
            <button 
              onClick={() => setLang('es')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'es' ? 'bg-[#D4A65A] text-[#1D3324]' : 'text-[#F7F4EF]/70 hover:text-[#F7F4EF]'}`}
            >
              ES
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'en' ? 'bg-[#D4A65A] text-[#1D3324]' : 'text-[#F7F4EF]/70 hover:text-[#F7F4EF]'}`}
            >
              EN
            </button>
          </div>

          <a 
            href="#booking-queue"
            className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A65A] to-[#E5BE7B] hover:brightness-110 active:scale-[0.98] text-[#1D3324] text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-lg border border-[#D4A65A] shadow-[0_4px_20px_rgba(212,166,90,0.25)] transition-all duration-300"
          >
            {t.scheduleTour}
            <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* 2. Parallax Entrance Section (GSAP) */}
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <div 
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80')`,
            backgroundColor: '#1C2920'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D3324]/85 via-[#1D3324]/70 to-[#F7F4EF]" />

        <div ref={textRef} className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
          <div className="flex items-center gap-2 text-[#D4A65A] text-xs tracking-[0.4em] uppercase font-bold mb-6">
            <Sparkles size={14} className="animate-pulse" />
            <span>{t.heroTagline}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-[#F7F4EF] tracking-tight leading-none mb-6">
            BONANZA
            <span className="block italic font-light text-[#D4A65A] mt-2 font-serif text-3xl sm:text-5xl md:text-6xl">
              Equestrian Center
            </span>
          </h1>
          <p className="text-[#F7F4EF]/85 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <a 
              href="#booking-queue" 
              className="w-full sm:w-auto bg-gradient-to-r from-[#D4A65A] to-[#E5BE7B] hover:brightness-110 active:scale-[0.98] text-[#1D3324] text-xs font-bold tracking-widest uppercase px-8 py-4.5 rounded-lg border border-[#D4A65A] shadow-[0_5px_25px_rgba(212,166,90,0.3)] transition-all duration-300 text-center"
            >
              {t.scheduleTour}
            </a>
            <a 
              href="#pillars" 
              className="w-full sm:w-auto bg-[#1D3324]/40 hover:bg-[#1D3324]/80 text-[#F7F4EF] hover:text-[#D4A65A] border border-[#F7F4EF]/25 hover:border-[#D4A65A] text-xs font-bold tracking-widest uppercase px-8 py-4.5 rounded-lg transition-all duration-300 text-center backdrop-blur-sm"
            >
              {t.viewPillars}
            </a>
          </div>
        </div>

        <div 
          ref={cardRef} 
          className="absolute z-20 max-w-xl mx-4 bg-[#1D3324]/90 border border-[#D4A65A]/30 backdrop-blur-xl p-8 rounded-2xl text-center text-[#F7F4EF] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          style={{ opacity: 0 }}
        >
          <h3 className="font-serif text-2xl font-bold text-[#D4A65A] tracking-wider mb-2">BONANZA EQUESTRIAN</h3>
          <p className="text-[#F7F4EF]/80 text-sm font-light leading-relaxed mb-6">
            {lang === 'es' 
              ? 'Te invitamos a sumergirte en el majestuoso mundo de los Paso Fino. Disfruta de instalaciones exclusivas, entrenadores dedicados y un cuidado sin precedentes.'
              : 'Immerse yourself in the majestic world of Paso Fino horses. Enjoy elite training facilities, certified therapy stables, and custom equestrian care.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#D4A65A] tracking-wider uppercase font-semibold">
            <MapPin size={14} />
            <span>{t.location}</span>
          </div>
        </div>
      </div>

      {/* 3. GOOGLE LABS POMELLI - BRAND DNA EXTRACTOR */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#F7F4EF] to-[#eae5dc] relative">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#1D3324] rounded-2xl border-2 border-[#D4A65A] p-8 sm:p-12 text-[#F7F4EF] shadow-[0_15px_40px_rgba(29,51,36,0.35)] relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#D4A65A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-[#D4A65A]/25 pb-8 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4A65A]/10 border border-[#D4A65A]/30 text-[#D4A65A] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                  <Cpu size={12} className="animate-spin-slow" />
                  <span>Google Labs Integration</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F7F4EF]">
                  POMELLI <span className="text-[#D4A65A] font-light italic">Brand DNA</span>
                </h2>
                <p className="text-[#F7F4EF]/70 text-xs sm:text-sm font-light mt-2 max-w-xl">
                  {lang === 'es' 
                    ? "Extrae al instante el DNA visual (colores, fuentes y estructura) de tu sitio web actual usando la inteligencia artificial de Google AI Studio / Gemini API."
                    : "Instantly extract visual DNA (colors, typography stacks, and layout gaps) from your live site using Google AI Studio / Gemini API models."}
                </p>
              </div>

              {/* Pomelli Visual Brand Pill */}
              <div className="flex items-center gap-2 bg-[#4A3728] border border-[#D4A65A]/30 rounded-xl px-4 py-3 shrink-0">
                <Palette size={20} className="text-[#D4A65A]" />
                <div className="text-left">
                  <span className="block text-[10px] text-[#D4A65A]/60 font-bold uppercase tracking-wider">AI Engine</span>
                  <span className="block text-xs font-mono font-bold text-[#F7F4EF]">Gemini 1.5 Pro</span>
                </div>
              </div>
            </div>

            {/* Input & Extractor Interactive Area */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-[#F7F4EF]/60 font-bold tracking-wider">
                    {lang === 'es' ? 'URL del Sitio Web Actual' : 'Target Live Site URL'}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={pomelliUrl}
                      onChange={(e) => setPomelliUrl(e.target.value)}
                      placeholder="e.g. bonanzaequestriancenter.com"
                      disabled={isExtracting}
                      className="w-full bg-[#16271B] border border-[#D4A65A]/30 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D4A65A] text-white placeholder-white/20 transition-all duration-300 font-mono"
                    />
                    <Search size={18} className="absolute left-4 top-4 text-[#D4A65A]/70" />
                  </div>
                </div>

                <button 
                  onClick={handleExtractDna}
                  disabled={isExtracting || !pomelliUrl}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#D4A65A] to-[#E5BE7B] hover:brightness-110 active:scale-[0.99] text-[#1D3324] font-bold text-xs tracking-widest uppercase p-5 rounded-xl border border-[#D4A65A] shadow-[0_5px_25px_rgba(212,166,90,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  <Cpu size={16} className={`${isExtracting ? 'animate-spin' : 'group-hover:rotate-12 transition-transform duration-300'}`} />
                  <span>{isExtracting ? (lang === 'es' ? 'Analizando con Gemini...' : 'Analyzing with Gemini...') : (lang === 'es' ? 'Extraer DNA del Sitio' : 'Extract Site DNA')}</span>
                </button>

                {isExtracting && (
                  <div className="space-y-3 bg-[#16271B] border border-white/5 p-5 rounded-xl animate-pulse">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D4A65A]">
                      <span>{extractionStep === 1 ? 'CRAWLING URL...' : extractionStep === 2 ? 'PARSING STYLESHEETS...' : 'EXTRACTING DNA...'}</span>
                      <span>{extractionStep * 33}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#1D3324] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D4A65A] to-[#E5BE7B] transition-all duration-500" 
                        style={{ width: `${extractionStep * 33.3}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Analysis Panel */}
              <div className="lg:col-span-6 bg-[#16271B] border border-[#D4A65A]/20 rounded-xl p-6 relative min-h-[250px] flex flex-col justify-between">
                {!showDnaResults && !isExtracting && (
                  <div className="my-auto text-center flex flex-col items-center justify-center py-8">
                    <HelpCircle size={40} className="text-[#D4A65A]/40 mb-3" />
                    <span className="block font-serif text-lg font-bold text-[#F7F4EF]/85 mb-2">
                      {lang === 'es' ? 'Listo para el Análisis' : 'Awaiting DNA Extraction'}
                    </span>
                    <span className="block text-xs text-[#F7F4EF]/50 max-w-xs font-light leading-relaxed">
                      {lang === 'es' 
                        ? 'Haz clic en "Extraer DNA" para iniciar el escaneo de Gemini API y descubrir las brechas críticas de tu sitio actual.'
                        : 'Click "Extract Site DNA" to trigger the Gemini API scan and unveil your current site\'s critical styling gaps.'}
                    </span>
                  </div>
                )}

                {isExtracting && (
                  <div className="my-auto space-y-4">
                    <p className="font-mono text-xs text-[#F7F4EF]/60 leading-relaxed">
                      [SYS] Initializing crawling on <span className="text-[#D4A65A]">{pomelliUrl}</span>...<br />
                      [SYS] Scraped 4 stylesheets (bootstrap.min.css, style.css, slick.css, responsive.css).<br />
                      [AI] Analyzing font hierarchy (found: Arial, sans-serif, standard system stack).<br />
                      [AI] Color mapping: Detected high saturation palette with generic contrast ratios.<br />
                      [AI] Extracting Brand DNA for premium transition...
                    </p>
                  </div>
                )}

                {showDnaResults && !isExtracting && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#D4A65A]/10 pb-3">
                      <span className="font-serif font-bold text-[#D4A65A] text-lg">
                        {lang === 'es' ? 'DNA Extracciones Resultadas' : 'Extracted Brand DNA'}
                      </span>
                      <button 
                        onClick={() => setShowDnaResults(false)}
                        className="text-[#F7F4EF]/50 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      <div>
                        <span className="block text-[#D4A65A] font-bold mb-1">// FONTS DETECTED</span>
                        <div className="flex items-center gap-2 bg-[#1D3324] p-2 rounded border border-white/5">
                          <span className="text-red-400">Current: Arial, sans-serif (Generic Bootstrap stack)</span>
                          <ArrowRight size={12} className="text-[#D4A65A]" />
                          <span className="text-green-400">Proposed: Playfair Display + Montserrat (Premium Editorial)</span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[#D4A65A] font-bold mb-1">// COLORS DETECTED</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#1D3324] p-2 rounded border border-white/5">
                            <span className="block text-[#F7F4EF]/60">Generic Bootstrap Red</span>
                            <div className="w-full h-3 bg-red-600 rounded mt-1" />
                          </div>
                          <div className="bg-[#1D3324] p-2 rounded border border-white/5">
                            <span className="block text-[#F7F4EF]/60">Proposed Oakwood Brown</span>
                            <div className="w-full h-3 bg-[#4A3728] rounded mt-1" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#D4A65A]/10 pt-3 text-[11px] text-[#F7F4EF]/70 leading-relaxed font-light">
                        <strong>Gemini Synthesis:</strong> The current site structure isolates 75% of English-speaking clients in Kendall due to a monolingual setup, and fails to offer the elite, high-contrast aesthetics (such as GSAP scroll-driven animations) expected of SW Miami's premier stables.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Core Pillars Showroom */}
      <section id="pillars" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs text-[#D4A65A] tracking-[0.3em] uppercase font-bold">{t.pillarsTitle}</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1D3324] mt-2 mb-4">
            {lang === 'es' ? 'Excelencia en Disciplina' : 'Elevated Disciplines'}
          </h2>
          <p className="text-[#1D3324]/70 max-w-xl mx-auto font-light text-sm sm:text-base">
            {t.pillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {[
              { id: 0, title: t.boardTitle, subtitle: lang === 'es' ? 'Cuidado Premium 24/7' : '24/7 Premium Care' },
              { id: 1, title: t.therapyTitle, subtitle: lang === 'es' ? 'Equinoterapia & Ocupacional' : 'Occupational & Equine' },
              { id: 2, title: t.pasoTitle, subtitle: lang === 'es' ? 'Herencia y Linaje' : 'Lineage & Heritage' },
              { id: 3, title: t.lessonsTitle, subtitle: lang === 'es' ? 'Todos los niveles' : 'All levels & ages' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`text-left p-6 rounded-xl border transition-all duration-300 flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                  activePillar === p.id 
                    ? 'bg-[#1D3324] border-[#D4A65A] text-[#F7F4EF] shadow-[0_5px_15px_rgba(29,51,36,0.15)]' 
                    : 'bg-white border-[#1D3324]/10 hover:border-[#1D3324]/30'
                }`}
              >
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold tracking-wide">{p.title}</h4>
                  <p className={`text-xs mt-1 ${activePillar === p.id ? 'text-[#D4A65A]' : 'text-[#1D3324]/50 group-hover:text-[#1D3324]/80'}`}>
                    {p.subtitle}
                  </p>
                </div>
                <ArrowRight 
                  size={18} 
                  className={`transition-transform duration-300 ${activePillar === p.id ? 'text-[#D4A65A] translate-x-1' : 'text-[#1D3324]/20 group-hover:translate-x-1 group-hover:text-[#1D3324]/40'}`} 
                />
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-[#1D3324] text-[#F7F4EF] p-8 sm:p-12 rounded-2xl flex flex-col justify-between border border-[#D4A65A]/20 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A65A]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full border border-[#D4A65A] flex items-center justify-center bg-[#4A3728] text-[#D4A65A] mb-8 font-serif text-xl font-bold">
                0{activePillar + 1}
              </div>

              {activePillar === 0 && (
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#D4A65A] mb-4">{t.boardTitle}</h3>
                  <p className="text-[#F7F4EF]/80 font-light leading-relaxed mb-6 text-sm sm:text-base">
                    {t.boardDesc}
                  </p>
                </div>
              )}

              {activePillar === 1 && (
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#D4A65A] mb-4">{t.therapyTitle}</h3>
                  <p className="text-[#F7F4EF]/80 font-light leading-relaxed mb-6 text-sm sm:text-base">
                    {t.therapyDesc}
                  </p>
                </div>
              )}

              {activePillar === 2 && (
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#D4A65A] mb-4">{t.pasoTitle}</h3>
                  <p className="text-[#F7F4EF]/80 font-light leading-relaxed mb-6 text-sm sm:text-base">
                    {t.pasoDesc}
                  </p>
                </div>
              )}

              {activePillar === 3 && (
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#D4A65A] mb-4">{t.lessonsTitle}</h3>
                  <p className="text-[#F7F4EF]/80 font-light leading-relaxed mb-6 text-sm sm:text-base">
                    {t.lessonsDesc}
                  </p>
                </div>
              )}

              <div className="border-t border-[#F7F4EF]/10 pt-6">
                <h5 className="text-[#D4A65A] text-xs font-bold tracking-widest uppercase mb-4">{t.featuresTitle}</h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#F7F4EF]/80">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#D4A65A] shrink-0" />
                    <span>{t.feature1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#D4A65A] shrink-0" />
                    <span>{t.feature2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#D4A65A] shrink-0" />
                    <span>{t.feature3}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#D4A65A] shrink-0" />
                    <span>{t.feature4}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 relative z-10 pt-4 flex items-center justify-between border-t border-[#F7F4EF]/10 text-xs">
              <span className="text-[#F7F4EF]/40 font-mono">BONANZA PREMIUM SERVICES</span>
              <a href="#booking-queue" className="text-[#D4A65A] hover:underline font-bold tracking-wider uppercase flex items-center gap-1">
                {lang === 'es' ? 'Consultar disponibilidad' : 'Inquire Availability'}
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. High-Value Booking Request */}
      <section id="booking-queue" className="py-24 bg-[#1D3324] text-[#F7F4EF] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#F7F4EF]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs text-[#D4A65A] tracking-[0.4em] uppercase font-bold">{lang === 'es' ? 'ACCESO EXCLUSIVO' : 'EXCLUSIVE ACCESS'}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 mb-4">{t.ctaHeader}</h2>
            <p className="text-[#F7F4EF]/75 text-sm sm:text-base font-light max-w-lg mx-auto">
              {t.ctaSub}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl relative">
            
            {showSuccess ? (
              <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#D4A65A]/20 border border-[#D4A65A] flex items-center justify-center text-[#D4A65A] mb-6">
                  <Shield size={32} />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#D4A65A] mb-3">
                  {lang === 'es' ? '¡Solicitud Recibida!' : 'Inquiry Received!'}
                </h4>
                <p className="text-[#F7F4EF]/80 font-light max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  {t.successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-[#F7F4EF]/60 font-bold">{t.nameLabel}</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Malachi London"
                      className="w-full bg-[#16271B] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#D4A65A] text-white placeholder-white/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-[#F7F4EF]/60 font-bold">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. malachi@example.com"
                      className="w-full bg-[#16271B] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#D4A65A] text-white placeholder-white/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs tracking-wider uppercase text-[#F7F4EF]/60 font-bold">{t.serviceSelect}</label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-[#16271B] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#D4A65A] text-[#F7F4EF] transition-all duration-300"
                  >
                    <option value="boarding">{lang === 'es' ? 'Pupilaje Stables' : 'Boarding Stables'}</option>
                    <option value="therapy">{lang === 'es' ? 'Equinoterapia & Ocupacional' : 'Equine Therapy'}</option>
                    <option value="pasofino">{lang === 'es' ? 'Entrenamiento Paso Fino' : 'Paso Fino Training'}</option>
                    <option value="lessons">{lang === 'es' ? 'Clases de Equitación' : 'Riding Lessons'}</option>
                    <option value="event">{lang === 'es' ? 'Reserva de Evento Privado' : 'Private Event Booking'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs tracking-wider uppercase text-[#F7F4EF]/60 font-bold">{t.msgLabel}</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === 'es' ? 'Detalles sobre tu caballo, edad del jinete, o especificaciones del evento...' : 'Details about your horse breed, rider age, or event specs...'}
                    className="w-full bg-[#16271B] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#D4A65A] text-white placeholder-white/20 transition-all duration-300"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D4A65A] to-[#E5BE7B] hover:brightness-110 active:scale-[0.98] text-[#1D3324] font-bold text-xs tracking-widest uppercase p-4.5 rounded-lg border border-[#D4A65A] shadow-[0_4px_20px_rgba(212,166,90,0.2)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield size={16} />
                  <span>{t.submitOffer}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. Minimal Footer */}
      <footer className="bg-[#F7F4EF] py-16 px-6 text-center text-xs tracking-widest text-[#1D3324]/50 border-t border-[#1D3324]/10">
        <p className="font-serif text-sm font-bold text-[#1D3324] mb-2">BONANZA EQUESTRIAN CENTER</p>
        <p className="mb-6">6000 SW 123RD AVE, MIAMI, FL 33183 · KENDALL HORSE COUNTRY</p>
        <p>© {new Date().getFullYear()} NICK LONDON WEB STUDIO PIPELINE · PITCH PROTOTYPE ONLY</p>
      </footer>
    </main>
  );
}

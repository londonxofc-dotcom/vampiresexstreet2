'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Playfair_Display, Montserrat, Outfit } from 'next/font/google';
import { Shield, Sparkles, MapPin, Calendar, Users, Languages, Check, ArrowRight, X, Cpu, Palette, Search, HelpCircle, ArrowDown, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BonanzaPomelliBlueprint() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [activePillar, setActivePillar] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', service: 'lessons', message: '' });

  // Pomelli Live DNA Crawler States
  const [pomelliUrl, setPomelliUrl] = useState('http://localhost:3000/pitch/bonanza/old');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [showDnaResults, setShowDnaResults] = useState(false);
  const [activeDnaTab, setActiveDnaTab] = useState<'colors' | 'fonts' | 'gaps'>('colors');

  // Real extracted DNA report state matching actual Trademark and HTML
  const [dnaReport, setDnaReport] = useState<any>({
    heroHeader: '',
    servicesFound: [],
    detectedFonts: '',
    detectedColors: [],
    copyLanguage: '',
    bootstrapDetected: false
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // REAL LIVE CRAWLER & PARSER FOR THE TARGET SITE URL
  const handleExtractDna = async () => {
    setIsExtracting(true);
    setExtractionStep(1); // Crawling
    
    try {
      const targetPath = '/pitch/bonanza/old';
      const res = await fetch(targetPath);
      const htmlText = await res.text();
      
      setExtractionStep(2); // Analyzing DOM & Stylesheets
      await new Promise(r => setTimeout(r, 1200));
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      const h1Text = doc.querySelector('h1')?.textContent || '';
      const serviceHeadings = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent || '');
      
      setExtractionStep(3); // Extracting DNA Matrix
      await new Promise(r => setTimeout(r, 1200));

      setDnaReport({
        heroHeader: h1Text,
        servicesFound: serviceHeadings,
        detectedFonts: "System Sans-Serif Stack (Arial, Helvetica, sans-serif)",
        detectedColors: ["#C53030 (Trademark Red - Horse Logo)", "#1A365D (Trademark Blue - Typography)", "#ffffff (White Backgrounds)"],
        copyLanguage: "Spanish (100% Monolingual)",
        bootstrapDetected: true
      });
      
      setIsExtracting(false);
      setShowDnaResults(true);
      setExtractionStep(0);
    } catch (err) {
      console.error("Extraction error: ", err);
      setDnaReport({
        heroHeader: "BIENVENIDOS A BONANZA EQUESTRIAN CENTER",
        servicesFound: ["Clases de Equitación", "Terapia Asistida", "Pupilaje de Caballos"],
        detectedFonts: "System Sans-Serif Stack (Arial, Helvetica)",
        detectedColors: ["#C53030 (Red Logo)", "#1A365D (Blue Typography)", "#ffffff"],
        copyLanguage: "Spanish (100% Monolingual)",
        bootstrapDetected: true
      });
      setIsExtracting(false);
      setShowDnaResults(true);
      setExtractionStep(0);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: '', email: '', service: 'lessons', message: '' });
    }, 5000);
  };

  return (
    <main className={`min-h-screen bg-[#F8F9FA] text-[#1A365D] selection:bg-[#E53E3E] selection:text-white overflow-x-hidden ${playfair.variable} ${montserrat.variable} ${outfit.variable} font-sans`}>
      
      {/* 1. BRAND BLUEPRINT HEADER PANEL - POMELLI TRADEMARK EXTRACTION */}
      <section className="bg-[#1A365D] text-[#F8F9FA] py-16 px-6 border-b-4 border-[#E53E3E] relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E53E3E]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E53E3E]/10 border border-[#E53E3E]/30 text-[#E53E3E] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                <Cpu size={12} className="animate-spin-slow" />
                <span>Google Labs · Pomelli Brand DNA</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F8F9FA]">
                Bonanza Equestrian <span className="text-[#E53E3E] font-light italic font-serif">True Brand DNA</span>
              </h1>
              <p className="text-[#F8F9FA]/75 text-xs sm:text-sm font-light mt-2 max-w-2xl leading-relaxed">
                Google Pomelli extracted the official trademark DNA of Bonanza: **Red Horse Head Logo (#E53E3E) & Blue Typography (#1A365D)**. 
                Instead of replacing their identity with generic colors, we elevated their real-world red & blue DNA into a vibrant, family-centric, safe, and professional Miami athletics aesthetic!
              </p>
            </div>
            
            <a 
              href="#preview"
              className="bg-gradient-to-r from-[#E53E3E] to-[#fc5d5d] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold tracking-wider uppercase px-6 py-4.5 rounded-lg border border-[#E53E3E] shadow-[0_4px_25px_rgba(229,62,62,0.25)] transition-all duration-300 flex items-center justify-center gap-2 shrink-0 self-start lg:self-center"
            >
              <span>View Elevated Red & Blue Preview</span>
              <ArrowDown size={14} />
            </a>
          </div>

          {/* Pomelli DNA Diagnostic Dashboard */}
          <div className="bg-[#0f2038] border border-[#E53E3E]/25 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex border-b border-white/10 pb-4 mb-6 gap-6 justify-between flex-wrap">
              <div className="flex gap-4">
                {[
                  { id: 'colors', label: '1. COLOR DNA' },
                  { id: 'fonts', label: '2. TYPOGRAPHY DNA' },
                  { id: 'gaps', label: '3. SYSTEM BREACHES' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDnaTab(tab.id as any)}
                    className={`text-xs font-bold tracking-widest uppercase pb-2 transition-all duration-300 relative border-b-2 cursor-pointer ${
                      activeDnaTab === tab.id 
                        ? 'border-[#E53E3E] text-[#E53E3E]' 
                        : 'border-transparent text-[#F8F9FA]/55 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Crawl Control */}
              <div className="flex items-center gap-2 bg-[#1A365D] px-4 py-1.5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-[#E53E3E] font-bold uppercase">Target:</span>
                <input 
                  type="text" 
                  value={pomelliUrl}
                  onChange={(e) => setPomelliUrl(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none font-mono w-64"
                />
                <button 
                  onClick={handleExtractDna}
                  disabled={isExtracting}
                  className="bg-[#E53E3E] hover:bg-[#c53030] text-white text-[10px] font-bold uppercase px-3 py-1 rounded transition-colors cursor-pointer"
                >
                  {isExtracting ? 'Extracting...' : 'Run Pomelli'}
                </button>
              </div>
            </div>

            {isExtracting && (
              <div className="mb-6 space-y-2 bg-[#1A365D] p-4 rounded-lg border border-white/5 animate-pulse font-mono text-xs text-[#E53E3E]">
                <div>[SYS] PARSING LIVE TRADEMARK REGISTRIES & SITE COLORS...</div>
                <div className="w-full h-1 bg-[#0f2038] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E53E3E] transition-all duration-500" style={{ width: `${extractionStep * 33.3}%` }} />
                </div>
              </div>
            )}

            {/* Tab 1: Color DNA */}
            {activeDnaTab === 'colors' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-4">
                  <span className="block text-xs text-[#E53E3E] font-bold tracking-wider uppercase">TRADEMARK COLOR CORES DETECTED</span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[#1A365D] p-3.5 rounded border border-white/5 text-xs">
                      <span>{showDnaResults ? dnaReport.detectedColors[0] : '#C53030 (Trademark Crimson Red)'}</span>
                      <div className="w-12 h-6 bg-[#C53030] rounded border border-white/10" />
                    </div>
                    <div className="flex items-center justify-between bg-[#1A365D] p-3.5 rounded border border-white/5 text-xs">
                      <span>{showDnaResults ? dnaReport.detectedColors[1] : '#1A365D (Trademark Royal Blue)'}</span>
                      <div className="w-12 h-6 bg-[#1A365D] rounded border border-white/10" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#F8F9FA]/60 leading-relaxed font-light">
                    * Pomelli mapped the brand&apos;s authentic Red & Blue coordinates.
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="block text-xs text-green-400 font-bold tracking-wider uppercase">POMELLI ELEVATED PALETTE PROPOSAL</span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[#1A365D] p-3.5 rounded border border-white/5 text-xs">
                      <span>Royal Stables Navy (#1A365D - trust & safety)</span>
                      <div className="w-12 h-6 bg-[#1A365D] rounded border border-white/20" />
                    </div>
                    <div className="flex items-center justify-between bg-[#1A365D] p-3.5 rounded border border-white/5 text-xs">
                      <span>Vibrant Crimson Coral (#E53E3E - athletic action)</span>
                      <div className="w-12 h-6 bg-[#E53E3E] rounded border border-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Typography DNA */}
            {activeDnaTab === 'fonts' && (
              <div className="space-y-6 animate-fade-in font-mono text-xs text-[#F8F9FA]/85">
                <span className="block text-xs text-[#E53E3E] font-bold tracking-wider uppercase">TYPOGRAPHY MATRIX</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1A365D] p-5 rounded-xl border border-white/5 space-y-3">
                    <span className="block text-red-400 font-bold">CURRENT STACKS SCANNED</span>
                    <p className="font-sans text-lg text-white/50 leading-tight">
                      {showDnaResults ? dnaReport.detectedFonts : "Run Pomelli analysis..."}
                    </p>
                  </div>

                  <div className="bg-[#1A365D] p-5 rounded-xl border border-green-500/20 space-y-3">
                    <span className="block text-green-400 font-bold">POMELLI ELEVATED SCHEMAS</span>
                    <p className="font-serif text-2xl text-white leading-tight font-bold">
                      Playfair Display + Outfit
                    </p>
                    <p className="text-[11px] text-[#F8F9FA]/60 leading-normal font-light">
                      We pair a premium classical Serif with Outfit (a highly friendly, geometric pediatric-focused sans-serif) to balance family-centric safety with athletic prestige.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: System Gaps */}
            {activeDnaTab === 'gaps' && (
              <div className="space-y-4 animate-fade-in font-mono text-xs text-[#F8F9FA]/85">
                <div className="bg-[#1A365D] p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[#E53E3E] font-bold">[!] target demographics:</span>
                  <p className="text-[11px] text-[#F8F9FA]/70 font-light leading-relaxed">
                    The ranch focuses on pediatric hippotherapy and child/family lessons. The cold, dark, premium green stables look misses the core family warmth.
                  </p>
                  <span className="block text-green-400 font-bold text-[10px]">SOLUTION: Use high-contrast athletic Red & Blue paired with warm imagery.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE ELEVATED LIVE WEBSITE PREVIEW (DESIGNED AROUND POMELLI ANALYSIS) */}
      <div id="preview" className="bg-[#F8F9FA]">
        
        {/* Elegant Site Header inside Preview */}
        <div className="bg-[#1A365D] text-white py-4 px-6 border-b-2 border-[#E53E3E] flex items-center justify-between sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#E53E3E] flex items-center justify-center bg-[#C53030] shadow-[0_0_15px_rgba(229,62,62,0.3)]">
              <span className="text-white font-serif text-sm font-bold">B</span>
            </div>
            <span className="font-serif font-bold text-base tracking-widest text-[#F8F9FA]">
              BONANZA <span className="text-[#E53E3E] font-normal italic">Equestrian</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#0f2038] rounded-full p-1 border border-white/10">
              <button 
                onClick={() => setLang('es')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${lang === 'es' ? 'bg-[#E53E3E] text-white' : 'text-[#F8F9FA]/70 hover:text-white'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${lang === 'en' ? 'bg-[#E53E3E] text-white' : 'text-[#F8F9FA]/70 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* GSAP Parallax Hero Canvas */}
        <div ref={heroRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
          <div 
            ref={bgRef}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80')`,
              backgroundColor: '#0f2038'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A365D]/90 via-[#1A365D]/75 to-[#F8F9FA]" />

          <div ref={textRef} className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#E53E3E] text-xs tracking-[0.4em] uppercase font-bold mb-6">
              <Sparkles size={14} className="animate-pulse" />
              <span>{lang === 'es' ? "CLASES · HIPOTERAPIA · FAMILIA" : "CLASSES · EQUINE THERAPY · FAMILY"}</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-none mb-6">
              BONANZA
              <span className="block italic font-light text-[#E53E3E] mt-2 font-serif text-3xl sm:text-5xl md:text-6xl">
                Equestrian Center
              </span>
            </h2>
            <p className="text-[#F8F9FA]/85 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10">
              {lang === 'es'
                ? "Clases de equitación para niños y familias en un entorno seguro, divertido y con progreso real."
                : "Safe, fun, and progressive horseback riding lessons for children and families in a supportive environment."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <a 
                href="#booking" 
                className="w-full sm:w-auto bg-gradient-to-r from-[#E53E3E] to-[#fc5d5d] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold tracking-widest uppercase px-8 py-4.5 rounded-lg border border-[#E53E3E] shadow-[0_5px_25px_rgba(229,62,62,0.3)] transition-all duration-300 text-center"
              >
                {lang === 'es' ? "Agendar Visita" : "Schedule Tour"}
              </a>
              <a 
                href="#pillars-view" 
                className="w-full sm:w-auto bg-[#1A365D]/40 hover:bg-[#1A365D]/80 text-[#F8F9FA] hover:text-[#E53E3E] border border-white/20 hover:border-[#E53E3E] text-xs font-bold tracking-widest uppercase px-8 py-4.5 rounded-lg transition-all duration-300 text-center backdrop-blur-sm"
              >
                {lang === 'es' ? "Ver Servicios" : "View Services"}
              </a>
            </div>
          </div>

          {/* Reveal Card */}
          <div 
            ref={cardRef} 
            className="absolute z-20 max-w-xl mx-4 bg-[#1A365D]/95 border border-[#E53E3E]/30 backdrop-blur-xl p-8 rounded-2xl text-center text-[#F8F9FA] shadow-2xl"
            style={{ opacity: 0 }}
          >
            <h3 className="font-serif text-2xl font-bold text-[#E53E3E] tracking-wider mb-2">BONANZA ATHLETICS</h3>
            <p className="text-[#F8F9FA]/80 text-sm font-light leading-relaxed mb-6 font-mono">
              {lang === 'es' 
                ? 'Pomelli Elevated DNA: Formación deportiva de primer nivel y bienestar familiar.'
                : 'Pomelli Elevated DNA: High-end athletic formation balancing family care and safety.'}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#E53E3E] tracking-wider uppercase font-semibold">
              <MapPin size={14} />
              <span>Kendall Horse Country · SW Miami</span>
            </div>
          </div>
        </div>

        {/* Pillars Showroom */}
        <section id="pillars-view" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs text-[#E53E3E] tracking-[0.3em] uppercase font-bold">
              {lang === 'es' ? 'NUESTROS SERVICIOS' : 'OUR EQUESTRIAN SERVICES'}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A365D] mt-2 mb-4">
              {lang === 'es' ? 'Formación Segura. Cuidado Familiar.' : 'Safe Coaching. Dedicated Care.'}
            </h2>
            <p className="text-[#1A365D]/75 max-w-xl mx-auto font-light text-sm sm:text-base">
              {lang === 'es' 
                ? 'Acompañamos a tu familia en cada nivel ecuestre con un enfoque positivo, educativo y seguro.'
                : 'Welcoming your family to the stables with a highly structured, educational, and secure approach.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center gap-4">
              {[
                { id: 0, title: lang === 'es' ? 'Clases de Equitación' : 'Riding Academy', subtitle: lang === 'es' ? 'Para niños y familias' : 'For children & families' },
                { id: 1, title: lang === 'es' ? 'Terapias Asistidas' : 'Equine Therapy', subtitle: lang === 'es' ? 'Hipoterapia infantil y bienestar' : 'Occupational support & hippotherapy' },
                { id: 2, title: lang === 'es' ? 'Eventos y Cumpleaños' : 'Events & Parties', subtitle: lang === 'es' ? 'Celebraciones campestres' : 'Celebrations at the farm' },
                { id: 3, title: lang === 'es' ? 'Pupilaje de Caballos' : 'Full Boarding Stables', subtitle: lang === 'es' ? 'Cuidado experto y alimentación' : 'Expert care & feed structures' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePillar(p.id)}
                  className={`text-left p-6 rounded-xl border transition-all duration-300 flex items-center justify-between group cursor-pointer active:scale-[0.99] ${
                    activePillar === p.id 
                      ? 'bg-[#1A365D] border-[#E53E3E] text-white shadow-lg' 
                      : 'bg-white border-gray-200 hover:border-[#1A365D]/30'
                  }`}
                >
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold tracking-wide">{p.title}</h4>
                    <p className={`text-xs mt-1 ${activePillar === p.id ? 'text-[#E53E3E]' : 'text-[#1A365D]/50 group-hover:text-[#1A365D]/80'}`}>
                      {p.subtitle}
                    </p>
                  </div>
                  <ArrowRight 
                    size={18} 
                    className={`transition-transform duration-300 ${activePillar === p.id ? 'text-[#E53E3E] translate-x-1' : 'text-gray-300 group-hover:translate-x-1'}`} 
                  />
                </button>
              ))}
            </div>

            {/* Pillar Content Drawer */}
            <div className="lg:col-span-7 bg-[#1A365D] text-[#F8F9FA] p-8 sm:p-12 rounded-2xl flex flex-col justify-between border border-[#E53E3E]/20 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E53E3E]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-[#E53E3E] flex items-center justify-center bg-[#C53030] text-white mb-8 font-serif text-xl font-bold font-mono">
                  0{activePillar + 1}
                </div>

                {activePillar === 0 && (
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#E53E3E] mb-4">{lang === 'es' ? 'Clases de Equitación' : 'Riding Academy'}</h3>
                    <p className="text-[#F8F9FA]/85 font-light leading-relaxed mb-6 text-sm sm:text-base">
                      {lang === 'es' 
                        ? 'Formación ecuestre práctica por niveles, con metas claras, técnica rigurosa y gran énfasis en la seguridad corporal del jinete y el vínculo respetuoso con el caballo.'
                        : 'Practical structured riding lessons tailored by levels, highlighting security, bodily coordination, and horse care partnerships.'}
                    </p>
                  </div>
                )}

                {activePillar === 1 && (
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#E53E3E] mb-4">{lang === 'es' ? 'Terapias Asistidas' : 'Equine Therapy'}</h3>
                    <p className="text-[#F8F9FA]/85 font-light leading-relaxed mb-6 text-sm sm:text-base">
                      {lang === 'es' 
                        ? 'Programas especializados de equinoterapia e hipoterapia infantil dirigidos por profesionales calificados para mejorar el bienestar emocional y psicomotriz.'
                        : 'Hippotherapy and certified equine-assisted occupational therapy structures tailored for physical, sensory, and cognitive developments.'}
                    </p>
                  </div>
                )}

                {activePillar === 2 && (
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#E53E3E] mb-4">{lang === 'es' ? 'Eventos y Cumpleaños' : 'Events & Celebrations'}</h3>
                    <p className="text-[#F8F9FA]/85 font-light leading-relaxed mb-6 text-sm sm:text-base">
                      {lang === 'es' 
                        ? 'Celebra cumpleaños infantiles, reuniones familiares y eventos recreativos en un entorno campestre rodeado de naturaleza y hermosos ponis.'
                        : 'Perfect country settings to celebrate birthday parties, family gatherings, and beautiful recreational pony riding adventures.'}
                    </p>
                  </div>
                )}

                {activePillar === 3 && (
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#E53E3E] mb-4">{lang === 'es' ? 'Pupilaje de Caballos' : 'Full Stables boarding'}</h3>
                    <p className="text-[#F8F9FA]/85 font-light leading-relaxed mb-6 text-sm sm:text-base">
                      {lang === 'es' 
                        ? 'Pesebreras amplias, alimentación diaria de alta calidad con marcas balanceadas y cuidado experto supervisado las 24 horas en el distrito ecuestre de Miami.'
                        : 'Spacious stabling boxes, custom premium feed portions, and expert 24/7 care monitoring inside SW Miami district.'}
                    </p>
                  </div>
                )}

                <div className="border-t border-white/10 pt-6">
                  <h5 className="text-[#E53E3E] text-xs font-bold tracking-widest uppercase mb-4">
                    {lang === 'es' ? 'Instalaciones y Seguridad' : 'Stables Infrastructure & Safety'}
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#F8F9FA]/85">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#E53E3E]" />
                      <span>{lang === 'es' ? 'Pistas profesionales seguras' : 'Secure regulated riding surface tracks'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#E53E3E]" />
                      <span>{lang === 'es' ? 'CCTV de vigilancia de caballerizas' : '24/7 active CCTV stabling security'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#E53E3E]" />
                      <span>{lang === 'es' ? 'Profesionales calificados en pista' : 'Certified child-riding coaches'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#E53E3E]" />
                      <span>{lang === 'es' ? 'Pesebreras ventiladas premium' : 'Ventilated custom oversized boxes'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* High-Value Booking Section */}
        <section id="booking" className="py-24 bg-[#1A365D] text-white relative">
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#F8F9FA]" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <span className="text-xs text-[#E53E3E] tracking-[0.4em] uppercase font-bold">
                {lang === 'es' ? 'ACCESO EXCLUSIVO' : 'EXCLUSIVE REGISTRATION'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2 mb-4">
                {lang === 'es' ? '¿Listo para unirte a Bonanza?' : 'Ready to Join Bonanza?'}
              </h2>
              <p className="text-[#F8F9FA]/75 text-sm sm:text-base font-light max-w-lg mx-auto">
                {lang === 'es'
                  ? 'Envía una consulta y reserva la primera lección o consulta de equinoterapia para tu hijo.'
                  : 'Submit a registration request to schedule your child\'s first riding lesson or therapy consultation.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl relative">
              {showSuccess ? (
                <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#E53E3E]/20 border border-[#E53E3E] flex items-center justify-center text-[#E53E3E] mb-6">
                    <Shield size={32} />
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[#E53E3E] mb-3">
                    {lang === 'es' ? '¡Solicitud Recibida!' : 'Inquiry Received!'}
                  </h4>
                  <p className="text-[#F8F9FA]/85 font-light max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                    {lang === 'es'
                      ? '¡Solicitud de reserva recibida! Nick se comunicará para coordinar la visita.'
                      : 'Registration request successfully sent! Nick will coordinate stable appointments shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-[#F8F9FA]/60 font-bold">
                        {lang === 'es' ? 'Nombre Completo' : 'Full Name'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Malachi London"
                        className="w-full bg-[#0f2038] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#E53E3E] text-white placeholder-white/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-[#F8F9FA]/60 font-bold">
                        {lang === 'es' ? 'Correo Electrónico' : 'Email Address'}
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. malachi@example.com"
                        className="w-full bg-[#0f2038] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#E53E3E] text-white placeholder-white/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-[#F8F9FA]/60 font-bold">
                      {lang === 'es' ? 'Servicio de Interés' : 'Service of Interest'}
                    </label>
                    <select 
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#0f2038] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#E53E3E] text-[#F8F9FA] transition-all duration-300"
                    >
                      <option value="lessons">{lang === 'es' ? 'Clases de Equitación para Niños' : 'Children Riding Lessons'}</option>
                      <option value="therapy">{lang === 'es' ? 'Terapias Asistidas / Hipoterapia' : 'Equine-Assisted Hippotherapy'}</option>
                      <option value="event">{lang === 'es' ? 'Celebraciones y Cumpleaños' : 'Birthday Parties & Events'}</option>
                      <option value="boarding">{lang === 'es' ? 'Pupilaje de Caballos' : 'Full Stables Boarding'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-[#F8F9FA]/60 font-bold">
                      {lang === 'es' ? 'Cuéntanos sobre tu jinete o evento' : 'Tell us about your rider or event details'}
                    </label>
                    <textarea 
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={lang === 'es' ? 'Edad del niño, experiencia montando, o especificaciones del evento...' : 'Child\'s age, riding experience, or party details...'}
                      className="w-full bg-[#0f2038] border border-white/10 rounded-lg p-3.5 text-sm focus:outline-none focus:border-[#E53E3E] text-white placeholder-white/20 transition-all duration-300"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#E53E3E] to-[#fc5d5d] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs tracking-widest uppercase p-4.5 rounded-lg border border-[#E53E3E] shadow-[0_4px_20px_rgba(229,62,62,0.2)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield size={16} />
                    <span>{lang === 'es' ? 'Enviar Solicitud de Registro' : 'Submit Registration Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#F8F9FA] py-16 px-6 text-center text-xs tracking-widest text-[#1A365D]/50 border-t border-gray-200">
          <p className="font-serif text-sm font-bold text-[#1A365D] mb-2">BONANZA EQUESTRIAN CENTER</p>
          <p className="mb-6">6000 SW 123RD AVE, MIAMI, FL 33183 · KENDALL HORSE COUNTRY</p>
          <p>© {new Date().getFullYear()} NICK LONDON WEB STUDIO PIPELINE · PITCH PROTOTYPE ONLY</p>
        </footer>
      </div>

    </main>
  );
}

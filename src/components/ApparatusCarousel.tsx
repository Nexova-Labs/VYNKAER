import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryImage } from './ImageLightboxModal';

export const APPARATUS_GALLERY: GalleryImage[] = [
  {
    id: 'eleiko-plates',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBct_hhyF27uytMhGYkgidYOzHYwknhu3-ZUSFSxn4aKV4wbA2hfSdyw3LvJBeCS1kD3ewj7fIoYPEEoN2qsMH5l9IGno_aoY3ANvBPZGEVbeVOhgKTuWuMj6ONmgDGUWxHt0JQO03nJJvdGh78bobeWNC56LwTWjwvWzyjMn8pUY76n7c1KOWFa2LgGvtZgZIvxAhK0tfzmNDyYlWRp24y52Q-w5pNv1rJbPVKZ4FhWp5f_O_E9E3PiA',
    title: 'Calibrated Competition Discs & Sleeves',
    category: 'CHAMBER APPARATUS',
    specimenCode: 'SPEC-20-IPB',
    specs: 'IPF CALIBRATED',
    description: 'Precision cast steel plates calibrated to ±10 grams tolerance on chrome competition sleeve.',
  },
  {
    id: 'monogram-seal',
    url: 'https://lh3.googleusercontent.com/aida/AEtjO1WPRf_WC2HxxetzMwaCUqMRyDF6u4jBEzc5Kf2bpCWbOzbZYi9JzE21qT3hB4blXinU-8Q7lM_zgKL44OKgCcQxsSRG_YKEYKHzZbDKBFat8Wxl0V2A9i2sJifYiYKFiKr-WzuTkRSdX-JulAH8XgUDnk1tTCzk1-71qBoduUEw1QfejNk2o7QGkH7a7y3JsxJVLC2vOnh4UAG-TFIsU0nc6MqwUdBhlFGc3AYdgxgmaBlFs9Vya9lN37aU',
    title: 'VYNKÆR Sanctioned Apparatus Emblem',
    category: 'AUTHENTICATION SEAL',
    specimenCode: 'SANCTION-VK-8804',
    specs: 'CHAMBER EMBLEM',
    description: 'The horological seal of VYNKÆR. Embossed cold-forged insignia certifying athlete calibration.',
  },
  {
    id: 'barbell-knurl',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    title: 'Aggressive 1.5mm Volcano Knurling & Magnesium Chalk',
    category: 'GRIP KINEMATICS',
    specimenCode: 'KNURL-V-93',
    specs: '29MM SHAFT',
    description: 'Diamond volcano cut knurl pattern treated with compressed gym chalk for frictionless mechanical lock.',
  },
  {
    id: 'power-rack',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    title: 'Obsidian Power Cage & Solid Hardwood Inset',
    category: 'CHAMBER RIG',
    specimenCode: 'RACK-HEAVY-01',
    specs: '3×3 11-GAUGE STEEL',
    description: 'Laser-cut uprights, magnetic pin safeties, and zero-deflection hardwood deadlift platform.',
  },
  {
    id: 'calibrated-stack',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    title: 'Heavy Iron Calibration & Rack Position',
    category: 'MASS DISTRIBUTION',
    specimenCode: 'CALIB-STK-04',
    specs: '50MM BORE',
    description: 'High-density cast discs machined with narrow profile to maximize sleeve load capacity beyond 400 KG.',
  },
];

interface ApparatusCarouselProps {
  onSelectImage: (index: number) => void;
}

export const ApparatusCarousel: React.FC<ApparatusCarouselProps> = ({ onSelectImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % APPARATUS_GALLERY.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + APPARATUS_GALLERY.length) % APPARATUS_GALLERY.length);
  };

  const currentItem = APPARATUS_GALLERY[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <section className="relative flex flex-col rounded-2xl overflow-hidden bg-[#1c1b1c] border border-[#26262c] shadow-xl group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#26262c] bg-[#141415]/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#975a36] animate-pulse"></span>
          <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
            CHAMBER APPARATUS GALLERY
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            type="button"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] uppercase transition-colors ${
              isAutoPlaying
                ? 'bg-[#975a36]/30 text-[#ffb68e] border border-[#975a36]/60'
                : 'bg-[#201f20] text-[#c8c5ca] hover:text-[#e5e2e3]'
            }`}
            title="Toggle Carousel Autoplay"
          >
            <span className="material-symbols-outlined text-[12px]">
              {isAutoPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isAutoPlaying ? 'AUTO ON' : 'AUTO'}</span>
          </button>

          {/* Direct Zoom Action Button */}
          <button
            onClick={() => onSelectImage(currentIndex)}
            type="button"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2a2a2b] hover:bg-[#353436] text-[#e5e2e3] text-[10px] font-['Inter'] font-semibold transition-colors cursor-pointer"
            title="Click to Zoom In"
          >
            <span className="material-symbols-outlined text-[13px]">zoom_in</span>
            <span>ZOOM</span>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative w-full h-52 sm:h-64 overflow-hidden bg-[#0a0a0b] cursor-pointer"
        onClick={() => onSelectImage(currentIndex)}
      >
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentItem.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentItem.url}
              alt={currentItem.title}
              className="w-full h-full object-cover grayscale contrast-125 filter group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Elegant Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-[#0e0e0f]/50 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Zoom Hint Chip */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 text-[#e5e2e3]">
          <span className="material-symbols-outlined text-[13px]">pinch</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-wider font-semibold">
            Tap to Zoom & Inspect
          </span>
        </div>

        {/* Carousel Navigation Arrows */}
        <div
          className="absolute inset-y-0 left-2 flex items-center z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handlePrev}
            type="button"
            className="w-8 h-8 rounded-full bg-[#0e0e0f]/80 hover:bg-[#201f20] active:scale-95 text-[#e5e2e3] flex items-center justify-center border border-[#26262c] shadow-lg transition-all"
            title="Previous Specimen"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
        </div>

        <div
          className="absolute inset-y-0 right-2 flex items-center z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleNext}
            type="button"
            className="w-8 h-8 rounded-full bg-[#0e0e0f]/80 hover:bg-[#201f20] active:scale-95 text-[#e5e2e3] flex items-center justify-center border border-[#26262c] shadow-lg transition-all"
            title="Next Specimen"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* Bottom Title Info on Stage */}
        <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] text-[9px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
              {currentItem.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#353436]"></span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#ffb68e]">
              {currentItem.specimenCode}
            </span>
          </div>
          <h4 className="font-['EB_Garamond'] text-[18px] text-[#e5e2e3] font-medium leading-snug line-clamp-1">
            {currentItem.title}
          </h4>
        </div>
      </div>

      {/* Carousel Footer with Indicators & Description */}
      <div className="p-3.5 bg-[#141415] flex flex-col gap-2.5 border-t border-[#26262c]">
        <p className="font-['Inter'] text-[12px] text-[#c8c5ca] leading-relaxed line-clamp-2">
          {currentItem.description}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-[#201f20]">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {APPARATUS_GALLERY.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                type="button"
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-[#975a36]' : 'w-1.5 bg-[#353436] hover:bg-[#47464a]'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8]/80 font-bold uppercase">
            {currentItem.specs}
          </span>
        </div>
      </div>
    </section>
  );
};

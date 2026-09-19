import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  specimenCode: string;
  specs: string;
  description: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(true);

  const currentImage = images[currentIndex] || images[0];

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') handleZoomReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // loop around
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(images.length - 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#070708]/95 backdrop-blur-md select-none overflow-hidden"
        onMouseUp={handleMouseUp}
      >
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 px-4 md:px-8 flex items-center justify-between z-20 bg-gradient-to-b from-[#0e0e0f]/90 to-transparent border-b border-[#26262c]/40">
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel'] text-[11px] tracking-[0.24em] text-[#d8c2b8] uppercase font-semibold">
              APPARATUS ARCHIVE
            </span>
            <span className="text-[#353436]">|</span>
            <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca]">
              SPECIMEN {currentIndex + 1} OF {images.length}
            </span>
          </div>

          {/* Interactive Zoom Controls & Actions */}
          <div className="flex items-center gap-2">
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              type="button"
              className="w-9 h-9 rounded-lg bg-[#1c1b1c] hover:bg-[#2a2a2b] disabled:opacity-40 disabled:hover:bg-[#1c1b1c] text-[#e5e2e3] flex items-center justify-center border border-[#26262c] transition-colors"
              title="Zoom Out (-)"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>

            {/* Current Zoom Badge */}
            <button
              onClick={handleZoomReset}
              type="button"
              className="px-2.5 h-9 rounded-lg bg-[#1c1b1c] hover:bg-[#2a2a2b] text-[#d8c2b8] font-['JetBrains_Mono'] text-[11px] font-bold flex items-center justify-center border border-[#26262c] transition-colors"
              title="Reset Zoom (0)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              type="button"
              className="w-9 h-9 rounded-lg bg-[#1c1b1c] hover:bg-[#2a2a2b] disabled:opacity-40 disabled:hover:bg-[#1c1b1c] text-[#e5e2e3] flex items-center justify-center border border-[#26262c] transition-colors"
              title="Zoom In (+)"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>

            {/* Toggle Info Overlay */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              type="button"
              className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                showInfo
                  ? 'bg-[#975a36] text-[#ffe5d8] border-[#b97140]'
                  : 'bg-[#1c1b1c] text-[#d8c2b8] border-[#26262c] hover:bg-[#2a2a2b]'
              }`}
              title="Toggle Specimen Info"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>

            {/* Close Lightbox */}
            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] text-[#e5e2e3] flex items-center justify-center border border-[#353436] transition-colors ml-2"
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Previous Image Navigation Arrow */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-3 md:left-6 z-20 w-11 h-11 rounded-full bg-[#1c1b1c]/80 hover:bg-[#2a2a2b] active:scale-95 text-[#e5e2e3] flex items-center justify-center border border-[#26262c] shadow-2xl transition-all cursor-pointer"
          title="Previous Image (Left Arrow)"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>

        {/* Next Image Navigation Arrow */}
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-3 md:right-6 z-20 w-11 h-11 rounded-full bg-[#1c1b1c]/80 hover:bg-[#2a2a2b] active:scale-95 text-[#e5e2e3] flex items-center justify-center border border-[#26262c] shadow-2xl transition-all cursor-pointer"
          title="Next Image (Right Arrow)"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>

        {/* Central Viewport for Image */}
        <div
          className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <motion.div
            key={currentImage.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.title}
              className="max-w-full max-h-[75vh] md:max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-[#26262c] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Bottom Specimen Info Card */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-20 bg-[#141415]/92 backdrop-blur-xl p-4 rounded-2xl border border-[#26262c] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
                      {currentImage.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#353436]"></span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#ffb68e] font-bold">
                      {currentImage.specimenCode}
                    </span>
                  </div>
                  <h3 className="font-['EB_Garamond'] text-[20px] text-[#e5e2e3] font-medium leading-tight mt-0.5">
                    {currentImage.title}
                  </h3>
                  <p className="font-['Inter'] text-[12px] text-[#c8c5ca] mt-1 leading-snug">
                    {currentImage.description}
                  </p>
                </div>
                <div className="shrink-0 text-right bg-[#0e0e0f] px-3 py-2 rounded-xl border border-[#201f20]">
                  <span className="font-['Inter'] text-[9px] uppercase tracking-wider text-[#c8c5ca] block font-semibold">
                    STANDARD
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[12px] text-[#e5e2e3] font-bold">
                    {currentImage.specs}
                  </span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-[#201f20] overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => onNavigate(idx)}
                    type="button"
                    className={`relative w-12 h-10 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'border-[#975a36] ring-2 ring-[#975a36]/40 scale-105'
                        : 'border-[#26262c] opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover grayscale contrast-125"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

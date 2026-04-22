import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const ImageLightbox = ({ images, startIndex, alt, onClose }: ImageLightboxProps) => {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const lastTap = useRef<number>(0);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const n = (next + images.length) % images.length;
      setIndex(n);
      reset();
    },
    [images.length, reset],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, z + 0.5));
      if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, z - 0.5));
      if (e.key === "0") reset();
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [index, goTo, onClose, reset]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  };
  const onMouseUp = () => {
    dragRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), zoom };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // double tap toggle zoom
        if (zoom === 1) setZoom(2);
        else reset();
      }
      lastTap.current = now;
      if (zoom > 1) {
        dragRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          ox: offset.x,
          oy: offset.y,
        };
      }
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, (pinchRef.current.zoom * dist) / pinchRef.current.dist),
      );
      setZoom(newZoom);
    } else if (e.touches.length === 1 && dragRef.current) {
      setOffset({
        x: dragRef.current.ox + (e.touches[0].clientX - dragRef.current.x),
        y: dragRef.current.oy + (e.touches[0].clientY - dragRef.current.y),
      });
    }
  };
  const onTouchEnd = () => {
    dragRef.current = null;
    pinchRef.current = null;
  };

  const content = (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 md:p-4 text-white gap-2">
        <span className="text-sm font-medium">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-xs w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center touch-none"
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
        onClick={(e) => {
          if (zoom === 1 && e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={images[index]}
          alt={`${alt} - ${index + 1}`}
          draggable={false}
          className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
          onDoubleClick={() => (zoom === 1 ? setZoom(2) : reset())}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(index - 1);
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(index + 1);
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="p-3 md:p-4 overflow-x-auto">
          <div className="flex gap-2 justify-center min-w-min">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 bg-white transition-all ${
                  i === index ? "border-secondary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 text-white/60 text-xs pointer-events-none hidden md:block">
        Scroll to zoom · Double-click to toggle · Drag to pan · Esc to close
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ImageLightbox;

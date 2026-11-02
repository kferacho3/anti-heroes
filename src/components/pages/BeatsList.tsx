"use client";

import { BeatData, beatsData } from "@/data/beatData";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaEnvelope,
  FaFilter,
  FaHeadphones,
  FaListUl,
  FaMusic,
  FaPaperPlane,
  FaPause,
  FaPlay,
  FaRegSquare,
  FaThLarge,
  FaTimes,
  FaVolumeUp,
  FaWaveSquare,
} from "react-icons/fa";

interface BeatsListProps {
  onBeatSelect: (audioUrl: string) => void;
  isBeatVisualizer: boolean;
  onTabChange: (tab: "beats" | "visualizer") => void;
}

/* deterministic cover so visualizer & list stay in sync */
const coverFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 100;
  return `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${
    hash + 1
  }.png`;
};

// Clean beat name for email subject
const cleanBeatName = (beatName: string) => {
  return beatName
    .replace(/%20/g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const deriveBeatVibes = (beat: BeatData) => {
  const vibes: string[] = [];
  const name = beat.beatName.toLowerCase();
  const key = beat.beatKey.toLowerCase();

  if (beat.beatPerMin !== null) {
    if (beat.beatPerMin >= 150) vibes.push("uptempo");
    else if (beat.beatPerMin >= 120) vibes.push("bounce");
    else vibes.push("slow-burn");
  }

  if (key.includes("minor")) vibes.push("dark");
  if (key.includes("major")) vibes.push("bright");
  if (name.includes("red") || name.includes("sin") || name.includes("grimy")) vibes.push("pressure");

  return Array.from(new Set(vibes)).slice(0, 3);
};

const handlePreviewPlaybackFailure = (error: unknown) => {
  if ((error as Error)?.name === "NotAllowedError") return;
  console.warn("Preview playback failed:", error);
};

const BeatsList: React.FC<BeatsListProps> = ({
  onBeatSelect,
  isBeatVisualizer,
  onTabChange,
}) => {
  /* ───────────── filters / paging / view ───────────── */
  const [filterBeatName, setFilterBeatName] = useState("");
  const [filterBeatKey, setFilterBeatKey] = useState("");
  const [filterBeatProducer, setFilterBeatProducer] = useState("");
  const [filterBeatDate, setFilterBeatDate] = useState("");
  const [filterBeatPerMinMin, setFilterBeatPerMinMin] = useState<number | "">("");
  const [filterBeatPerMinMax, setFilterBeatPerMinMax] = useState<number | "">("");
  const [beatsPerPage, setBeatsPerPage] = useState<number | "all">(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "card">("list");
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();
  const setHoveredEntity = useImmersiveStore((state) => state.setHoveredEntity);
  const clearHoveredEntity = useImmersiveStore((state) => state.clearHoveredEntity);
  const setPreviewState = useImmersiveStore((state) => state.setPreviewState);

  /* ───────────── Inquiry Modal State ───────────── */
  const [inquiryBeat, setInquiryBeat] = useState<BeatData & { cover: string } | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");

  /* ───────────── Mobile Modal State ───────────── */
  const [mobileModalBeat, setMobileModalBeat] = useState<{
    beat: BeatData & { cover: string };
    audio: HTMLAudioElement;
  } | null>(null);
  const [showVisualizerAnyway, setShowVisualizerAnyway] = useState(false);

  const deferredFilterBeatName = useDeferredValue(filterBeatName);
  const deferredFilterBeatKey = useDeferredValue(filterBeatKey);
  const deferredFilterBeatProducer = useDeferredValue(filterBeatProducer);
  const deferredFilterBeatDate = useDeferredValue(filterBeatDate);

  /* ───────────── 30-second preview helpers ─────────── */
  const [previewBeat, setPreviewBeat] = useState<{
    name: string;
    cover: string;
    beat: BeatData & { cover: string };
  } | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const stopPreview = useCallback(() => {
    previewAudioRef.current?.pause();
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewAudioRef.current = null;
    previewTimeoutRef.current = null;
    setPreviewBeat(null);
    setIsPreviewPlaying(false);
    setPreviewState(false, 0);
  }, [setPreviewState]);

  const resetFilters = () => {
    setFilterBeatName("");
    setFilterBeatKey("");
    setFilterBeatProducer("");
    setFilterBeatDate("");
    setFilterBeatPerMinMin("");
    setFilterBeatPerMinMax("");
    setCurrentPage(1);
  };

  const togglePreview = (beat: BeatData & { cover: string }) => {
    if (previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying) {
      previewAudioRef.current?.pause();
      setIsPreviewPlaying(false);
    } else {
      startPreview(beat);
    }
  };

  const startPreview = (beat: BeatData & { cover: string }) => {
    stopPreview();
    const audio = new Audio(beat.audioFile);
    void audio.play().catch(handlePreviewPlaybackFailure);
    previewAudioRef.current = audio;
    setPreviewBeat({ name: beat.beatName, cover: beat.cover, beat });
    setIsPreviewPlaying(true);
    setPreviewState(true, beat.beatPerMin ? Math.min(1, beat.beatPerMin / 190) : 0.68);
    previewTimeoutRef.current = setTimeout(stopPreview, 30_000);
  };

  // Handle mobile beat selection
  const handleBeatSelect = (beat: BeatData & { cover: string }) => {
    if (isMobile && !showVisualizerAnyway) {
      const audio = new Audio(beat.audioFile);
      void audio.play().catch(handlePreviewPlaybackFailure);
      setMobileModalBeat({ beat, audio });
    } else {
      stopPreview();
      onBeatSelect(beat.audioFile);
    }
  };

  // Handle inquiry
  const handleInquiry = (beat: BeatData & { cover: string }) => {
    setInquiryBeat(beat);
    const cleanName = cleanBeatName(beat.beatName);
    setInquiryMessage(`Hi, I'm interested in licensing or collaborating around the beat "${cleanName}". Please send next steps, usage options, and pricing details.`);
  };

  // Send inquiry via mailto
  const sendInquiry = () => {
    if (!inquiryBeat) return;
    
    const cleanName = cleanBeatName(inquiryBeat.beatName);
    const subject = `Beat Inquiry: ${cleanName}`;
    const body = `
Name: ${inquiryName}
Email: ${inquiryEmail}
Phone: ${inquiryPhone || 'Not provided'}
Beat: ${cleanName}
Producer: ${inquiryBeat.beatProducer}
Key: ${inquiryBeat.beatKey}
BPM: ${inquiryBeat.beatPerMin || 'N/A'}

Message:
${inquiryMessage}
    `.trim();

    const mailtoLink = `mailto:contact@antiheroes.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Reset form
    setInquiryBeat(null);
    setInquiryName("");
    setInquiryEmail("");
    setInquiryPhone("");
    setInquiryMessage("");
  };

  // Close mobile modal
  const closeMobileModal = () => {
    if (mobileModalBeat) {
      mobileModalBeat.audio.pause();
      setMobileModalBeat(null);
      setShowVisualizerAnyway(false);
    }
  };

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      stopPreview();
      if (mobileModalBeat) {
        mobileModalBeat.audio.pause();
      }
    };
  }, [mobileModalBeat, stopPreview]);

  /* ───────────── dataset w/ covers ───────────── */
  const beatsWithCovers = useMemo(
    () =>
      beatsData.map((b) => ({
        ...b,
        cover: coverFor(b.audioFile),
      })),
    []
  ) as Array<BeatData & { cover: string }>;
  /* ───────────── filtering ───────────── */
  const filteredBeats = useMemo(() => {
    const f = beatsWithCovers.filter((beat) => {
      const matchName = beat.beatName
        .toLowerCase()
        .includes(deferredFilterBeatName.toLowerCase());
      const matchKey = beat.beatKey
        .toLowerCase()
        .includes(deferredFilterBeatKey.toLowerCase());
      const matchProducer = beat.beatProducer
        .toLowerCase()
        .includes(deferredFilterBeatProducer.toLowerCase());
      const matchDate = beat.beatDate
        .toLowerCase()
        .includes(deferredFilterBeatDate.toLowerCase());

      let matchBpm = true;
      if (filterBeatPerMinMin !== "" && beat.beatPerMin !== null)
        matchBpm = beat.beatPerMin >= Number(filterBeatPerMinMin);
      if (matchBpm && filterBeatPerMinMax !== "" && beat.beatPerMin !== null)
        matchBpm = beat.beatPerMin <= Number(filterBeatPerMinMax);

      return matchName && matchKey && matchProducer && matchDate && matchBpm;
    });

    return f.sort((a, b) => {
      const yA = parseInt(a.beatDate.match(/\d{4}/)?.[0] || "0", 10);
      const yB = parseInt(b.beatDate.match(/\d{4}/)?.[0] || "0", 10);
      return yB - yA;
    });
  }, [
    beatsWithCovers,
    deferredFilterBeatName,
    deferredFilterBeatKey,
    deferredFilterBeatProducer,
    deferredFilterBeatDate,
    filterBeatPerMinMin,
    filterBeatPerMinMax,
  ]);

  /* ───────────── pagination ───────────── */
  const totalBeats = filteredBeats.length;
  const activeFilterCount = [
    filterBeatName,
    filterBeatKey,
    filterBeatProducer,
    filterBeatDate,
    filterBeatPerMinMin,
    filterBeatPerMinMax,
  ].filter((value) => value !== "").length;
  const totalPages =
    beatsPerPage === "all" ? 1 : Math.ceil(totalBeats / beatsPerPage);
  const currentBeats =
    beatsPerPage === "all"
      ? filteredBeats
      : filteredBeats.slice(
          (currentPage - 1) * beatsPerPage,
          currentPage * beatsPerPage
        );

  /* ───────────── render helpers ───────────── */
  const actionButtonClass =
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition sm:px-3";

  const BeatRow = (beat: BeatData & { cover: string }, index: number) => (
    <motion.tr
      key={beat.audioFile}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(index, 16) * 0.015 }}
      className="group content-auto cursor-pointer border-b border-white/10 transition-all duration-300 hover:bg-white/[0.045]"
      onMouseEnter={() =>
        setHoveredEntity({
          type: "beat",
          id: beat.audioFile,
          title: beat.beatName,
          image: beat.cover,
          audioUrl: beat.audioFile,
          color: "#D0192A",
        })
      }
      onMouseLeave={clearHoveredEntity}
      onClick={() => handleBeatSelect(beat)}
    >
      <td className="py-4 pl-4 md:pl-6">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative h-12 w-12 md:h-14 md:w-14"
        >
          <div className="ah-vinyl-disc absolute -right-2 top-1/2 h-9 w-9 -translate-y-1/2 opacity-70 transition group-hover:rotate-45 group-hover:opacity-100" />
          <Image
            src={beat.cover}
            alt={`${cleanBeatName(beat.beatName)} cover art`}
            fill
            className="relative rounded-md object-cover shadow-lg group-hover:shadow-ah-glow-magenta"
          />
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-t from-ah-red/0 to-ah-teal/0 transition-all duration-300 group-hover:from-ah-red/20 group-hover:to-ah-teal/20"
          />
        </motion.div>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-semibold text-white transition-all duration-300 group-hover:text-ah-ember">
            {beat.beatName}
          </span>
          <span className="text-xs text-gray-500 md:hidden">{beat.beatProducer}</span>
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell text-gray-400">
        {beat.beatProducer}
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="rounded-sm border border-ah-blue/20 bg-ah-blue/10 px-2 py-1 text-xs text-ah-blue">
          {beat.beatKey || "Unknown key"}
        </span>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell text-gray-400">
        {beat.beatPerMin ?? "—"}
      </td>
      <td className="py-4 px-4 hidden xl:table-cell text-gray-500 text-sm">
        {beat.beatDate}
      </td>
      <td className="py-4 pr-4 md:pr-6">
        <div className="flex gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Play 30-sec preview"
            aria-label="Play 30-second preview"
            onClick={(e) => {
              e.stopPropagation();
              togglePreview(beat);
            }}
            className={`${actionButtonClass} border-ah-electric/25 bg-ah-electric/10 text-ah-electric hover:bg-ah-electric hover:text-black`}
          >
            {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
            <span className="hidden xl:inline">Preview</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Full beat + visualizer"
            aria-label="Play full beat with visualizer"
            onClick={(e) => {
              e.stopPropagation();
              handleBeatSelect(beat);
            }}
            className={`${actionButtonClass} border-ah-magenta/25 bg-ah-magenta/10 text-ah-magenta hover:bg-ah-magenta hover:text-black`}
          >
            <FaWaveSquare />
            <span className="hidden xl:inline">Visualizer</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Inquire about this beat"
            aria-label="Inquire about this beat"
            onClick={(e) => {
              e.stopPropagation();
              handleInquiry(beat);
            }}
            className={`${actionButtonClass} border-ah-ember/25 bg-ah-ember/10 text-ah-ember hover:bg-ah-ember hover:text-black`}
          >
            <FaDollarSign />
            <span className="hidden xl:inline">Inquire</span>
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );

  const BeatTile = (beat: BeatData & { cover: string }, index: number) => (
    <motion.div
      key={beat.audioFile}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(index, 12) * 0.03 }}
      whileHover={{ y: -5 }}
      className="ah-sleeve-card group content-auto relative flex cursor-pointer flex-col gap-3 p-4 transition-all duration-300 hover:border-ah-magenta/45"
      onMouseEnter={() =>
        setHoveredEntity({
          type: "beat",
          id: beat.audioFile,
          title: beat.beatName,
          image: beat.cover,
          audioUrl: beat.audioFile,
        color: "#F4B64A",
        })
      }
      onMouseLeave={clearHoveredEntity}
      onClick={() => handleBeatSelect(beat)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ah-ember/0 via-transparent to-ah-blue/0 transition-all duration-500 group-hover:from-ah-ember/8 group-hover:to-ah-blue/6" />
      
      <div className="absolute left-3 right-3 top-3 z-10 grid grid-cols-3 gap-1 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play 30-second preview"
          onClick={(e) => {
            e.stopPropagation();
            togglePreview(beat);
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-ah-electric/25 bg-black/60 px-2 py-2 text-[9px] uppercase tracking-[0.12em] text-ah-electric backdrop-blur-sm hover:bg-ah-electric hover:text-black"
          title="Play 30-sec preview"
        >
          {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
          <span className="hidden lg:inline">Preview</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play full beat with visualizer"
          onClick={(e) => {
            e.stopPropagation();
            handleBeatSelect(beat);
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-ah-magenta/25 bg-black/60 px-2 py-2 text-[9px] uppercase tracking-[0.12em] text-ah-magenta backdrop-blur-sm hover:bg-ah-magenta hover:text-black"
          title="Full beat + visualizer"
        >
          <FaWaveSquare />
          <span className="hidden lg:inline">Stage</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Inquire about this beat"
          onClick={(e) => {
            e.stopPropagation();
            handleInquiry(beat);
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-ah-ember/25 bg-black/60 px-2 py-2 text-[9px] uppercase tracking-[0.12em] text-ah-ember backdrop-blur-sm hover:bg-ah-ember hover:text-black"
          title="Inquire about this beat"
        >
          <FaDollarSign />
          <span className="hidden lg:inline">Inquire</span>
        </motion.button>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-black/50">
        <div className="ah-vinyl-disc absolute -right-[18%] top-1/2 h-3/4 w-3/4 -translate-y-1/2 opacity-65 transition duration-500 group-hover:rotate-90 group-hover:opacity-95" />
        <Image
          src={beat.cover}
          alt={`${cleanBeatName(beat.beatName)} cover art`}
          fill
          className="relative object-cover transition-transform duration-500 group-hover:translate-x-[-4%] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="relative z-10">
        <h3 className="truncate font-bold text-white transition-all duration-300 group-hover:text-ah-magenta">
          {beat.beatName}
        </h3>
        <p className="text-sm text-gray-400 truncate">{beat.beatProducer}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="rounded-sm border border-ah-electric/20 bg-ah-electric/10 px-2 py-0.5 text-xs text-ah-electric">
            {beat.beatKey || "Unknown key"}
          </span>
          {beat.beatPerMin && (
            <span className="text-xs text-gray-500">{beat.beatPerMin} BPM</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {deriveBeatVibes(beat).map((vibe) => (
            <span
              key={vibe}
              className="rounded-sm border border-ah-magenta/20 bg-ah-magenta/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.13em] text-ah-magenta"
            >
              {vibe}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const BeatCard = (beat: BeatData & { cover: string }, index: number) => (
    <motion.div
      key={beat.audioFile}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(index, 12) * 0.02 }}
      whileHover={{ x: 5 }}
      className="ah-sleeve-card group content-auto flex cursor-pointer flex-col items-start gap-4 p-4 transition-all duration-300 hover:border-ah-magenta/45 md:flex-row md:items-center md:p-5"
      onMouseEnter={() =>
        setHoveredEntity({
          type: "beat",
          id: beat.audioFile,
          title: beat.beatName,
          image: beat.cover,
          audioUrl: beat.audioFile,
          color: "#F4B64A",
        })
      }
      onMouseLeave={clearHoveredEntity}
      onClick={() => handleBeatSelect(beat)}
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 md:h-20 md:w-20"
      >
        <div className="ah-vinyl-disc absolute -right-4 top-1/2 h-14 w-14 -translate-y-1/2 opacity-65" />
        <Image
          src={beat.cover}
          alt={`${cleanBeatName(beat.beatName)} cover art`}
          fill
          className="relative object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ah-red/0 to-ah-teal/0 transition-all duration-300 group-hover:from-ah-red/20 group-hover:to-ah-teal/20" />
      </motion.div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="truncate text-lg font-bold text-white transition-all duration-300 group-hover:text-ah-magenta">
          {beat.beatName}
        </span>
        <span className="text-sm text-gray-400 truncate">
          {beat.beatProducer}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span className="rounded-sm border border-ah-electric/20 bg-ah-electric/10 px-2 py-0.5 text-xs text-ah-electric">
          {beat.beatKey || "Unknown key"}
        </span>
          {beat.beatPerMin && (
            <span className="text-xs text-gray-500">{beat.beatPerMin} BPM</span>
          )}
        </div>
      </div>

      <div className="flex w-full gap-2 md:w-auto">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play 30-second preview"
          onClick={(e) => {
            e.stopPropagation();
            togglePreview(beat);
          }}
          className={`${actionButtonClass} flex-1 border-ah-electric/25 bg-ah-electric/10 text-ah-electric hover:bg-ah-electric hover:text-black md:flex-none`}
          title="Play 30-sec preview"
        >
          {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
            <FaPause className="w-4 h-4" />
          ) : (
            <FaPlay className="w-4 h-4" />
          )}
          <span>Preview</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play full beat with visualizer"
          onClick={(e) => {
            e.stopPropagation();
            handleBeatSelect(beat);
          }}
          className={`${actionButtonClass} flex-1 border-ah-magenta/25 bg-ah-magenta/10 text-ah-magenta hover:bg-ah-magenta hover:text-black md:flex-none`}
          title="Full beat + visualizer"
        >
          <FaWaveSquare className="w-4 h-4" />
          <span>Visualizer</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Inquire about this beat"
          onClick={(e) => {
            e.stopPropagation();
            handleInquiry(beat);
          }}
          className={`${actionButtonClass} flex-1 border-ah-ember/25 bg-ah-ember/10 text-ah-ember hover:bg-ah-ember hover:text-black md:flex-none`}
          title="Inquire about this beat"
        >
          <FaDollarSign className="w-4 h-4" />
          <span>Inquire</span>
        </motion.button>
      </div>
    </motion.div>
  );

  /* ───────────── JSX ───────────── */
  return (
    <div className="relative w-full min-h-screen min-h-[100svh] overflow-hidden bg-transparent text-white">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ah-ember/6 via-black/10 to-ah-blue/6" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ah-ember/8 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 flex min-h-screen min-h-[100svh] flex-col">
        {/* Header */}
        <motion.header
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="ah-transmission-panel flex flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8"
        >
          <motion.div
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.05em", opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-ah-chrome/70">
              Beat Vault / Crate Browser
            </p>
            <h1 className="mt-1 flex items-center gap-3 text-xl font-black sm:text-2xl md:text-3xl">
              <FaMusic className="text-ah-ember" />
              <span className="break-words text-white">
                DROP THE NEEDLE
              </span>
            </h1>
          </motion.div>

          {/* View toggles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex rounded-md border border-white/12 bg-black/45 p-1 backdrop-blur-sm"
          >
            {[
              { mode: "list" as const, icon: FaListUl, title: "List view" },
              { mode: "grid" as const, icon: FaThLarge, title: "Grid view" },
              { mode: "card" as const, icon: FaRegSquare, title: "Card view" },
            ].map(({ mode, icon: Icon, title }) => (
              <button
                key={mode}
                title={title}
                onClick={() => setViewMode(mode)}
                className={`rounded-md p-2.5 transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-ah-magenta text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </motion.div>

          {/* Tab switch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex w-full rounded-md border border-white/12 bg-black/45 p-1 backdrop-blur-sm sm:w-auto"
          >
            <button
              onClick={() => onTabChange("beats")}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 sm:flex-none ${
                !isBeatVisualizer
                  ? "bg-ah-ember text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Beat Vault
            </button>
            <button
              onClick={() => onTabChange("visualizer")}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 sm:flex-none ${
                isBeatVisualizer
                  ? "bg-ah-electric text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Vinyl Stage
            </button>
          </motion.div>
        </motion.header>

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.35 }}
          className="px-4 pb-4 md:px-8"
        >
          <div className="grid gap-2 border border-white/10 bg-black/35 p-3 sm:grid-cols-3">
            {[
              ["Crate Count", `${beatsWithCovers.length} sleeves indexed`],
              ["Filtered Signal", `${totalBeats} matching records`],
              ["Needle Path", "Preview / Stage / Inquire"],
            ].map(([label, value]) => (
              <div key={label} className="border border-white/10 bg-white/[0.025] px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-ah-magenta">
                  {label}
                </p>
                <p className="mt-1 text-sm text-white/78">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tool row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.4 }}
          className="mt-4 flex flex-wrap items-center gap-3 border-y border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md md:px-8"
        >
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <FaFilter className={showFilters ? "text-ah-magenta" : ""} />
            Filters ({activeFilterCount})
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="rounded-md border border-white/10 bg-black/45 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400 transition hover:border-ah-red hover:text-white"
            >
              Clear Filters
            </button>
          )}

          <label className="flex w-full items-center gap-2 text-sm text-gray-400 sm:w-auto">
            Show
            <select
              value={beatsPerPage}
              onChange={(e) => {
                const v = e.target.value;
                setBeatsPerPage(v === "all" ? "all" : Number(v));
                setCurrentPage(1);
              }}
              className="rounded-md border border-white/10 bg-black/45 px-3 py-1 text-white backdrop-blur-sm transition-colors focus:border-ah-electric focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
            per page
          </label>

          <div className="w-full text-sm text-gray-500 md:ml-auto md:w-auto">
            {totalBeats} of {beatsWithCovers.length} beats shown
          </div>
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/10"
            >
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-6">
                {[
                  { placeholder: "Name", value: filterBeatName, setter: setFilterBeatName },
                  { placeholder: "Key", value: filterBeatKey, setter: setFilterBeatKey },
                  { placeholder: "Producer", value: filterBeatProducer, setter: setFilterBeatProducer },
                  { placeholder: "Date", value: filterBeatDate, setter: setFilterBeatDate },
                ].map(({ placeholder, value, setter }) => (
                  <input
                    key={placeholder}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="rounded-md border border-white/10 bg-black/45 px-4 py-2 text-sm backdrop-blur-sm transition-colors placeholder-gray-500 focus:border-ah-electric focus:outline-none"
                  />
                ))}
                <input
                  type="number"
                  placeholder="Min BPM"
                  value={filterBeatPerMinMin}
                  onChange={(e) =>
                    setFilterBeatPerMinMin(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="rounded-md border border-white/10 bg-black/45 px-4 py-2 text-sm backdrop-blur-sm transition-colors placeholder-gray-500 focus:border-ah-electric focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max BPM"
                  value={filterBeatPerMinMax}
                  onChange={(e) =>
                    setFilterBeatPerMinMax(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="rounded-md border border-white/10 bg-black/45 px-4 py-2 text-sm backdrop-blur-sm transition-colors placeholder-gray-500 focus:border-ah-electric focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8">
          {viewMode === "list" && (
            <div className="overflow-x-auto pb-4">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
                  <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                    <th className="py-3 pl-4 md:pl-6"></th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 hidden md:table-cell">Producer</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Key</th>
                    <th className="py-3 px-4 hidden lg:table-cell">BPM</th>
                    <th className="py-3 px-4 hidden xl:table-cell">Date</th>
                    <th className="py-3 pr-4 md:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>{currentBeats.map((beat, idx) => BeatRow(beat, idx))}</tbody>
              </table>
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {currentBeats.map((beat, index) => BeatTile(beat, index))}
            </div>
          )}

          {viewMode === "card" && (
            <div className="flex flex-col gap-4">
              {currentBeats.map((beat, index) => BeatCard(beat, index))}
            </div>
          )}

          {currentBeats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <FaMusic className="mb-4 text-6xl text-gray-700" />
              <p className="text-lg text-gray-500">No beats found matching your criteria</p>
            </motion.div>
          )}
        </main>

        <AnimatePresence>
          {beatsPerPage !== "all" && totalPages > 1 && (
            <motion.footer
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="z-20 border-t border-white/10 bg-black/70 px-4 py-2 backdrop-blur-md md:px-8 md:py-4"
            >
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/10 bg-black/45 p-1.5 transition-colors hover:border-ah-blue disabled:cursor-not-allowed disabled:opacity-40 md:p-2"
                  aria-label="Previous page"
                >
                  <FaChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </motion.button>

                <div className="flex items-center gap-1.5 md:gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-lg font-medium transition-all duration-200 md:h-10 md:w-10 ${
                          currentPage === pageNum
                            ? "bg-ah-red text-white"
                            : "border border-white/10 bg-black/45 text-gray-400 hover:border-ah-blue hover:text-white"
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-white/10 bg-black/45 p-1.5 transition-colors hover:border-ah-blue disabled:cursor-not-allowed disabled:opacity-40 md:p-2"
                  aria-label="Next page"
                >
                  <FaChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </motion.button>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>

      {/* 30-sec preview popup */}
      <AnimatePresence>
        {previewBeat && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="ah-transmission-panel fixed bottom-20 left-4 right-4 z-30 flex items-center gap-4 border-ah-electric/30 p-4 shadow-2xl shadow-ah-electric/20 backdrop-blur-xl sm:left-auto sm:right-8 sm:max-w-sm md:bottom-8"
          >
            <motion.div
              animate={{ rotate: isPreviewPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="ah-vinyl-disc relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full"
            >
              <Image
                src={previewBeat.cover}
                alt={`${cleanBeatName(previewBeat.name)} preview cover`}
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400">Preview playing</p>
              <p className="font-semibold text-white truncate">{previewBeat.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopPreview}
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
              title="Stop preview"
              aria-label="Stop preview playback"
            >
              <FaTimes />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Modal */}
      <AnimatePresence>
        {mobileModalBeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/88 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] backdrop-blur-xl"
            onClick={closeMobileModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="ah-transmission-panel relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border-ah-red/30 p-6 shadow-2xl md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeMobileModal}
                className="absolute top-4 right-4 p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </motion.button>

              {/* Album art */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-md border border-white/12 shadow-2xl sm:h-48 sm:w-48"
              >
                <Image
                  src={mobileModalBeat.beat.cover}
                  alt={`${cleanBeatName(mobileModalBeat.beat.beatName)} cover art`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-ah-ember/12 to-ah-blue/10" />
              </motion.div>

              {/* Beat info */}
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                  {mobileModalBeat.beat.beatName}
                </h3>
                <p className="text-gray-400">{mobileModalBeat.beat.beatProducer}</p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="rounded-sm border border-ah-blue/20 bg-ah-blue/10 px-3 py-1 text-sm text-ah-blue">
                    {mobileModalBeat.beat.beatKey || "Unknown key"}
                  </span>
                  {mobileModalBeat.beat.beatPerMin && (
                    <span className="text-sm text-gray-500">
                      {mobileModalBeat.beat.beatPerMin} BPM
                    </span>
                  )}
                </div>
              </div>

              {/* Now playing indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-ah-teal"
                />
                <FaVolumeUp className="text-ah-teal" />
                <span className="text-gray-400 text-sm">Now Playing</span>
              </div>

              {/* Warning message */}
              <div className="mb-6 rounded-md border border-ah-ember/30 bg-ah-ember/10 p-4">
                <div className="flex items-start gap-3">
                  <FaHeadphones className="mt-0.5 flex-shrink-0 text-ah-ember" />
                  <div>
                    <p className="mb-1 font-medium text-ah-ember">
                      Vinyl Stage Is Desktop-Optimized
                    </p>
                    <p className="text-sm text-white/68">
                      Mobile preview starts here first so the full visualizer does not surprise the device.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInquiry(mobileModalBeat.beat)}
                  className="ah-ember-button flex w-full items-center justify-center gap-2 rounded-md py-3 font-medium transition-all duration-300"
                >
                  <FaDollarSign />
                  Inquire About This Beat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowVisualizerAnyway(true);
                    closeMobileModal();
                    onBeatSelect(mobileModalBeat.beat.audioFile);
                  }}
                  className="w-full rounded-md bg-ah-magenta py-3 font-medium text-black transition-all duration-300 hover:shadow-ah-glow-magenta"
                >
                  Open Vinyl Stage Anyway
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeMobileModal}
                  className="w-full rounded-md border border-white/14 bg-black/45 py-3 font-medium text-gray-300 transition-all duration-300 hover:border-white/30"
                >
                  Continue Listening
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {inquiryBeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/88 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] backdrop-blur-xl"
            onClick={() => setInquiryBeat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="ah-transmission-panel my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto border-ah-ember/30 p-6 shadow-2xl md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaEnvelope className="text-ah-ember" />
                  Beat Licensing Inquiry
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInquiryBeat(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Beat info */}
              <div className="mb-6 flex flex-col items-start gap-4 rounded-md border border-white/10 bg-black/35 p-4 sm:flex-row sm:items-center">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={inquiryBeat.cover}
                    alt={`${cleanBeatName(inquiryBeat.beatName)} cover art`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white">{cleanBeatName(inquiryBeat.beatName)}</h3>
                  <p className="text-sm text-gray-400">{inquiryBeat.beatProducer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded-sm border border-ah-blue/20 bg-ah-blue/10 px-2 py-0.5 text-xs text-ah-blue">
                      {inquiryBeat.beatKey || "Unknown key"}
                    </span>
                    {inquiryBeat.beatPerMin && (
                      <span className="text-xs text-gray-500">{inquiryBeat.beatPerMin} BPM</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                sendInquiry();
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/45 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-ah-electric focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/45 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-ah-electric focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/45 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-ah-electric focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-md border border-white/10 bg-black/45 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-ah-electric focus:outline-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-ah-red py-3 font-medium text-white transition-all duration-300 hover:shadow-ah-glow-red sm:flex-1"
                  >
                    <FaPaperPlane />
                    Send Inquiry
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInquiryBeat(null)}
                    className="w-full rounded-md border border-white/14 bg-black/45 px-6 py-3 font-medium text-gray-300 transition-all duration-300 hover:border-white/30 sm:w-auto"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your licensing inquiry will open through contact@antiheroes.co
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BeatsList;

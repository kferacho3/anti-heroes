"use client";

import { motion } from "framer-motion";
import { IoMdArrowBack } from "react-icons/io";

interface GoBackButtonProps {
  onClick: () => void;
}

export default function GoBackButton({ onClick }: GoBackButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:border-ah-red/70 hover:text-ah-red"
      aria-label="Return to home"
    >
      <IoMdArrowBack className="text-base" />
      <span>HOME</span>
    </motion.button>
  );
}

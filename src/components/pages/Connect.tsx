"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import {
  FaCheckCircle,
  FaEnvelope,
  FaHandshake,
  FaHeadphones,
  FaMicrophone,
  FaMusic,
  FaQuestionCircle,
  FaTools,
  FaUser,
} from "react-icons/fa";

interface FormData {
  name: string;
  email: string;
  phone: string;
  artistName: string;
  socialLink: string;
  beatInterest: string;
  projectLink: string;
  inquiryType: string;
  subject: string;
  message: string;
}

const inquiryTypes = [
  { value: "beats", label: "Beat Licensing Inquiry", icon: FaMusic },
  { value: "collab", label: "Collaboration Inquiry", icon: FaHandshake },
  { value: "submit", label: "Submit Work Made With A Beat", icon: FaMicrophone },
  { value: "custom", label: "Custom Production", icon: FaHeadphones },
  { value: "engineering", label: "Mix & Master", icon: FaTools },
  { value: "general", label: "General Contact", icon: FaQuestionCircle },
];

export default function Connect() {
  const reduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    artistName: "",
    socialLink: "",
    beatInterest: "",
    projectLink: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<FormData> = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Email is invalid";
    if (!formData.inquiryType) nextErrors.inquiryType = "Please select an inquiry type";
    if (!formData.subject.trim()) nextErrors.subject = "Subject is required";
    if (!formData.message.trim()) nextErrors.message = "Message is required";
    if (!acknowledged) nextErrors.message = nextErrors.message || "Please acknowledge the submission note";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const inquiryLabel =
      inquiryTypes.find((type) => type.value === formData.inquiryType)?.label ||
      formData.inquiryType;
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Artist Name: ${formData.artistName || "Not provided"}
Social / Spotify / SoundCloud: ${formData.socialLink || "Not provided"}
Beat Interested In: ${formData.beatInterest || "Not provided"}
Project / Demo Link: ${formData.projectLink || "Not provided"}
Inquiry Type: ${inquiryLabel}
Acknowledgment: Submitting does not guarantee collaboration, repost, promotion, placement, licensing, or exposure.

Message:
${formData.message}`.trim();

    const mailto = `mailto:contact@antiheroes.co?subject=${encodeURIComponent(
      `[${inquiryLabel}] ${formData.subject}`,
    )}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailto;
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          artistName: "",
          socialLink: "",
          beatInterest: "",
          projectLink: "",
          inquiryType: "",
          subject: "",
          message: "",
        });
        setAcknowledged(false);
      }, 2500);
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/85 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur-xl md:items-center md:p-5"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={reduceMotion ? { duration: 0.18 } : { type: "spring", stiffness: 250, damping: 24 }}
          className="ah-transmission-panel relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain p-4 sm:max-h-[860px] sm:p-5 md:p-8"
        >
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-ah-magenta">Collab & Licensing Portal</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
              Submit The Record Path
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ah-soft">
              Licensing, collaboration, custom production, engineering, and selected-work
              review for projects connected to Anti-Heroes / Xae Neptune.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ah-soft">
                Response Window: 24-48h
              </span>
              <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ah-soft">
                contact@antiheroes.co
              </span>
            </div>
          </header>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="mb-5 flex items-center gap-2 rounded-md border border-ah-electric/40 bg-ah-electric/10 px-4 py-3 text-ah-electric"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              >
                <FaCheckCircle />
                <span className="text-sm">Inquiry opened in your mail app.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ah-soft">
              Selected records may be reviewed for licensing next steps, collaboration opportunities, and potential mutual exposure.
            </p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {inquiryTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      inquiryType: type.value,
                      subject:
                        previous.subject ||
                        `${type.label} Request`,
                    }))
                  }
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-[10px] uppercase tracking-[0.12em] transition sm:text-[11px] sm:tracking-[0.14em] ${
                    formData.inquiryType === type.value
                      ? "border-ah-magenta/45 bg-ah-magenta/10 text-white"
                      : "border-white/12 bg-white/[0.02] text-ah-soft hover:border-ah-electric/40 hover:text-white"
                  }`}
                >
                  <type.icon />
                  {type.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Your Name"
                icon={<FaUser className="text-ah-soft" />}
                error={errors.name}
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass(errors.name)}
                />
              </Field>

              <Field
                label="Email"
                icon={<FaEnvelope className="text-ah-soft" />}
                error={errors.email}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={inputClass(errors.email)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone (Optional)" error={errors.phone}>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={inputClass(errors.phone)}
                />
              </Field>

              <Field label="Artist Name" error={errors.artistName}>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  placeholder="Your artist name"
                  className={inputClass(errors.artistName)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Social / Spotify / SoundCloud" error={errors.socialLink}>
                <input
                  type="url"
                  name="socialLink"
                  value={formData.socialLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={inputClass(errors.socialLink)}
                />
              </Field>

              <Field label="Beat Interested In" error={errors.beatInterest}>
                <input
                  type="text"
                  name="beatInterest"
                  value={formData.beatInterest}
                  onChange={handleChange}
                  placeholder="Beat title or audio link"
                  className={inputClass(errors.beatInterest)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project / Demo Link" error={errors.projectLink}>
                <input
                  type="url"
                  name="projectLink"
                  value={formData.projectLink}
                  onChange={handleChange}
                  placeholder="Private demo, WIP, or release link"
                  className={inputClass(errors.projectLink)}
                />
              </Field>

              <Field label="Inquiry Type" error={errors.inquiryType}>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className={inputClass(errors.inquiryType)}
                >
                  <option value="">Select inquiry type...</option>
                  {inquiryTypes.map((type) => {
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>

            <Field label="Subject" error={errors.subject}>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Your project subject"
                className={inputClass(errors.subject)}
              />
            </Field>

            <Field label="Message" error={errors.message}>
              <textarea
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project, timeline, and goals..."
                className={inputClass(errors.message)}
              />
            </Field>

            <label className="flex items-start gap-3 rounded-md border border-ah-ember/25 bg-ah-ember/10 p-3 text-xs leading-relaxed text-white/74">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 accent-ah-ember"
              />
              <span>
                Submitting does not guarantee collaboration, repost, promotion,
                placement, licensing, or exposure. Selected work may be reviewed for
                potential mutual exposure opportunities and next steps.
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-sm bg-ah-magenta px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:shadow-ah-glow-magenta disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? "Preparing..." : "Send Inquiry"}
              </button>
            </div>

            <div className="flex flex-col items-start gap-2 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.16em] text-ah-soft sm:flex-row sm:items-center sm:justify-between">
              <a
                href="mailto:contact@antiheroes.co"
                className="transition hover:text-white"
              >
                Email Direct
              </a>
              <a
                href="https://www.instagram.com/xaeneptune/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Instagram DM
              </a>
              <a
                href="https://open.spotify.com/artist/7iysPipkcsfGFVEgUMDzHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Spotify Profile
              </a>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-md border bg-black/55 px-4 py-2.5 text-sm text-white placeholder:text-ah-soft/70 focus:outline-none ${
    error ? "border-ah-red" : "border-white/14 focus:border-ah-electric/60"
  }`;
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ah-soft">
        {icon}
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-ah-red">{error}</span>}
    </label>
  );
}

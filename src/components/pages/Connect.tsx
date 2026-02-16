"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
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
  inquiryType: string;
  subject: string;
  message: string;
}

const inquiryTypes = [
  { value: "beats", label: "Beat Purchase/Licensing", icon: FaMusic },
  { value: "collab", label: "Collaboration", icon: FaHandshake },
  { value: "studio", label: "Studio Time", icon: FaClock },
  { value: "engineering", label: "Mix & Master", icon: FaTools },
  { value: "production", label: "Music Production", icon: FaHeadphones },
  { value: "features", label: "Feature Request", icon: FaMicrophone },
  { value: "general", label: "General Inquiry", icon: FaQuestionCircle },
];

export default function Connect() {
  const reduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
Inquiry Type: ${inquiryLabel}

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
          inquiryType: "",
          subject: "",
          message: "",
        });
      }, 2500);
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl md:p-5"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={reduceMotion ? { duration: 0.18 } : { type: "spring", stiffness: 250, damping: 24 }}
          className="ah-card relative h-[92vh] max-h-[860px] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-3xl p-4 sm:p-5 md:p-8"
        >
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Direct Contact</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
              Let&apos;s Connect
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ah-soft">
              Licensing, production, collaboration, and custom project inquiries.
            </p>
          </header>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="mb-5 flex items-center gap-2 rounded-xl border border-ah-blue/40 bg-ah-blue/10 px-4 py-3 text-ah-blue"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-sm bg-ah-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-ah-glow-red disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? "Preparing..." : "Send Inquiry"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-xl border bg-black/55 px-4 py-2.5 text-sm text-white placeholder:text-ah-soft/70 focus:outline-none ${
    error ? "border-ah-red" : "border-white/14 focus:border-ah-blue/60"
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

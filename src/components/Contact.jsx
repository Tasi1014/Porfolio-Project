/**
 * Contact.jsx — Contact section with EmailJS form
 *
 * ============================================================
 *  HOW TO SET UP EMAILJS
 * ============================================================
 *  1. Go to https://www.emailjs.com/ and sign up for a free account
 *  2. Navigate to "Email Services" → Add New Service → select Gmail
 *     - Connect your Gmail account (upadhayayamadhav@gmail.com)
 *     - Copy the SERVICE ID (e.g., "service_abc123")
 *  3. Navigate to "Email Templates" → Create New Template
 *     - Use these template variables:
 *       {{from_name}}  → sender's name
 *       {{from_email}} → sender's email
 *       {{subject}}    → email subject
 *       {{message}}    → email message
 *     - Set "To Email" to: upadhayayamadhav@gmail.com
 *     - Copy the TEMPLATE ID (e.g., "template_xyz789")
 *  4. Navigate to "Account" → "General" tab
 *     - Copy your PUBLIC KEY (e.g., "pk_abcdef123456")
 *  5. Create a .env file in project root with:
 *     VITE_EMAILJS_SERVICE_ID=service_abc123
 *     VITE_EMAILJS_TEMPLATE_ID=template_xyz789
 *     VITE_EMAILJS_PUBLIC_KEY=pk_abcdef123456
 *  6. Restart the dev server after adding .env values
 * ============================================================
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  HiMail,
  HiLocationMarker,
  HiArrowRight,
} from "react-icons/hi";
import {
  FaInstagram,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import TextReveal from "./animations/TextReveal";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const socials = [
  { icon: <FaInstagram />, url: "https://www.instagram.com/destenmadhav/", label: "Instagram" },
  { icon: <FaTiktok />, url: "https://www.tiktok.com/@madhav_visuals?_r=1&_t=ZS-9616wDT8ajl", label: "TikTok" },
  { icon: <FaLinkedinIn />, url: "https://www.linkedin.com/in/madhav-upadhyaya-243ba3327?utm_source=share_via&utm_content=profile&utm_medium=member_android", label: "LinkedIn" },
];

export default function Contact() {
  const formRef = useRef();
  const [form, setForm] = useState({
    from_name: "",
    from_email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.from_name.trim()) errs.from_name = "Name is required";
    if (!form.from_email.trim()) errs.from_email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.from_email))
      errs.from_email = "Invalid email format";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setToast({ type: "success", msg: "Message sent! I'll get back to you soon. ✓" });
      setForm({ from_name: "", from_email: "", subject: "", message: "" });
    } catch (err) {
      console.error("EmailJS Error:", err);
      setToast({ type: "error", msg: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const inputClasses =
    "w-full bg-bg-primary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent transition-colors";

  return (
    <section id="contact" className="section-padding border-t border-border">
      <div className="container-max">
        {/* Section Label */}
        <motion.p
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          03 / Contact
        </motion.p>

        <TextReveal
          text="Let's Work Together"
          tag="h2"
          className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
        />
        <motion.p
          className="text-text-secondary text-sm sm:text-base mb-10 max-w-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Have a project in mind? Let&apos;s make something great.
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* ---- LEFT: Contact Info ---- */}
          <motion.div
            className="lg:w-[38%] flex flex-col gap-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 text-text-secondary">
              <HiMail className="text-accent text-lg shrink-0" />
              <span className="text-sm">upadhayayamadhav@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <HiLocationMarker className="text-accent text-lg shrink-0" />
              <span className="text-sm">Kathmandu, Nepal</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-3">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-text-secondary hover:text-accent hover:border-accent transition-all"
                  aria-label={s.label}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>

            {/* Personal Quote */}
            <p className="text-text-secondary/60 text-sm italic mt-4 border-l-2 border-accent/30 pl-4">
              &ldquo;Every great project starts with a conversation.&rdquo;
            </p>
          </motion.div>

          {/* ---- RIGHT: Contact Form ---- */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            className="lg:w-[62%] flex flex-col gap-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Name & Email side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="from_name"
                  placeholder="Full Name"
                  value={form.from_name}
                  onChange={handleChange}
                  className={inputClasses}
                />
                {errors.from_name && (
                  <p className="text-error text-xs mt-1">{errors.from_name}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="from_email"
                  placeholder="Email Address"
                  value={form.from_email}
                  onChange={handleChange}
                  className={inputClasses}
                />
                {errors.from_email && (
                  <p className="text-error text-xs mt-1">{errors.from_email}</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClasses}
              />
              {errors.subject && (
                <p className="text-error text-xs mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                placeholder="Your message..."
                rows={5}
                value={form.message}
                onChange={handleChange}
                className={`${inputClasses} resize-none`}
              />
              {errors.message && (
                <p className="text-error text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 bg-accent text-bg-primary font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <ImSpinner8 className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Message <HiArrowRight />
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl text-sm font-medium shadow-xl ${
              toast.type === "success"
                ? "bg-success text-white"
                : "bg-error text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/**
 * AdminDashboard.jsx — Portfolio content management (Full CRUD)
 * Features:
 *  - CREATE: Add project with Cloudinary image upload & Google Drive video link
 *  - READ:   Real-time Firestore listener with stats + filter tabs
 *  - UPDATE: Edit all fields, replace thumbnail, update Google Drive video link
 *  - DELETE: Delete with confirmation via projectService
 *  - PREVIEW: Same VideoModal (Google Drive iframe) / ImageLightbox as public portfolio
 *  - Quick Google Drive link update directly from project card
 */

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useProjects } from "../../hooks/useProjects";
import {
  createProject,
  updateProject,
  deleteProject,
  extractDriveFileId,
  getDrivePreviewUrl,
} from "../../services/projectService";
import VideoModal from "../../components/VideoModal";
import ImageLightbox from "../../components/ImageLightbox";
import {
  HiPlus,
  HiTrash,
  HiLogout,
  HiX,
  HiPhotograph,
  HiCheckCircle,
  HiPencil,
  HiEye,
  HiLink,
} from "react-icons/hi";
import { RiAdminLine } from "react-icons/ri";
import { FaVideo, FaPalette } from "react-icons/fa";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Video Editing", "Graphic Design"];
const TABS = ["All", ...CATEGORIES];

const categoryIcons = {
  "Video Editing": <FaVideo className="text-blue-400" />,
  "Graphic Design": <FaPalette className="text-amber-400" />,
};

const categoryColors = {
  "Graphic Design": "#f5a623",
  "Video Editing": "#3b82f6",
};

// ── Upload Progress Bar (Images only) ──────────────────────────────────────────
function UploadProgress({ label, progress, done }) {
  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-bg-elevated/70 border border-white/5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span
          className={`font-[family-name:var(--font-mono)] text-[11px] font-bold ${
            done ? "text-green-400" : "text-accent"
          }`}
        >
          {done ? "Completed" : `${progress}%`}
        </span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
        <motion.div
          className={`h-full rounded-full ${
            done
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : "bg-gradient-to-r from-accent via-amber-400 to-yellow-300"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.2 }}
        />
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirm({ project, onConfirm, onCancel, deleting }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-red-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
            <HiTrash className="text-red-400 text-xl sm:text-2xl" />
          </span>
          <div>
            <h3 className="font-bold text-text-primary text-base sm:text-lg">Delete Project?</h3>
            <p className="text-text-secondary text-[11px] sm:text-xs">Permanent deletion</p>
          </div>
        </div>
        <p className="text-text-secondary text-xs sm:text-sm mb-6 leading-relaxed">
          <span className="text-text-primary font-medium">"{project.title}"</span> will be
          permanently removed from your Firestore database and live portfolio.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary border border-white/10 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Quick Google Drive Video Link Modal ─────────────────────────────────────────
function QuickDriveLinkModal({ project, onClose }) {
  const [driveUrl, setDriveUrl] = useState(
    project.driveUrl || (project.driveFileId ? getDrivePreviewUrl(project.driveFileId) : "")
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const fileId = extractDriveFileId(driveUrl);
    if (!fileId) {
      setError("Please paste a valid Google Drive link (e.g. https://drive.google.com/file/d/.../view).");
      return;
    }

    setSaving(true);
    try {
      await updateProject(project.id, {
        driveFileId: fileId,
        driveUrl: driveUrl.trim(),
        videoUrl: getDrivePreviewUrl(fileId),
      });
      setDone(true);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full sm:max-w-md shadow-2xl overflow-hidden"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-text-primary text-base sm:text-lg">Google Drive Video Link</h3>
            <p className="text-text-secondary text-xs truncate max-w-[240px] mt-0.5">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition cursor-pointer"
          >
            <HiX />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(34,197,94,0.25)]"
            >
              <HiCheckCircle className="text-green-400 text-4xl" />
            </motion.div>
            <h4 className="text-lg font-bold text-white mb-1">Drive Link Saved!</h4>
            <p className="text-xs text-text-secondary">Video is now playable via Google Drive on your portfolio.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Google Drive Share URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
                <HiLink className="absolute left-3 top-3.5 text-text-secondary text-base" />
              </div>
              <p className="text-[10px] text-text-secondary/70 mt-1.5 leading-relaxed">
                Make sure file sharing is set to <strong>"Anyone with the link can view"</strong> in Google Drive.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-accent text-bg-primary font-bold rounded-xl sm:rounded-2xl text-sm hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-accent/20"
            >
              {saving ? "Saving Link..." : "Save Drive Link"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Edit Project Modal ─────────────────────────────────────────────────────────
function EditProjectModal({ project, onClose }) {
  const [form, setForm] = useState({
    title: project.title || "",
    brand: project.brand || "",
    description: project.description || "",
    category: project.category || "Video Editing",
    tags: (project.tags || []).join(", "),
    tools: (project.tools || []).join(", "),
  });

  // Google Drive Link
  const [driveUrl, setDriveUrl] = useState(
    project.driveUrl || (project.driveFileId ? getDrivePreviewUrl(project.driveFileId) : "")
  );

  // Thumbnail
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(project.thumbnail || null);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [thumbDone, setThumbDone] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const thumbRef = useRef();
  const isVideo = form.category === "Video Editing";

  const handleChange = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    // Form validations
    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }
    if (!form.brand.trim()) {
      setError("Brand/Client name is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!thumbPreview && !thumbFile) {
      setError("Thumbnail image is required.");
      return;
    }

    let driveFileId = project.driveFileId || null;
    let finalVideoUrl = project.videoUrl || null;

    if (isVideo) {
      if (!driveUrl.trim()) {
        setError("Google Drive video link is required for Video Editing projects.");
        return;
      }
      const extractedId = extractDriveFileId(driveUrl);
      if (!extractedId) {
        setError("Please enter a valid Google Drive video share link.");
        return;
      }
      driveFileId = extractedId;
      finalVideoUrl = getDrivePreviewUrl(extractedId);
    }

    setSaving(true);

    try {
      let thumbnailUrl = project.thumbnail;
      if (thumbFile) {
        const { url } = await uploadToCloudinary(thumbFile, setThumbProgress);
        thumbnailUrl = url;
        setThumbDone(true);
      }

      const updates = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.category === "Video Editing" ? "video" : "graphic",
        thumbnail: thumbnailUrl,
        driveFileId: isVideo ? driveFileId : null,
        driveUrl: isVideo ? driveUrl.trim() : null,
        videoUrl: isVideo ? finalVideoUrl : null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
      };

      await updateProject(project.id, updates);
      setSuccess(true);
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      console.error(err);
      setError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-white/10 rounded-t-[28px] sm:rounded-3xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto my-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-bg-card/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <HiPencil className="text-blue-400 text-base" />
            </span>
            <div>
              <h2 className="font-bold text-text-primary text-base sm:text-lg">Edit Project</h2>
              <p className="text-text-secondary text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-[300px]">
                {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition cursor-pointer"
          >
            <HiX className="text-base" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center flex-1">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
            >
              <HiCheckCircle className="text-green-400 text-5xl sm:text-6xl" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">
              Changes Saved!
            </h3>
            <p className="text-text-secondary text-xs sm:text-sm max-w-xs sm:max-w-sm mb-6 leading-relaxed">
              Your updates are now live on your portfolio.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold font-[family-name:var(--font-mono)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE ON WEBSITE
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
            {/* Category selection (Video Editing & Graphic Design only) */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`py-3 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      form.category === cat
                        ? "bg-accent/15 border-accent text-accent shadow-sm shadow-accent/20"
                        : "bg-bg-elevated/70 border-white/5 text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    <span className="text-base sm:text-lg">{categoryIcons[cat]}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Title <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo Editing"
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Brand / Client <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TasiGo"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Description <span className="text-accent">*</span>
              </label>
              <textarea
                placeholder="Brief project summary..."
                value={form.description}
                onChange={handleChange("description")}
                required
                rows={3}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none leading-relaxed"
              />
            </div>

            {/* Google Drive Video Link (Required for Video Editing) */}
            {isVideo && (
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Google Drive Video Link <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    required={isVideo}
                    className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                  />
                  <HiLink className="absolute left-3 top-3.5 text-text-secondary text-base" />
                </div>
                <p className="text-[10px] text-text-secondary/70 mt-1.5 leading-relaxed">
                  Provide share link with access set to <strong>"Anyone with the link can view"</strong>.
                </p>
              </div>
            )}

            {/* Tags + Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tags <span className="text-[10px] text-text-secondary/60 lowercase font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={handleChange("tags")}
                  placeholder="e.g. ColorGrading, Promo"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tools Used <span className="text-[10px] text-text-secondary/60 lowercase font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tools}
                  onChange={handleChange("tools")}
                  placeholder="e.g. Photoshop, Premiere Pro"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Thumbnail Image <span className="text-accent">*</span>
              </label>
              <div
                onClick={() => thumbRef.current?.click()}
                className="relative border-2 border-dashed border-white/15 hover:border-accent/60 bg-bg-elevated/40 rounded-2xl overflow-hidden cursor-pointer transition group"
              >
                {thumbPreview ? (
                  <div className="relative h-32 sm:h-36">
                    <img src={thumbPreview} alt="thumb" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20">
                        Click to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center gap-1.5 text-text-secondary">
                    <HiPhotograph className="text-3xl text-text-muted" />
                    <p className="text-xs font-medium text-text-primary">Click to upload thumbnail</p>
                    <p className="text-[10px] text-text-secondary/60">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
              {thumbProgress > 0 && (
                <div className="mt-2.5">
                  <UploadProgress label="Uploading thumbnail..." progress={thumbProgress} done={thumbDone} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </motion.p>
            )}

            {/* Save Button */}
            <div className="pt-2 sticky bottom-0 bg-bg-card/90 backdrop-blur-md pb-1">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 sm:py-4 bg-accent text-bg-primary font-bold rounded-xl sm:rounded-2xl text-sm sm:text-base hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-accent/25"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Add Project Modal ──────────────────────────────────────────────────────────
function AddProjectModal({ onClose, nextOrder }) {
  const [form, setForm] = useState({
    title: "",
    brand: "",
    description: "",
    category: "Video Editing",
    tags: "",
    tools: "",
  });

  // Google Drive Video Link
  const [driveUrl, setDriveUrl] = useState("");

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [thumbDone, setThumbDone] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const thumbRef = useRef();
  const isVideo = form.category === "Video Editing";

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Form validation
    if (!form.title.trim()) {
      setError("Please enter a project title.");
      return;
    }
    if (!form.brand.trim()) {
      setError("Please enter a brand / client name.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please enter a short description.");
      return;
    }
    if (!thumbnailFile) {
      setError("Please select a thumbnail image.");
      return;
    }

    let driveFileId = null;
    let videoUrl = null;

    if (isVideo) {
      if (!driveUrl.trim()) {
        setError("Please enter a Google Drive video link for Video Editing projects.");
        return;
      }
      const extractedId = extractDriveFileId(driveUrl);
      if (!extractedId) {
        setError("Please provide a valid Google Drive video link (e.g. https://drive.google.com/file/d/.../view).");
        return;
      }
      driveFileId = extractedId;
      videoUrl = getDrivePreviewUrl(extractedId);
    }

    setUploading(true);

    try {
      // 1. Upload thumbnail to Cloudinary
      const { url: thumbUrl } = await uploadToCloudinary(thumbnailFile, setThumbProgress);
      setThumbDone(true);

      // 2. Create document in Firestore
      await createProject({
        order: nextOrder,
        type: isVideo ? "video" : "graphic",
        category: form.category,
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        thumbnail: thumbUrl,
        driveFileId,
        driveUrl: isVideo ? driveUrl.trim() : null,
        videoUrl,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
      });

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-white/10 rounded-t-[28px] sm:rounded-3xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto my-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-bg-card/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
              <HiPlus className="text-accent text-lg" />
            </span>
            <div>
              <h2 className="font-bold text-text-primary text-base sm:text-lg">Add Project</h2>
              <p className="text-text-secondary text-[11px] sm:text-xs">Publish to live portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition cursor-pointer"
          >
            <HiX className="text-base" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center flex-1">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
            >
              <HiCheckCircle className="text-green-400 text-5xl sm:text-6xl" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">
              Project Added Successfully!
            </h3>
            <p className="text-text-secondary text-xs sm:text-sm max-w-xs sm:max-w-sm mb-6 leading-relaxed">
              Your new project is now stored in Firestore and published to your live portfolio.
            </p>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold font-[family-name:var(--font-mono)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE ON PORTFOLIO
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
            {/* Category selection (Video Editing & Graphic Design only) */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`py-3 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      form.category === cat
                        ? "bg-accent/15 border-accent text-accent shadow-sm shadow-accent/20"
                        : "bg-bg-elevated/70 border-white/5 text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    <span className="text-base sm:text-lg">{categoryIcons[cat]}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Title <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo Editing"
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Brand / Client <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TasiGo"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Description <span className="text-accent">*</span>
              </label>
              <textarea
                placeholder="Brief project summary..."
                value={form.description}
                onChange={handleChange("description")}
                required
                rows={3}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none leading-relaxed"
              />
            </div>

            {/* Google Drive Video Link (Required for Video Editing) */}
            {isVideo && (
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Google Drive Video Link <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    required={isVideo}
                    className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                  />
                  <HiLink className="absolute left-3 top-3.5 text-text-secondary text-base" />
                </div>
                <p className="text-[10px] text-text-secondary/70 mt-1.5 leading-relaxed">
                  Provide share link with access set to <strong>"Anyone with the link can view"</strong>.
                </p>
              </div>
            )}

            {/* Tags + Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tags <span className="text-[10px] text-text-secondary/60 lowercase font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ColorGrading, Reel"
                  value={form.tags}
                  onChange={handleChange("tags")}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Tools Used <span className="text-[10px] text-text-secondary/60 lowercase font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photoshop, Premiere Pro"
                  value={form.tools}
                  onChange={handleChange("tools")}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-bg-elevated/80 border border-white/10 rounded-xl sm:rounded-2xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
                />
              </div>
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Thumbnail Image <span className="text-accent">*</span>
              </label>
              <div
                onClick={() => thumbRef.current?.click()}
                className="relative border-2 border-dashed border-white/15 hover:border-accent/60 bg-bg-elevated/40 rounded-2xl overflow-hidden cursor-pointer transition group"
              >
                {thumbnailPreview ? (
                  <div className="relative h-32 sm:h-36">
                    <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20">
                        Click to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center gap-1.5 text-text-secondary">
                    <HiPhotograph className="text-3xl text-text-muted" />
                    <p className="text-xs font-medium text-text-primary">Click to upload thumbnail</p>
                    <p className="text-[10px] text-text-secondary/60">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
              {thumbProgress > 0 && (
                <div className="mt-2.5">
                  <UploadProgress label="Uploading thumbnail..." progress={thumbProgress} done={thumbDone} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <div className="pt-2 sticky bottom-0 bg-bg-card/90 backdrop-blur-md pb-1">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 sm:py-4 bg-accent text-bg-primary font-bold rounded-xl sm:rounded-2xl text-sm sm:text-base hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-accent/25"
              >
                {uploading ? "Uploading & Saving Project..." : "Add Project"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Admin Project Card ─────────────────────────────────────────────────────────
function AdminProjectCard({ project, onDelete, onEdit, onPreview, onQuickDriveLink }) {
  const catColor = categoryColors[project.category] || "#f5a623";
  const isVideo = project.type === "video";
  const hasVideo = Boolean(project.driveFileId || project.videoUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-bg-elevated/70 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden group flex flex-col hover:border-white/20 transition-all duration-300 shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0 bg-black/40">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image";
          }}
        />

        {/* Hover overlay — Preview button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPreview(project)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/30 rounded-full text-white text-xs font-semibold backdrop-blur-sm hover:bg-white/25 transition cursor-pointer"
          >
            <HiEye className="text-sm" /> Preview
          </button>
        </div>

        {/* Status / Drive link badge */}
        <div className="absolute top-2.5 left-2.5">
          {isVideo && !hasVideo ? (
            <button
              onClick={() => onQuickDriveLink(project)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-[family-name:var(--font-mono)] bg-amber-400 text-black hover:bg-amber-300 transition cursor-pointer shadow-md flex items-center gap-1"
              title="Click to add Google Drive video link"
            >
              <HiLink className="text-xs" /> + DRIVE LINK
            </button>
          ) : isVideo ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-[family-name:var(--font-mono)] bg-emerald-500 text-black shadow-md flex items-center gap-1">
              <HiCheckCircle className="text-xs" /> LIVE (DRIVE)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-[family-name:var(--font-mono)] bg-emerald-500 text-black shadow-md">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex-1 min-w-0 mb-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-2 font-[family-name:var(--font-mono)]"
            style={{ backgroundColor: catColor + "20", color: catColor }}
          >
            {project.category}
          </span>
          <h3 className="font-bold text-text-primary text-sm sm:text-base line-clamp-1">{project.title}</h3>
          <p className="text-text-secondary text-xs font-medium">{project.brand}</p>
          <p className="text-text-secondary/70 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <button
            onClick={() => onPreview(project)}
            title="Preview"
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HiEye className="text-sm" /> Preview
          </button>
          <button
            onClick={() => onEdit(project)}
            title="Edit"
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HiPencil className="text-sm" /> Edit
          </button>
          <button
            onClick={() => onDelete(project)}
            title="Delete"
            className="w-10 py-2 sm:py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center shrink-0"
          >
            <HiTrash className="text-sm" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { projects, loading } = useProjects();
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [quickDriveTarget, setQuickDriveTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.category === activeTab);
  }, [activeTab, projects]);

  const graphicProjects = useMemo(
    () => projects.filter((p) => p.type === "graphic"),
    [projects]
  );

  const handlePreview = (project) => setPreviewTarget(project);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const nextOrder = useMemo(() => {
    if (!projects.length) return 1;
    return Math.max(...projects.map((p) => p.order || 0)) + 1;
  }, [projects]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-bg-card/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
              <RiAdminLine className="text-accent text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-sm sm:text-base leading-tight">Madhav Admin</h1>
              <p className="text-text-secondary text-[10px] sm:text-xs font-[family-name:var(--font-mono)]">
                {projects.length} total projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-accent text-bg-primary rounded-xl text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md shadow-accent/20"
            >
              <HiPlus className="text-base" />
              <span>Add Project</span>
            </motion.button>

            <button
              onClick={() => signOut(auth)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bg-elevated border border-white/10 flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
              title="Sign out"
            >
              <HiLogout className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Stats & Content ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Stats Grid — Clean 3-column stats without "Videos Missing" or "Content Writing" */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          {[
            { label: "Total Projects", value: projects.length, color: "#a78bfa" },
            {
              label: "Video Editing",
              value: projects.filter((p) => p.category === "Video Editing").length,
              color: "#3b82f6",
            },
            {
              label: "Graphic Design",
              value: projects.filter((p) => p.category === "Graphic Design").length,
              color: "#f5a623",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-card/70 border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm"
            >
              <p
                className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]"
                style={{ color: stat.color }}
              >
                {loading ? "—" : stat.value}
              </p>
              <p className="text-text-secondary text-[11px] sm:text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === tab
                  ? "bg-accent text-bg-primary shadow-md shadow-accent/20"
                  : "bg-bg-card border border-white/10 text-text-secondary hover:text-white hover:border-white/20"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({projects.filter((p) => p.category === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Projects Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-12">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-card border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-bg-elevated" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-bg-elevated rounded w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded w-2/3" />
                  <div className="h-3 bg-bg-elevated rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4 bg-bg-card/40 border border-white/10 rounded-3xl mb-12">
            <p className="text-text-secondary font-[family-name:var(--font-mono)] text-sm">
              No projects in Firestore yet.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2.5 bg-accent text-bg-primary rounded-xl text-xs sm:text-sm font-bold hover:brightness-110 transition cursor-pointer shadow-lg shadow-accent/20"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-16"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <AdminProjectCard
                  key={project.id}
                  project={project}
                  onDelete={setDeleteTarget}
                  onEdit={setEditTarget}
                  onPreview={handlePreview}
                  onQuickDriveLink={setQuickDriveTarget}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <AddProjectModal onClose={() => setShowAddModal(false)} nextOrder={nextOrder} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTarget && (
          <EditProjectModal project={editTarget} onClose={() => setEditTarget(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickDriveTarget && (
          <QuickDriveLinkModal project={quickDriveTarget} onClose={() => setQuickDriveTarget(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            project={deleteTarget}
            deleting={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Preview — reuse same VideoModal (Google Drive iframe) / ImageLightbox as portfolio */}
      <AnimatePresence>
        {previewTarget && previewTarget.type === "video" && (
          <VideoModal project={previewTarget} onClose={() => setPreviewTarget(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewTarget && previewTarget.type === "graphic" && (
          <ImageLightbox
            graphicProjects={graphicProjects}
            currentIndex={graphicProjects.findIndex((p) => p.id === previewTarget.id)}
            onClose={() => setPreviewTarget(null)}
            onNavigate={(i) => setPreviewTarget(graphicProjects[i])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

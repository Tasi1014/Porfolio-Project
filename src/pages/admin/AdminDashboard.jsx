/**
 * AdminDashboard.jsx — Portfolio content management (Full CRUD)
 * Features:
 *  - CREATE: Add project with Cloudinary upload (thumbnail + video)
 *  - READ:   Real-time Firestore listener with stats + filter tabs
 *  - UPDATE: Edit all fields + replace thumbnail/video
 *  - DELETE: Delete with confirmation
 *  - PREVIEW: Same VideoModal / ImageLightbox as the public portfolio
 *  - Quick video upload directly from the card (NO VIDEO badge)
 */

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useProjects } from "../../hooks/useProjects";
import VideoModal from "../../components/VideoModal";
import ImageLightbox from "../../components/ImageLightbox";
import {
  HiPlus,
  HiTrash,
  HiLogout,
  HiX,
  HiPhotograph,
  HiVideoCamera,
  HiCheckCircle,
  HiPencil,
  HiEye,
} from "react-icons/hi";
import { RiAdminLine } from "react-icons/ri";
import { FaVideo, FaPalette, FaPencilAlt } from "react-icons/fa";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Video Editing", "Graphic Design", "Content Writing"];
const TABS = ["All", ...CATEGORIES];

const categoryIcons = {
  "Video Editing": <FaVideo className="text-blue-400" />,
  "Graphic Design": <FaPalette className="text-yellow-400" />,
  "Content Writing": <FaPencilAlt className="text-green-400" />,
};

const categoryColors = {
  "Graphic Design": "#f5a623",
  "Video Editing": "#3b82f6",
  "Content Writing": "#22c55e",
};

// ── Upload Progress Bar ────────────────────────────────────────────────────────
function UploadProgress({ label, progress, done }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <span>{done ? "✅ Done" : `${progress}%`}</span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ── Shared File Upload Field ───────────────────────────────────────────────────
function FileUploadField({ label, accept, icon: Icon, file, preview, onClick, hint, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div
        onClick={onClick}
        className="relative border-2 border-dashed border-border hover:border-accent/60 rounded-xl overflow-hidden cursor-pointer transition group"
      >
        {preview ? (
          <div className="relative h-32">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <p className="text-white text-xs font-medium">Click to replace</p>
            </div>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-1.5 text-text-secondary">
            <Icon className={`text-2xl ${file ? "text-accent" : ""}`} />
            {file ? (
              <div className="text-center px-3">
                <p className="text-xs text-accent font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-text-secondary/50 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB — Click to change
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs">{hint}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirm({ project, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <HiTrash className="text-red-400 text-xl" />
          </span>
          <h3 className="font-bold text-text-primary text-lg">Delete Project?</h3>
        </div>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          <span className="text-text-primary font-medium">"{project.title}"</span> will be
          permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary border border-border text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Quick Video Upload Modal ───────────────────────────────────────────────────
function QuickVideoUpload({ project, onClose }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadToCloudinary(file, setProgress);
      await updateDoc(doc(db, "projects", project.id), { videoUrl: url });
      setDone(true);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-text-primary">Upload Video</h3>
            <p className="text-text-secondary text-xs mt-0.5">{project.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
            <HiX />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <HiCheckCircle className="text-green-400 text-5xl" />
            <p className="text-text-primary font-semibold">Video Uploaded!</p>
          </div>
        ) : (
          <>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent/60 rounded-xl cursor-pointer transition mb-4"
            >
              <div className="h-24 flex flex-col items-center justify-center gap-2 text-text-secondary">
                <HiVideoCamera className={`text-3xl ${file ? "text-accent" : ""}`} />
                {file ? (
                  <div className="text-center px-4">
                    <p className="text-xs text-accent font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-text-secondary/50">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs">Click to select video</p>
                    <p className="text-[10px] text-text-secondary/50">MP4, MOV, WEBM (max 500MB)</p>
                  </>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />

            {progress > 0 && (
              <div className="mb-4">
                <UploadProgress label="Uploading..." progress={progress} done={done} />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : "Upload Video"}
            </button>
          </>
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

  // Thumbnail
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(project.thumbnail || null);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [thumbDone, setThumbDone] = useState(false);

  // Video
  const [videoFile, setVideoFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDone, setVideoDone] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const thumbRef = useRef();
  const videoRef = useRef();

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
    setSaving(true);
    setError("");

    try {
      let thumbnailUrl = project.thumbnail;
      let videoUrl = removeVideo ? null : project.videoUrl;

      // Upload new thumbnail if selected
      if (thumbFile) {
        const { url } = await uploadToCloudinary(thumbFile, setThumbProgress);
        thumbnailUrl = url;
        setThumbDone(true);
      }

      // Upload new video if selected
      if (videoFile) {
        const { url } = await uploadToCloudinary(videoFile, setVideoProgress);
        videoUrl = url;
        setVideoDone(true);
      }

      const updates = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.category === "Video Editing" ? "video" : "graphic",
        thumbnail: thumbnailUrl,
        videoUrl,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "projects", project.id), updates);
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
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <HiPencil className="text-blue-400 text-lg" />
            </span>
            <div>
              <h2 className="font-bold text-text-primary text-base">Edit Project</h2>
              <p className="text-text-secondary text-[10px]">{project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary transition cursor-pointer">
            <HiX />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
              <HiCheckCircle className="text-green-400 text-6xl" />
            </motion.div>
            <p className="text-text-primary font-semibold text-lg">Changes Saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex flex-col items-center gap-1 ${
                      form.category === cat
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-accent/50"
                    }`}
                  >
                    <span className="text-base">{categoryIcons[cat]}</span>
                    {cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Brand */}
            <div className="grid grid-cols-2 gap-3">
              {[["title", "Title", "Brand Promo"], ["brand", "Brand", "Client Name"]].map(([field, label, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    type="text"
                    placeholder={ph}
                    value={form[field]}
                    onChange={handleChange(field)}
                    required
                    className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition"
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Short description..."
                value={form.description}
                onChange={handleChange("description")}
                required
                rows={3}
                className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition resize-none"
              />
            </div>

            {/* Tags + Tools */}
            <div className="grid grid-cols-2 gap-3">
              {[["tags", "Tags"], ["tools", "Tools"]].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    {label} <span className="normal-case font-normal">(comma sep.)</span>
                  </label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={handleChange(field)}
                    placeholder={field === "tags" ? "Reel, Promo" : "Premiere Pro"}
                    className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition"
                  />
                </div>
              ))}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Thumbnail</label>
              <div
                onClick={() => thumbRef.current?.click()}
                className="relative border-2 border-dashed border-border hover:border-accent/60 rounded-xl overflow-hidden cursor-pointer transition group"
              >
                {thumbPreview ? (
                  <div className="relative h-32">
                    <img src={thumbPreview} alt="thumb" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-xs font-medium">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center gap-1.5 text-text-secondary">
                    <HiPhotograph className="text-2xl" />
                    <p className="text-xs">Click to upload thumbnail</p>
                  </div>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
              {thumbProgress > 0 && (
                <div className="mt-2">
                  <UploadProgress label="Uploading thumbnail..." progress={thumbProgress} done={thumbDone} />
                </div>
              )}
            </div>

            {/* Video Section (Video Editing only) */}
            {isVideo && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Video</label>

                {/* Current video status */}
                {project.videoUrl && !removeVideo && (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-3">
                    <div className="flex items-center gap-2">
                      <HiCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                      <div>
                        <p className="text-green-400 text-xs font-semibold">Video uploaded</p>
                        <p className="text-text-secondary/60 text-[10px] truncate max-w-[180px]">{project.videoUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemoveVideo(true)}
                      className="text-red-400 text-[10px] hover:underline cursor-pointer flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {removeVideo && (
                  <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
                    <p className="text-red-400 text-xs">Video will be removed on save.</p>
                    <button type="button" onClick={() => setRemoveVideo(false)} className="text-accent text-[10px] hover:underline cursor-pointer">
                      Undo
                    </button>
                  </div>
                )}

                {/* New video upload */}
                <div onClick={() => videoRef.current?.click()} className="border-2 border-dashed border-border hover:border-accent/60 rounded-xl cursor-pointer transition">
                  <div className="h-20 flex flex-col items-center justify-center gap-1.5 text-text-secondary">
                    <HiVideoCamera className={`text-2xl ${videoFile ? "text-accent" : ""}`} />
                    {videoFile ? (
                      <div className="text-center px-4">
                        <p className="text-xs text-accent font-medium truncate max-w-[200px]">{videoFile.name}</p>
                        <p className="text-[10px] text-text-secondary/50">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <p className="text-xs">{project.videoUrl ? "Click to replace video" : "Click to upload video"}</p>
                    )}
                  </div>
                </div>
                <input ref={videoRef} type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
                {videoProgress > 0 && (
                  <div className="mt-2">
                    <UploadProgress label="Uploading video..." progress={videoProgress} done={videoDone} />
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-accent text-bg-primary font-semibold rounded-xl text-sm hover:brightness-110 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Saving changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
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

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbDone, setThumbDone] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const thumbRef = useRef();
  const videoRef = useRef();
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
    if (!thumbnailFile) { setError("Please select a thumbnail image."); return; }
    if (isVideo && !videoFile) { setError("Please select a video file."); return; }

    setUploading(true);
    setError("");

    try {
      const { url: thumbUrl } = await uploadToCloudinary(thumbnailFile, setThumbProgress);
      setThumbDone(true);

      let videoUrl = null;
      if (isVideo && videoFile) {
        const { url } = await uploadToCloudinary(videoFile, setVideoProgress);
        videoUrl = url;
        setVideoDone(true);
      }

      await addDoc(collection(db, "projects"), {
        order: nextOrder,
        type: isVideo ? "video" : "graphic",
        category: form.category,
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        thumbnail: thumbUrl,
        videoUrl,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <HiPlus className="text-accent text-lg" />
            </span>
            <h2 className="font-bold text-text-primary text-lg">Add Project</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary transition cursor-pointer">
            <HiX />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
              <HiCheckCircle className="text-green-400 text-6xl" />
            </motion.div>
            <p className="text-text-primary font-semibold text-lg">Project Added!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer flex flex-col items-center gap-1 ${
                      form.category === cat
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-accent/50"
                    }`}
                  >
                    <span className="text-base">{categoryIcons[cat]}</span>
                    {cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[["title", "Title", "Brand Promo"], ["brand", "Brand", "Client Name"]].map(([field, label, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">{label}</label>
                  <input type="text" placeholder={ph} value={form[field]} onChange={handleChange(field)} required
                    className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
              <textarea placeholder="Short description..." value={form.description} onChange={handleChange("description")} required rows={3}
                className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[["tags", "Tags", "Reel, Promo"], ["tools", "Tools", "Premiere Pro"]].map(([field, label, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    {label} <span className="normal-case font-normal">(comma sep.)</span>
                  </label>
                  <input type="text" placeholder={ph} value={form[field]} onChange={handleChange(field)}
                    className="w-full px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent transition"
                  />
                </div>
              ))}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Thumbnail Image <span className="text-red-400">*</span>
              </label>
              <div onClick={() => thumbRef.current?.click()} className="relative border-2 border-dashed border-border hover:border-accent/60 rounded-xl overflow-hidden cursor-pointer transition group">
                {thumbnailPreview ? (
                  <div className="relative h-36">
                    <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-xs font-medium">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center gap-2 text-text-secondary">
                    <HiPhotograph className="text-3xl" />
                    <p className="text-xs">Click to upload thumbnail</p>
                    <p className="text-[10px] text-text-secondary/50">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
              {thumbProgress > 0 && <div className="mt-2"><UploadProgress label="Uploading thumbnail..." progress={thumbProgress} done={thumbDone} /></div>}
            </div>

            {/* Video */}
            {isVideo && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                  Video File <span className="text-red-400">*</span>
                </label>
                <div onClick={() => videoRef.current?.click()} className="border-2 border-dashed border-border hover:border-accent/60 rounded-xl cursor-pointer transition group">
                  <div className="h-24 flex flex-col items-center justify-center gap-2 text-text-secondary">
                    <HiVideoCamera className={`text-3xl ${videoFile ? "text-accent" : ""}`} />
                    {videoFile ? (
                      <div className="text-center">
                        <p className="text-xs text-accent font-medium">{videoFile.name}</p>
                        <p className="text-[10px] text-text-secondary/50 mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs">Click to upload video</p>
                        <p className="text-[10px] text-text-secondary/50">MP4, MOV, WEBM (max 500MB)</p>
                      </>
                    )}
                  </div>
                </div>
                <input ref={videoRef} type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
                {videoProgress > 0 && <div className="mt-2"><UploadProgress label="Uploading video..." progress={videoProgress} done={videoDone} /></div>}
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-[family-name:var(--font-mono)] bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >{error}</motion.p>
            )}

            <button type="submit" disabled={uploading}
              className="w-full py-4 bg-accent text-bg-primary font-semibold rounded-xl text-sm hover:brightness-110 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Uploading & Saving...
                </span>
              ) : "Add Project"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Admin Project Card ─────────────────────────────────────────────────────────
function AdminProjectCard({ project, onDelete, onEdit, onPreview, onQuickVideoUpload }) {
  const catColor = categoryColors[project.category] || "#f5a623";
  const isVideo = project.type === "video";
  const hasVideo = Boolean(project.videoUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-bg-elevated border border-border rounded-2xl overflow-hidden group flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image"; }}
        />

        {/* Hover overlay — Preview button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPreview(project)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/30 rounded-full text-white text-xs font-medium backdrop-blur-sm hover:bg-white/25 transition cursor-pointer"
          >
            <HiEye className="text-sm" /> Preview
          </button>
        </div>

        {/* Status / NO VIDEO badge */}
        <div className="absolute top-2 left-2">
          {isVideo && !hasVideo ? (
            <button
              onClick={() => onQuickVideoUpload(project)}
              className="px-2 py-0.5 rounded-md text-[9px] font-bold font-[family-name:var(--font-mono)] bg-yellow-400/90 text-black hover:bg-yellow-300 transition cursor-pointer"
              title="Click to upload video"
            >
              + UPLOAD VIDEO
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-[family-name:var(--font-mono)] bg-green-500/90 text-black">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 min-w-0 mb-3">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold mb-1.5 font-[family-name:var(--font-mono)]"
            style={{ backgroundColor: catColor + "20", color: catColor }}
          >
            {project.category}
          </span>
          <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{project.title}</h3>
          <p className="text-text-secondary text-xs">{project.brand}</p>
          <p className="text-text-secondary/70 text-xs mt-1 line-clamp-2">{project.description}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-border">
          {/* Preview */}
          <button
            onClick={() => onPreview(project)}
            title="Preview"
            className="flex-1 py-2 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HiEye className="text-sm" /> Preview
          </button>
          {/* Edit */}
          <button
            onClick={() => onEdit(project)}
            title="Edit"
            className="flex-1 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HiPencil className="text-sm" /> Edit
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(project)}
            title="Delete"
            className="w-9 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center"
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
  const [quickVideoTarget, setQuickVideoTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.category === activeTab);
  }, [activeTab, projects]);

  // For ImageLightbox — graphic projects only
  const graphicProjects = useMemo(() => projects.filter((p) => p.type === "graphic"), [projects]);

  const handlePreview = (project) => setPreviewTarget(project);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "projects", deleteTarget.id));
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-bg-primary">
      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
              <RiAdminLine className="text-accent text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-base leading-tight">Madhav</h1>
              <p className="text-text-secondary text-[10px] font-[family-name:var(--font-mono)]">
                {projects.length} projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-bg-primary rounded-xl text-sm font-semibold hover:brightness-110 transition cursor-pointer"
            >
              <HiPlus className="text-base" />
              <span className="hidden sm:inline">Add Project</span>
            </motion.button>

            <button
              onClick={() => signOut(auth)}
              className="w-9 h-9 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
              title="Sign out"
            >
              <HiLogout className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Projects", value: projects.length, color: "#a78bfa" },
            { label: "Video Editing", value: projects.filter((p) => p.category === "Video Editing").length, color: "#3b82f6" },
            { label: "Graphic Design", value: projects.filter((p) => p.category === "Graphic Design").length, color: "#f5a623" },
            { label: "Videos Missing", value: projects.filter((p) => p.type === "video" && !p.videoUrl).length, color: "#f87171" },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border rounded-2xl p-4">
              <p className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: stat.color }}>
                {loading ? "—" : stat.value}
              </p>
              <p className="text-text-secondary text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === tab
                  ? "bg-accent text-bg-primary"
                  : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({projects.filter((p) => p.category === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Projects Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
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
          <div className="text-center py-20">
            <p className="text-text-secondary font-[family-name:var(--font-mono)] text-sm">No projects in this category.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2.5 bg-accent text-bg-primary rounded-xl text-sm font-semibold hover:brightness-110 transition cursor-pointer"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <AdminProjectCard
                  key={project.id}
                  project={project}
                  onDelete={setDeleteTarget}
                  onEdit={setEditTarget}
                  onPreview={handlePreview}
                  onQuickVideoUpload={setQuickVideoTarget}
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
        {quickVideoTarget && (
          <QuickVideoUpload project={quickVideoTarget} onClose={() => setQuickVideoTarget(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm project={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        )}
      </AnimatePresence>

      {/* Preview — reuse same VideoModal / ImageLightbox as portfolio */}
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

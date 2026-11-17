import { createClient } from "@supabase/supabase-js";
import "./style.css";

// Isi dua nilai ini dari Supabase Project Settings > API.
const SUPABASE_URL = "https://GANTI-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "GANTI_DENGAN_ANON_PUBLIC_KEY";
const BUCKET = "fileku";

const configured = SUPABASE_URL.includes("supabase.co") &&
  !SUPABASE_URL.includes("GANTI-") &&
  !SUPABASE_ANON_KEY.includes("GANTI_");

const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const MAX_FILE_MB = 50; // Samakan dengan batas bucket di Supabase.

document.querySelector("#app").innerHTML = `
  <header class="topbar">
    <a class="brand" href="#"><span class="brand-icon">↥</span> FileKu</a>
    <span class="top-note">BERBAGI FILE DENGAN MUDAH</span>
  </header>
  <main class="container">
    <section class="hero">
      <div class="eyebrow">SIMPLE FILE SHARING</div>
      <h1>Kirim file.<br><span>Semudah itu.</span></h1>
      <p>Unggah dokumen, foto, video, dan berbagai file lainnya. Bagikan tautannya kepada siapa saja.</p>
    </section>

    <section class="upload-card">
      <div class="card-heading">
        <div><h2>Unggah file</h2><p>Pilih satu atau beberapa file sekaligus.</p></div>
        <span class="cloud">☁</span>
      </div>
      <label class="dropzone" id="dropzone">
        <input id="fileInput" type="file" multiple />
        <input id="folderInput" type="file" webkitdirectory multiple hidden />
        <span class="upload-symbol">＋</span>
        <strong id="chooseText">Pilih file dari perangkat</strong>
        <small>atau seret dan lepaskan file di sini</small>
        <small class="muted">Maksimal ${MAX_FILE_MB} MB per file</small>
      </label>
      <button id="folderBtn" class="folder-btn" type="button">▰ Pilih folder dari perangkat</button>
      <div id="selection" class="selection" hidden></div>
      <button id="uploadBtn" class="primary" disabled>Unggah sekarang <span>→</span></button>
      <div id="status" class="status" role="status"></div>
      <p class="privacy-note">File yang diunggah melalui website publik dapat diakses oleh siapa pun yang memiliki tautannya.</p>
    </section>

    <section class="files-section">
      <div class="section-title"><div><h2>File terbaru</h2><p>File yang baru saja dibagikan melalui FileKu.</p></div><button id="refreshBtn" class="refresh">↻ Muat ulang</button></div>
      <div id="fileList" class="file-list"><div class="empty">Memuat daftar file...</div></div>
    </section>
    <footer>© <span id="year"></span> FileKu · Berbagi file jadi lebih mudah.</footer>
  </main>
`;

document.querySelector("#year").textContent = new Date().getFullYear();
const input = document.querySelector("#fileInput");
const folderInput = document.querySelector("#folderInput");
const uploadBtn = document.querySelector("#uploadBtn");
const selection = document.querySelector("#selection");
const statusBox = document.querySelector("#status");
const dropzone = document.querySelector("#dropzone");
let selectedFiles = [];

function showStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}
function setFiles(files) {
  selectedFiles = Array.from(files || []);
  selection.hidden = selectedFiles.length === 0;
  selection.innerHTML = selectedFiles.map(f =>
    `<div class="selected-file"><span>📄 ${safeText(f.name)}</span><small>${formatBytes(f.size)}</small></div>`
  ).join("");
  document.querySelector("#chooseText").textContent =
    selectedFiles.length ? `${selectedFiles.length} file dipilih` : "Pilih file dari perangkat";
  uploadBtn.disabled = selectedFiles.length === 0;
}
input.addEventListener("change", e => setFiles(e.target.files));
folderInput.addEventListener("change", e => setFiles(e.target.files));
document.querySelector("#folderBtn").addEventListener("click", () => folderInput.click());

["dragenter", "dragover"].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.add("dragging");
}));
["dragleave", "drop"].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.remove("dragging");
}));
dropzone.addEventListener("drop", e => setFiles(e.dataTransfer.files));

async function loadFiles() {
  const list = document.querySelector("#fileList");
  if (!supabase) {
    list.innerHTML = `<div class="empty warning">Hubungkan Supabase terlebih dahulu. Ikuti langkah di README.md.</div>`;
    return;
  }
  list.innerHTML = `<div class="empty">Memuat daftar file...</div>`;
  const { data, error } = await supabase.from("files")
    .select("id,name,size,mime_type,public_url,created_at")
    .order("created_at", { ascending: false }).limit(30);
  if (error) {
    list.innerHTML = `<div class="empty warning">Gagal memuat file: ${safeText(error.message)}</div>`;
    return;
  }
  if (!data?.length) {
    list.innerHTML = `<div class="empty">Belum ada file. Jadilah yang pertama mengunggah!</div>`;
    return;
  }
  list.innerHTML = data.map(file => {
    const url = safeText(file.public_url);
    const name = safeText(file.name);
    const date = new Date(file.created_at).toLocaleString("id-ID");
    return `<article class="file-row">
      <div class="file-icon">▤</div>
      <div class="file-info"><strong title="${name}">${name}</strong><small>${formatBytes(file.size)} · ${safeText(date)}</small></div>
      <div class="file-actions">
        <a class="download" href="${url}" target="_blank" rel="noopener noreferrer">Unduh</a>
        <button class="share" data-url="${url}" data-name="${name}">WhatsApp</button>
      </div>
    </article>`;
  }).join("");
  list.querySelectorAll(".share").forEach(btn => btn.addEventListener("click", () => {
    const message = `Halo, saya membagikan file "${btn.dataset.name}" melalui FileKu:\n${btn.dataset.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }));
}

uploadBtn.addEventListener("click", async () => {
  if (!supabase) return showStatus("Konfigurasi Supabase belum diisi. Buka README.md.", "error");
  if (!selectedFiles.length) return;
  const tooLarge = selectedFiles.find(f => f.size > MAX_FILE_MB * 1024 * 1024);
  if (tooLarge) return showStatus(`${tooLarge.name} melebihi batas ${MAX_FILE_MB} MB.`, "error");

  uploadBtn.disabled = true;
  let success = 0;
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    showStatus(`Mengunggah ${i + 1}/${selectedFiles.length}: ${file.name}`);
    const safeName = file.name.normalize("NFKC").replace(/[^\w.\-() ]/g, "_").slice(0, 150);
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
    if (uploadError) {
      showStatus(`Gagal mengunggah ${file.name}: ${uploadError.message}`, "error");
      continue;
    }
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbError } = await supabase.from("files").insert({
      name: file.name,
      path,
      size: file.size,
      mime_type: file.type || "application/octet-stream",
      public_url: publicData.publicUrl
    });
    if (dbError) {
      showStatus(`File tersimpan, tetapi gagal menyimpan daftar: ${dbError.message}`, "error");
      continue;
    }
    success++;
  }
  setFiles([]);
  input.value = "";
  uploadBtn.disabled = true;
  if (success) showStatus(`${success} file berhasil diunggah. Link sudah tersedia di daftar file.`, "success");
  await loadFiles();
});

document.querySelector("#refreshBtn").addEventListener("click", loadFiles);
loadFiles();

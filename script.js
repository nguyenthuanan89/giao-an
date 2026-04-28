// ══════════════════════════════════════════════════
//  CẤU HÌNH - ĐIỀN VÀO ĐÂY
// ══════════════════════════════════════════════════

// 1. Đăng ký cloudinary.com (miễn phí) → lấy Cloud Name
const CLOUDINARY_CLOUD_NAME = "dvpazgx0y";   // ← Thay vào đây

// 2. Vào Settings → Upload → Upload Presets → Add preset
//    Đặt tên preset, chọn "Unsigned" → Save → copy tên vào đây
const CLOUDINARY_PRESET     = "giao_an_ck";           // ← Tên preset bạn đặt

// 3. Google Form
const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLScSRwbGZN28VPH6BBUcTDwh7TGRe6EQT44J_T_CeNq9-nYiyQ/formResponse";
const ENTRY = {
  name:    "entry.2052112983",
  email:   "entry.1372176837",
  phone:   "entry.877288516",
  subject: "entry.65958906",
  xacnhan: "entry.2003193280",  // ← Trường text nhận link ảnh Cloudinary
};

// ══════════════════════════════════════════════════
//  REVEAL ON SCROLL
// ══════════════════════════════════════════════════
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => io.observe(r));

// ══════════════════════════════════════════════════
//  UPLOAD ẢNH LÊN CLOUDINARY
// ══════════════════════════════════════════════════

let uploadedImageUrl = "";

async function uploadToCloudinary(file) {
  const area     = document.getElementById('upload-area');
  const idle     = document.getElementById('upload-idle');
  const loading  = document.getElementById('upload-loading');
  const done     = document.getElementById('upload-done');
  const thumb    = document.getElementById('upload-thumb');
  const filename = document.getElementById('upload-filename');

  // Kiểm tra dung lượng
  if (file.size > 5 * 1024 * 1024) {
    alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
    return;
  }

  // Hiện trạng thái loading
  idle.style.display    = 'none';
  done.style.display    = 'none';
  loading.style.display = 'block';
  area.style.borderColor = 'var(--gold)';
  area.style.borderStyle = 'solid';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', 'giao_an_ck');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Upload thất bại');

    const data = await res.json();
    uploadedImageUrl = data.secure_url;
    document.getElementById('f-ck-url').value = uploadedImageUrl;

    // Hiện trạng thái thành công
    loading.style.display = 'none';
    done.style.display    = 'block';
    thumb.src             = uploadedImageUrl;
    filename.textContent  = file.name;
    area.style.borderColor = '#27ae60';
    document.getElementById('err-ck').style.display = 'none';

  } catch (err) {
    loading.style.display = 'none';
    idle.style.display    = 'block';
    area.style.borderColor = '#e74c3c';
    alert('Upload thất bại! Kiểm tra lại Cloud Name và Preset trong file HTML.\nLỗi: ' + err.message);
  }
}

// Chọn file qua click
document.getElementById('f-ck').addEventListener('change', function() {
  if (this.files && this.files[0]) uploadToCloudinary(this.files[0]);
});

// Drag & drop
const uploadArea = document.getElementById('upload-area');
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--gold)';
  uploadArea.style.background  = 'rgba(201,168,76,0.08)';
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = uploadedImageUrl ? '#27ae60' : 'rgba(201,168,76,0.3)';
  uploadArea.style.background  = '';
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    uploadToCloudinary(file);
  } else {
    alert('Vui lòng chọn file ảnh (JPG, PNG)');
  }
});

// ══════════════════════════════════════════════════
//  SUBMIT FORM → GOOGLE FORM
// ══════════════════════════════════════════════════

document.getElementById('order-form').addEventListener('submit', async function(ev) {
  ev.preventDefault();

  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const subject = document.getElementById('f-subject').value;

  let valid = true;
  const setErr = (errId, cond) => {
    document.getElementById(errId).style.display = cond ? 'none' : 'block';
    if (!cond) valid = false;
  };

  setErr('err-name',    name.length > 1);
  setErr('err-email',   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  setErr('err-phone',   phone.length >= 9);
  setErr('err-subject', subject !== '');
  setErr('err-ck',      uploadedImageUrl.length > 0);

  if (!valid) return;

  const btn = document.getElementById('btn-submit');
  btn.disabled    = true;
  btn.textContent = '⏳  Đang gửi đơn...';

  try {
    const body = new FormData();
    body.append(ENTRY.name,    name);
    body.append(ENTRY.email,   email);
    body.append(ENTRY.phone,   phone);
    body.append(ENTRY.subject, subject);
    body.append(ENTRY.xacnhan, uploadedImageUrl);  // Link ảnh Cloudinary

    await fetch(FORM_ACTION, { method: 'POST', body, mode: 'no-cors' });

    document.getElementById('order-form').style.display  = 'none';
    document.getElementById('success-msg').style.display = 'block';

  } catch(err) {
    btn.disabled    = false;
    btn.textContent = '✉️  Gửi đơn hàng & nhận link ngay';
    alert('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo.');
  }
});

// ── DEMO FILTER ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.demo-card').forEach(card => {
      if (filter === 'all') {
        card.classList.remove('hidden');
      } else {
        const title = card.dataset.title.toLowerCase();
        const match = (filter === 'hoa' && title.includes('hóa')) ||
                      (filter === 'sinh' && title.includes('sinh'));
        card.classList.toggle('hidden', !match);
      }
    });
  });
});

// ── DEMO MODAL ──
function openDemo(e, card) {
  e.preventDefault();
  document.getElementById('demo-modal-frame').src = card.dataset.url;
  document.getElementById('demo-modal-title').textContent = card.dataset.title;
  document.getElementById('demo-modal-link').href = card.dataset.url;
  document.getElementById('demo-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDemo() {
  document.getElementById('demo-modal').classList.remove('open');
  document.getElementById('demo-modal-frame').src = '';
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('demo-modal')) closeDemo();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDemo(); });
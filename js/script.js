/* script.js - logika semua halaman (dipilih lewat atribut data-page di <body>)
   Memakai data dari data.js: dataPengguna, dataKatalogBuku, dataTracking */
const $ = s => document.querySelector(s);
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const hargaNum = h => parseInt(String(h).replace(/\D/g, ""), 10) || 0;   // "Rp 180.000" -> 180000
const getLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const getStok = () => getLS("stok", dataKatalogBuku);
const ONGKIR = { "JNE": 15000, "J&T": 18000, "SiCepat": 12000, "Pos Indonesia": 13000 };
const STATUS = ["Diproses", "Dikemas", "Dalam Perjalanan", "Dikirim"];
const page = document.body.dataset.page;

function setErr(id, msg) { const el = $("#err-" + id); if (el) el.textContent = msg || ""; return !msg; }

// ---------- Modal ----------
const openModal = id => $(id).classList.add("show");
const closeModal = id => $(id).classList.remove("show");
document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openModal(b.dataset.open)));
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => b.closest(".modal").classList.remove("show")));
document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.classList.remove("show"); }));

// ---------- Guard login, logout, menu aktif ----------
if (page !== "login" && !localStorage.getItem("userLogin")) {
  alert("Silakan login terlebih dahulu.");
  location.href = "index.html";
}
const btnLogout = $("#btnLogout");
if (btnLogout) btnLogout.addEventListener("click", e => {
  e.preventDefault();
  if (confirm("Yakin ingin logout?")) { localStorage.removeItem("userLogin"); location.href = "index.html"; }
});
document.querySelectorAll("nav a").forEach(a => {
  if (a.getAttribute("href") === location.pathname.split("/").pop()) a.classList.add("active");
});

// ---------- 1. LOGIN ----------
function initLogin() {
  const users = () => dataPengguna.concat(getLS("users", []));

  $("#formLogin").addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#email").value.trim().toLowerCase(), pass = $("#password").value;
    let ok = setErr("email", !email ? "Email wajib diisi" : !emailOk(email) ? "Format email tidak valid" : "");
    ok = setErr("password", !pass ? "Password wajib diisi" : "") && ok;
    if (!ok) return;
    const u = users().find(x => x.email === email && x.password === pass);
    if (u) { localStorage.setItem("userLogin", u.nama); location.href = "dashboard.html"; }
    else alert("Email/password yang anda masukkan salah");
  });

  $("#formLupa").addEventListener("submit", e => {
    e.preventDefault();
    const em = $("#lupaEmail").value.trim().toLowerCase();
    if (!setErr("lupa", emailOk(em) ? "" : "Masukkan email yang valid")) return;
    if (!users().some(x => x.email === em)) return setErr("lupa", "Email belum terdaftar");
    alert("Link reset password dikirim ke " + em + " (simulasi).");
    e.target.reset(); closeModal("#modalLupa");
  });

  $("#formDaftar").addEventListener("submit", e => {
    e.preventDefault();
    const nama = $("#dNama").value.trim(), em = $("#dEmail").value.trim().toLowerCase();
    const p1 = $("#dPass").value, p2 = $("#dPass2").value;
    let ok = setErr("dNama", nama.length < 3 ? "Nama minimal 3 karakter" : "");
    ok = setErr("dEmail", !emailOk(em) ? "Format email tidak valid" : users().some(x => x.email === em) ? "Email sudah terdaftar" : "") && ok;
    ok = setErr("dPass", p1.length < 6 ? "Password minimal 6 karakter" : "") && ok;
    ok = setErr("dPass2", p2 !== p1 ? "Konfirmasi password tidak sama" : "") && ok;
    if (!ok) return;
    const list = getLS("users", []);
    list.push({ id: dataPengguna.length + list.length + 1, nama, email: em, password: p1, role: "User" });
    setLS("users", list);
    alert("Pendaftaran berhasil. Silakan login."); e.target.reset(); closeModal("#modalDaftar");
  });
}

// ---------- 2. DASHBOARD ----------
function initDashboard() {
  const h = new Date().getHours();
  const sapa = (h < 4 || h >= 18) ? "Selamat Malam" : h < 11 ? "Selamat Pagi" : h < 15 ? "Selamat Siang" : "Selamat Sore";
  $("#greeting").textContent = sapa + ", " + localStorage.getItem("userLogin") + "!";
  $("#tanggal").textContent = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const st = getStok();
  $("#sJudul").textContent = st.length;
  $("#sStok").textContent = st.reduce((s, b) => s + Number(b.stok), 0);
  $("#sOrder").textContent = getLS("orders", []).length;
}

// ---------- 3. STOK ----------
function initStok() {
  let q = "";
  function render() {
    const d = getStok().filter(b => (b.namaBarang + b.kodeBarang).toLowerCase().includes(q));
    const tb = $("#tbodyStok"); tb.innerHTML = "";
    if (!d.length) { tb.innerHTML = '<tr><td colspan="9" class="empty">Buku tidak ditemukan.</td></tr>'; return; }
    d.forEach((b, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i + 1}</td>
        <td><img class="cover" src="${esc(b.cover)}" alt="Cover ${esc(b.namaBarang)}" onerror="this.onerror=null;this.src='img/default.png'"></td>
        <td>${esc(b.kodeBarang)}</td><td>${esc(b.namaBarang)}</td><td>${esc(b.jenisBarang)}</td><td>${esc(b.edisi)}</td>
        <td>${esc(b.harga)}</td><td><span class="badge ${b.stok < 200 ? "low" : "ok"}">${b.stok}</span></td>
        <td><button class="btn sm danger" data-kode="${esc(b.kodeBarang)}">Hapus</button></td>`;
      tb.appendChild(tr);
    });
  }
  $("#cari").addEventListener("input", e => { q = e.target.value.toLowerCase().trim(); render(); });
  $("#tbodyStok").addEventListener("click", e => {
    const kode = e.target.dataset.kode; if (!kode) return;
    if (confirm("Hapus buku " + kode + " dari katalog?")) { setLS("stok", getStok().filter(b => b.kodeBarang !== kode)); render(); }
  });
  $("#btnReset").addEventListener("click", () => {
    if (confirm("Kembalikan katalog ke data awal?")) { localStorage.removeItem("stok"); render(); }
  });
  $("#formStok").addEventListener("submit", e => {
    e.preventDefault();
    const v = id => $("#" + id).value.trim();
    const kode = v("kode").toUpperCase(), list = getStok();
    const edisi = Number(v("edisi")), harga = Number(v("harga")), stok = v("stok");
    let ok = setErr("kode", !kode ? "Kode wajib diisi" : list.some(b => b.kodeBarang === kode) ? "Kode sudah dipakai" : "");
    ok = setErr("nama", v("nama").length < 3 ? "Nama minimal 3 karakter" : "") && ok;
    ok = setErr("jenis", !v("jenis") ? "Jenis barang wajib diisi" : "") && ok;
    ok = setErr("edisi", !Number.isInteger(edisi) || edisi < 1 ? "Edisi harus bilangan bulat 1 atau lebih" : "") && ok;
    ok = setErr("harga", !(harga > 0) ? "Harga harus lebih dari 0" : "") && ok;
    ok = setErr("stok", stok === "" || !Number.isInteger(Number(stok)) || Number(stok) < 0 ? "Stok harus bilangan bulat 0 atau lebih" : "") && ok;
    if (!ok) { alert("Data belum valid, periksa kembali isian yang bertanda merah."); return; }
    list.push({ kodeBarang: kode, namaBarang: v("nama"), jenisBarang: v("jenis"), edisi: String(edisi),
                stok: Number(stok), harga: rupiah(harga), cover: "img/default.png" });
    setLS("stok", list); render(); e.target.reset();
    alert("Buku \"" + v("nama") + "\" berhasil ditambahkan.");
  });
  render();
}

// ---------- 4. CHECKOUT ----------
function initCheckout() {
  let cart = getLS("cart", []);
  const subtotal = () => cart.reduce((s, c) => s + c.harga * c.qty, 0);
  const ongkir = () => ONGKIR[$("#ekspedisi").value] || 0;
  const saveCart = () => { setLS("cart", cart); renderCart(); };

  function fillSelect() {
    const sel = $("#selBuku"); sel.innerHTML = "";
    getStok().forEach(b => sel.add(new Option(`${b.namaBarang} - ${b.harga} (stok ${b.stok})`, b.kodeBarang)));
  }
  function renderCart() {
    const tb = $("#tbodyCart"); tb.innerHTML = "";
    if (!cart.length) tb.innerHTML = '<tr><td colspan="5" class="empty">Keranjang kosong. Pilih buku lalu klik Tambah.</td></tr>';
    cart.forEach((c, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${esc(c.judul)}</td><td>${rupiah(c.harga)}</td>
        <td><input type="number" class="qty" min="1" value="${c.qty}" data-i="${i}"></td>
        <td>${rupiah(c.harga * c.qty)}</td><td><button class="btn sm danger" data-del="${i}">Hapus</button></td>`;
      tb.appendChild(tr);
    });
    $("#totalCart").textContent = rupiah(subtotal());
    $("#ongkir").textContent = rupiah(cart.length ? ongkir() : 0);
    $("#grand").textContent = rupiah(subtotal() + (cart.length ? ongkir() : 0));
  }
  function renderReport() {
    const od = getLS("orders", []);
    $("#rTotal").textContent = od.length;
    $("#rItem").textContent = od.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
    $("#rOmzet").textContent = rupiah(od.reduce((s, o) => s + o.totalNum, 0));
    const tb = $("#tbodyHistory"); tb.innerHTML = "";
    if (!od.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">Belum ada transaksi.</td></tr>'; return; }
    od.slice().reverse().forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${o.nomorDO}</td><td>${o.tanggalKirim}</td><td>${esc(o.nama)}</td>
        <td>${o.items.map(i => esc(i.judul) + " x" + i.qty).join(", ")}</td><td>${o.total}</td><td>${esc(o.metode)}</td>`;
      tb.appendChild(tr);
    });
  }

  $("#btnTambah").addEventListener("click", () => {
    const b = getStok().find(x => x.kodeBarang === $("#selBuku").value);
    const qty = Number($("#qty").value);
    if (!b) return alert("Pilih buku terlebih dahulu.");
    if (!Number.isInteger(qty) || qty < 1) return alert("Jumlah minimal 1.");
    const ada = cart.find(c => c.kode === b.kodeBarang);
    if ((ada ? ada.qty : 0) + qty > b.stok) return alert("Stok tidak cukup. Sisa stok: " + b.stok);
    if (ada) ada.qty += qty; else cart.push({ kode: b.kodeBarang, judul: b.namaBarang, harga: hargaNum(b.harga), qty });
    saveCart();
  });
  $("#tbodyCart").addEventListener("change", e => {
    if (!e.target.classList.contains("qty")) return;
    const c = cart[e.target.dataset.i], v = Number(e.target.value);
    const b = getStok().find(x => x.kodeBarang === c.kode);
    if (!Number.isInteger(v) || v < 1 || (b && v > b.stok)) alert("Jumlah tidak valid (min 1, maks stok tersedia).");
    else c.qty = v;
    saveCart();
  });
  $("#tbodyCart").addEventListener("click", e => {
    if (e.target.dataset.del === undefined) return;
    cart.splice(Number(e.target.dataset.del), 1); saveCart();
  });
  $("#ekspedisi").addEventListener("change", renderCart);

  $("#formOrder").addEventListener("submit", e => {
    e.preventDefault();
    const v = id => $("#" + id).value.trim();
    let ok = setErr("nama", v("nama").length < 3 ? "Nama minimal 3 karakter" : "");
    ok = setErr("oemail", !emailOk(v("oemail")) ? "Format email tidak valid" : "") && ok;
    ok = setErr("hp", !/^08\d{8,11}$/.test(v("hp")) ? "No. HP harus diawali 08 dan 10-13 digit" : "") && ok;
    ok = setErr("ekspedisi", !v("ekspedisi") ? "Pilih ekspedisi" : "") && ok;
    ok = setErr("metode", !v("metode") ? "Pilih metode pembayaran" : "") && ok;
    ok = setErr("alamat", v("alamat").length < 10 ? "Alamat minimal 10 karakter" : "") && ok;
    if (!ok) return alert("Data pemesan belum lengkap atau tidak valid.");
    if (!cart.length) return alert("Keranjang masih kosong.");

    // bentuk data pesanan dibuat sama dengan dataTracking di data.js
    const n = new Date(), p = x => String(x).padStart(2, "0");
    const waktu = `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
    const totalNum = subtotal() + ongkir();
    const order = {
      nomorDO: Date.now().toString().slice(-8), nama: v("nama"), status: "Diproses", ekspedisi: v("ekspedisi"),
      tanggalKirim: waktu.slice(0, 10), paket: v("paket"), total: rupiah(totalNum), totalNum, metode: v("metode"),
      items: cart.slice(), perjalanan: [{ waktu, keterangan: "Pesanan diterima dan sedang diproses" }]
    };
    const od = getLS("orders", []); od.push(order); setLS("orders", od);
    const st = getStok();   // kurangi stok sesuai pesanan
    cart.forEach(c => { const b = st.find(x => x.kodeBarang === c.kode); if (b) b.stok -= c.qty; });
    setLS("stok", st);
    cart = []; saveCart(); fillSelect(); renderReport(); e.target.reset();
    $("#noDOBaru").textContent = order.nomorDO; openModal("#modalSukses");
  });

  fillSelect(); renderCart(); renderReport();
}

// ---------- 5. TRACKING ----------
function initTracking() {
  $("#formTrack").addEventListener("submit", e => {
    e.preventDefault();
    const no = $("#noDO").value.trim(), out = $("#hasil");
    out.innerHTML = "";
    if (!setErr("noDO", no ? "" : "Nomor Delivery Order wajib diisi")) return;
    const d = Object.prototype.hasOwnProperty.call(dataTracking, no)
      ? dataTracking[no] : getLS("orders", []).find(o => o.nomorDO === no);
    if (!d) return alert("Nomor DO " + no + " tidak ditemukan.");
    const step = Math.max(STATUS.indexOf(d.status), 0) + 1;
    out.innerHTML = `<div class="card">
      <h2>DO ${esc(d.nomorDO)} - ${esc(d.status)}</h2>
      <div class="bar ${step === 4 ? "done" : ""}" role="progressbar" aria-valuenow="${step * 25}" aria-valuemin="0" aria-valuemax="100"><i style="width:${step * 25}%"></i></div>
      <ol class="steps">${STATUS.map((s, i) => `<li class="${i < step ? "on" : ""}">${s}</li>`).join("")}</ol>
      <table><tbody>
        <tr><th>Nama pemesan</th><td>${esc(d.nama)}</td></tr>
        <tr><th>Ekspedisi</th><td>${esc(d.ekspedisi)}</td></tr>
        <tr><th>Tanggal kirim</th><td>${esc(d.tanggalKirim)}</td></tr>
        <tr><th>Jenis paket</th><td>${esc(d.paket)}</td></tr>
        <tr><th>Total pembayaran</th><td>${esc(d.total)}</td></tr>
      </tbody></table>
      <h2 style="margin-top:1.2rem">Riwayat perjalanan</h2>
      <ol class="timeline">${(d.perjalanan || []).map(p => `<li><time>${esc(p.waktu)}</time>${esc(p.keterangan)}</li>`).join("")}</ol></div>`;
  });
}

({ login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking })[page]();

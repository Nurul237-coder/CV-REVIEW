# **Product Requirements Document (PRD)**

**Product Name:**  
\[Insert the name of the product here\]

**Document Owner:**  
\[Name and title of the person responsible for the document\]

**Version:**  
\[Document version number\]

**Last Updated:**  
\[Date when the document was last updated\]

---

# **1\. Overview**

## **1.1 Purpose**

Produk CV Review Web Application bertujuan untuk membantu pengguna (scholarship seekers, career switchers, dan internship applicants) mendapatkan feedback instan terhadap CV mereka. Aplikasi ini menyelesaikan masalah umum seperti kurangnya insight ATS (Applicant Tracking System), sulitnya memahami kekuatan dan kelemahan CV, serta minimnya akses ke tools perbaikan CV yang relevan dengan role yang dituju.

## **1.2 Objectives**

* Memberikan analisis instan terhadap CV dengan skor dan highlight utama.  
* Menyediakan analisis spesifik berdasarkan role (Scholarship, Career Switcher, Internship).  
* Menawarkan fitur rewrite otomatis untuk meningkatkan kualitas CV.  
* Memfasilitasi pengguna dalam melacak aplikasi (scholarship, internship, pekerjaan) melalui application tracker.  
* Membuka peluang monetisasi melalui paket premium (analisis detail, auto-rewrite lengkap, dan download CV ATS-friendly).

## **1.3 Key Metrics**

* User Adoption: jumlah CV yang di-upload per minggu/bulan.  
* Engagement: rata-rata interaksi per user (upload, lihat analisis, gunakan rewrite).

* Conversion Rate: persentase user yang upgrade ke Premium.  
* Retention: jumlah user yang kembali menggunakan aplikasi dalam 30 hari.  
* Outcome-based: peningkatan rata-rata skor CV user setelah menggunakan fitur rewrite.

---

# **2\. Scope**

## **2.1 In Scope**

* **Sprint 1:** Upload CV (PDF/DOCX), parsing, snapshot analisis instan (skor, highlight positif/negatif, bell curve sederhana).  
* **Sprint 2:** Role-specific form input, sub-score analisis per kategori, bar chart sub-score.  
* **Sprint 3:** Auto-Rewrite Engine (bullet points, summary, objective) dengan teaser gratis dan preview CV ATS-friendly.  
* **Sprint 4:** Monetisasi Premium (lock screen, payment flow, premium unlock state).  
* **Sprint 5:** Retensi user (Application Tracker Kanban, Deadline Reminder, Kurva Normal detail dengan benchmark nasional).

## **2.2 Out of Scope**

* Integrasi langsung dengan platform rekrutmen, kampus, atau penyedia beasiswa.  
* Fitur kolaborasi antar-user (chat, komunitas, mentor langsung).  
* Sistem notifikasi push (mobile app) di luar reminder deadline sederhana.  
* Dukungan untuk format selain PDF/DOCX (misalnya gambar atau Google Docs live sync).

---

# **3\. Target Audience**

## **3.1 User Personas**

1. **Scholarship Seeker**

   * Usia 18–25 tahun, mahasiswa atau fresh graduate.  
   * Kebutuhan: menyoroti academic achievements, test scores, dan leadership untuk beasiswa.

2. **Career Switcher**

   * Usia 23–35 tahun, profesional muda yang ingin beralih role/industri.  
   * Kebutuhan: menonjolkan transferable skills, narrative yang relevan, dan alignment dengan role tujuan.

3. **Internship/Magang Applicant**

   * Usia 18–24 tahun, mahasiswa aktif.  
   * Kebutuhan: menampilkan academic projects, organisasi, dan pengalaman volunteer untuk meningkatkan peluang diterima.

## **3.2 Use Cases**

* Scholarship Seeker meng-upload CV, mengisi IPK dan achievements, lalu mendapat sub-score pada *Academic Strength* dan rekomendasi rewrite untuk bullet academic.  
* Career Switcher meng-upload CV, memilih role asal & tujuan, lalu mendapat insight mengenai relevansi skill dan rewrite narasi untuk role baru.  
* Internship Applicant meng-upload CV, menambahkan pengalaman organisasi, lalu melihat sub-score *Project Fit* dan mendapat saran rewrite untuk bullet project.  
* Semua persona dapat menyimpan aplikasi mereka di Kanban Tracker (Submitted, Interview, Accepted, Rejected) untuk memantau progres aplikasi.

---

## **4\. Functional Requirements**

### **4.1 Feature 1: Landing & Upload Flow**

**Description:**  
Gabungan landing page dan halaman upload CV. Menyediakan CTA utama untuk upload, drag-and-drop/file picker, serta pemilihan role target.

User Story:  
As a scholarship seeker / career switcher / internship applicant, I want to upload my CV directly from the landing page so that I can start the analysis process quickly.

Acceptance Criteria:

* Landing page memiliki hero section dengan tagline singkat.  
* Tombol utama “Upload CV Sekarang” tersedia.  
* Komponen drag-and-drop \+ file picker berfungsi.  
* Sistem menerima format PDF & DOCX.  
* Dropdown pilihan role (Scholarship, Career Switcher, Internship) tersedia.  
* Tombol “Scan CV” aktif setelah file berhasil diupload.  
* Responsif di desktop & mobile.

  ---

### **4.2 Feature 2: CV Analysis (Snapshot & Role-Specific)**

**Description:**  
Menggabungkan analisis cepat dan analisis spesifik per role. Menyediakan skor CV total, highlight positif/negatif, bell curve mini, form tambahan sesuai role, dan hasil analisis detail dengan sub-scores.

**User Story:**  
As a user, I want to see a quick and role-specific analysis of my CV so that I can understand my strengths and weaknesses in the relevant context.

**Acceptance Criteria:**

* Skor CV total ditampilkan (0–100).  
* Minimal 1 highlight positif dan 1 highlight negatif ditampilkan.  
* Mini bell curve menandai posisi user.  
* Form tambahan sesuai role:

  * Scholarship: IPK, Awards, Test Score.

  * Career Switcher: Role Asal, Role Tujuan, Transferable Skills.

  * Internship: Academic Projects, Organization/Volunteer, Relevant Coursework.

* Analisis role-specific menampilkan sub-scores (3 kategori/role) dengan bar chart.  
* CTA premium muncul setelah analisis ditampilkan.

  ---

### **4.3 Feature 3: Rewrite & Tailored CV Preview**

**Description:**  
Menggabungkan fitur auto-rewrite (bullet points, summary, objective) dan preview ATS-friendly. Free user dapat melihat 1 contoh rewrite gratis dan preview dengan watermark. Premium user mendapatkan akses penuh.

**User Story:**  
As a user, I want to see rewritten suggestions and preview my tailored CV so that I can improve my CV and understand how it looks in ATS-friendly format.

**Acceptance Criteria:**

* Rewrite tersedia dalam tampilan side-by-side (original vs rewritten).  
* 1 contoh rewrite gratis untuk free user.  
* Sisanya terkunci dengan overlay blur \+ ikon gembok.  
* Preview CV ATS-friendly ditampilkan.  
* Bagian tertentu blur/watermark untuk free user.

* Tombol download hanya aktif untuk premium user.  
  ---

### **4.4 Feature 4: Premium Monetization Flow**

**Description:**  
Menggabungkan alur unlock premium dan akses penuh analisis. User dapat membeli paket premium untuk membuka semua rewrite, analisis detail, dan download CV.

**User Story:**  
As a user, I want to unlock premium features so that I can get full analysis, unlimited rewrites, and download my ATS CV.

**Acceptance Criteria:**

* Lock screen muncul saat klik fitur premium.  
* Terdapat list benefit \+ harga paket.  
* CTA “Unlock Premium” \+ opsi “Lanjutkan Gratis” tersedia.  
* Payment page mendukung e-wallet, bank transfer, dan kartu.  
* Payment success page menampilkan CTA menuju analisis premium.  
* Premium user dapat melihat semua sub-score detail, semua rewrite, dan mendownload CV (DOCX/PDF).

  ---

### **4.5 Feature 5: Application Tracker & Deadline Reminder**

**Description:**  
Menggabungkan kanban board aplikasi dengan widget reminder deadline. Membantu user melacak progress aplikasi scholarship, internship, atau career switch.

**User Story:**  
As a user, I want to track my applications and see reminders for deadlines so that I can manage my submissions effectively.

**Acceptance Criteria:**

* Kanban board memiliki kolom default: Draft → Submitted → Interview → Accepted → Rejected.  
* Card aplikasi berisi nama, deadline, dan status icon.  
* Card dapat drag & drop antar kolom.  
* Reminder badge muncul jika deadline \< 7 hari.  
* Sidebar widget menampilkan aplikasi dengan deadline H-7, H-3, H-1.  
* Free user: hanya 1 aplikasi. Premium: multi-application.  
  ---

### **4.6 Feature 6: Benchmark & Normal Curve Visualization**

**Description:**  
Grafik kurva normal detail untuk menunjukkan posisi user dibandingkan persentil nasional. Free user mendapat insight sederhana, premium user mendapat detail persentil.

**User Story:**  
As a user, I want to see where my CV stands compared to others so that I can understand my competitiveness.

**Acceptance Criteria:**

* Kurva normal ditampilkan dengan skala 0–100.  
* Titik posisi user ditandai merah.  
* Area warna persentil: \<30 merah, 30–70 kuning, \>70 hijau.  
* Label persentil & rata-rata skor tersedia.  
* Tab toggle untuk kategori (Keyword, Achievement, Format).  
* Free user: simplifikasi (di bawah/rata-rata/di atas).  
* Premium user: detail persentil.

---

## **5\. Non-functional Requirements**

* **Performance:**  
  Define performance expectations such as speed, scalability, or latency.  
* **Security:**  
  Any security considerations that must be addressed.  
* **Compliance:**  
  Regulatory or legal requirements.  
* **Usability:**  
  Design and user experience considerations.

---

## **6\. Technical Requirements**

### **6.1 Architecture**

Brief overview of the technical architecture, including diagrams if needed.

### **6.2 Integration**

Any integration points with other systems, tools, or APIs.

### **6.3 Platforms**

List the platforms the product will support (e.g., web, mobile, etc.).

---

## **7\. Timeline**

### **7.1 Milestones**

* **Milestone 1:**  
  \[Description and estimated date\]  
* **Milestone 2:**  
  \[Description and estimated date\]

---

## **8\. Risks and Assumptions**

### **8.1 Risks**

* **Risk 1:**  
  Description of the potential risk and mitigation strategies.

### **8.2 Assumptions**

* **Assumption 1:**  
  List any assumptions made during the planning of the product.

---

## **9\. Stakeholders**

* **Stakeholder 1:**  
  \[Name, role, and responsibilities\]  
* **Stakeholder 2:**  
  \[Name, role, and responsibilities\]

---

## **10\. Approvals**

* **Approved by:**  
  \[Name, role, and signature\]


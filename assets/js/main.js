document.addEventListener('DOMContentLoaded', () => {
  // Common helpers
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Page detection
  const isUpload = !!qs('#uploadPage');
  const isRoleForm = !!qs('#roleFormPage');
  const isAnalysis = !!qs('#analysisPage');
  const isPayment = !!qs('#paymentPage');
  const isSuccess = !!qs('#paymentSuccessPage');
  const isDashboard = !!qs('#dashboardPage');
  const isBenchmark = !!qs('#benchmarkPage');

  // Upload page interactions
  if (isUpload) {
    const dropzone = qs('#dropzone');
    const fileInput = qs('#fileInput');
    const fileMeta = qs('#fileMeta');
    const errorText = qs('#errorText');
    const scanBtn = qs('#scanBtn');
    const roleSelect = qs('#roleSelect');

    const allowExt = ['pdf', 'doc', 'docx'];
    const allowMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    function getExt(name) {
      const i = name.lastIndexOf('.')
      return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
    }

    function validFile(file) {
      if (!file) return false;
      return allowMime.includes(file.type) || allowExt.includes(getExt(file.name));
    }

    function showFileMeta(file) {
      if (!file) { fileMeta.textContent = ''; return; }
      fileMeta.textContent = `${file.name} • ${(file.size/1024).toFixed(1)} KB`;
    }

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files?.[0];
      if (!file || !validFile(file)) {
        errorText.textContent = 'Gunakan file PDF/DOC/DOCX';
        errorText.classList.add('show');
        fileInput.value = '';
        showFileMeta(null);
        return;
      }
      errorText.classList.remove('show');
      showFileMeta(file);
      // Put dropped file into input for consistency
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file || !validFile(file)) {
        errorText.textContent = 'Gunakan file PDF/DOC/DOCX';
        errorText.classList.add('show');
        showFileMeta(null);
        return;
      }
      errorText.classList.remove('show');
      showFileMeta(file);
    });

    scanBtn.addEventListener('click', () => {
      const file = fileInput.files?.[0];
      if (!file) {
        errorText.textContent = 'Silakan unggah file terlebih dahulu';
        errorText.classList.add('show');
        return;
      }
      if (!validFile(file)) {
        errorText.textContent = 'Format tidak didukung (PDF/DOC/DOCX)';
        errorText.classList.add('show');
        return;
      }

      // Simulate scanning
      errorText.classList.remove('show');
      scanBtn.disabled = true;
      const original = scanBtn.textContent;
      scanBtn.textContent = 'Memindai...';

      const role = encodeURIComponent(roleSelect.value || 'General');
      setTimeout(() => {
        window.location.href = `role-form.html?role=${role}`;
      }, 900);
    });
  }

  // Role form interactions
  if (isRoleForm) {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || 'Scholarship';

    const tabs = qsa('.tab');
    const sections = qsa('.form-section');
    const toAnalysisBtn = qs('#toAnalysisBtn');
    const roleLabel = qs('#rolePicked');

    function setActiveRole(r) {
      roleLabel.textContent = r;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.role === r));
      sections.forEach(s => s.classList.toggle('active', s.dataset.role === r));
      document.body.classList.remove('scholarship', 'switcher', 'internship');
      if (r === 'Scholarship') document.body.classList.add('scholarship');
      if (r === 'Career Switcher') document.body.classList.add('switcher');
      if (r === 'Internship') document.body.classList.add('internship');
    }

    tabs.forEach(tab => tab.addEventListener('click', () => setActiveRole(tab.dataset.role)));
    setActiveRole(role);

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function scale(val, inMin, inMax, outMin, outMax) {
      if (inMax === inMin) return outMin;
      const t = (val - inMin) / (inMax - inMin);
      return outMin + t * (outMax - outMin);
    }

    function computeScholarship() {
      const ipk = parseFloat(qs('#ipk')?.value || '0'); // 0..4
      const awardsLen = (qs('#awards')?.value || '').trim().length;
      const testRaw = parseFloat(qs('#testScore')?.value || '0'); // IELTS up to 9, TOEFL up to 120
      const academic = Math.round(scale(clamp(ipk, 0, 4), 0, 4, 45, 95));
      const leadership = Math.round(scale(clamp(awardsLen, 0, 400), 0, 400, 40, 90));
      const maxTest = testRaw <= 9 ? 9 : 120;
      const research = Math.round(scale(clamp(testRaw, 0, maxTest), 0, maxTest, 40, 90));
      return { labels: ['Academic Strength', 'Leadership', 'Research Fit'], scores: [academic, leadership, research] };
    }

    function computeSwitcher() {
      const from = (qs('#roleFrom')?.value || '').trim();
      const to = (qs('#roleTo')?.value || '').trim();
      const skillsLen = (qs('#skills')?.value || '').trim().length;
      const transferable = Math.round(scale(clamp(skillsLen, 0, 400), 0, 400, 45, 92));
      const relevansiBase = from && to && from !== to ? 60 : 55;
      const relevansi = clamp(relevansiBase + Math.round(scale(skillsLen, 0, 400, 0, 25)), 40, 90);
      const narrative = Math.round(scale(clamp(skillsLen, 0, 400), 0, 400, 42, 88));
      return { labels: ['Transferable Skills', 'Role Relevansi', 'Narrative'], scores: [transferable, relevansi, narrative] };
    }

    function computeIntern() {
      const projectsLen = (qs('#projects')?.value || '').trim().length;
      const orgLen = (qs('#org')?.value || '').trim().length;
      const courseworkLen = (qs('#coursework')?.value || '').trim().length;
      const projectFit = Math.round(scale(clamp(projectsLen, 0, 500), 0, 500, 45, 92));
      const orgAct = Math.round(scale(clamp(orgLen, 0, 400), 0, 400, 42, 88));
      const growth = Math.round(scale(clamp(courseworkLen, 0, 400), 0, 400, 40, 86));
      return { labels: ['Project Fit', 'Organization/Activity', 'Growth Potential'], scores: [projectFit, orgAct, growth] };
    }

    function computeForRole(r) {
      if (r === 'Scholarship') return computeScholarship();
      if (r === 'Career Switcher') return computeSwitcher();
      if (r === 'Internship') return computeIntern();
      return { labels: ['A', 'B', 'C'], scores: [60, 60, 60] };
    }

    toAnalysisBtn.addEventListener('click', () => {
      const active = tabs.find(t => t.classList.contains('active'))?.dataset.role || 'Scholarship';
      const { labels, scores } = computeForRole(active);
      const score = Math.round((scores[0] + scores[1] + scores[2]) / 3);
      const q = new URLSearchParams();
      q.set('role', active);
      q.set('score', String(score));
      q.set('s1', String(scores[0]));
      q.set('s2', String(scores[1]));
      q.set('s3', String(scores[2]));
      // Also pass labels in case we want customization (optional)
      q.set('l1', labels[0]); q.set('l2', labels[1]); q.set('l3', labels[2]);
      window.location.href = `analysis.html?${q.toString()}`;
    });
  }

  // Analysis page rendering
  if (isAnalysis) {
    const params = new URLSearchParams(window.location.search);
    const score = Math.max(0, Math.min(100, parseInt(params.get('score') || '65', 10)));
    const role = params.get('role') || 'General';

    const scoreCircle = qs('.score-circle');
    const valueEl = qs('#scoreValue');
    const roleEl = qs('#roleLabel');
    const dot = qs('#curveDot');
    const subScores = qs('#subScores');
    const bar1Fill = qs('#bar1Fill');
    const bar2Fill = qs('#bar2Fill');
    const bar3Fill = qs('#bar3Fill');
    const bar1Val = qs('#bar1Value');
    const bar2Val = qs('#bar2Value');
    const bar3Val = qs('#bar3Value');
    const bar1Label = qs('#bar1Label');
    const bar2Label = qs('#bar2Label');
    const bar3Label = qs('#bar3Label');
    const rewriteList = qs('#rewriteList');
    const previewCard = qs('#previewCard');
    const previewSummary = qs('#previewSummary');
    const previewProjects = qs('#previewProjects');
    const previewSkills = qs('#previewSkills');
    const downloadBtn = qs('#downloadBtn');
    const lockModal = qs('#lockModal');
    const goToPayment = qs('#goToPayment');
    const stayFree = qs('#stayFree');
    const closeLock = qs('#closeLock');

    // Update score circle
    scoreCircle.style.setProperty('--score', String(score));
    valueEl.innerHTML = `${score}<small>/100</small>`;
    roleEl.textContent = role;

    // Position dot along the curve: map 0..100 -> 5%..95%
    const pct = 5 + (score / 100) * 90;
    dot.style.left = pct + '%';

    // Sub-scores
    const defaults = {
      Scholarship: { labels: ['Academic Strength', 'Leadership', 'Research Fit'] },
      'Career Switcher': { labels: ['Transferable Skills', 'Role Relevansi', 'Narrative'] },
      Internship: { labels: ['Project Fit', 'Organization/Activity', 'Growth Potential'] },
    };
    const scores = [
      Math.max(0, Math.min(100, parseInt(params.get('s1') || '68', 10))),
      Math.max(0, Math.min(100, parseInt(params.get('s2') || '64', 10))),
      Math.max(0, Math.min(100, parseInt(params.get('s3') || '62', 10))),
    ];
    const labels = [
      params.get('l1') || (defaults[role]?.labels?.[0] || 'Sub-score 1'),
      params.get('l2') || (defaults[role]?.labels?.[1] || 'Sub-score 2'),
      params.get('l3') || (defaults[role]?.labels?.[2] || 'Sub-score 3'),
    ];

    // Accent class
    const accentMap = {
      Scholarship: 'accent-green',
      'Career Switcher': 'accent-orange',
      Internship: 'accent-purple',
    };
    const accent = accentMap[role] || '';
    [bar1Fill, bar2Fill, bar3Fill].forEach(el => {
      el?.classList.remove('accent-green', 'accent-orange', 'accent-purple');
      if (accent && el) el.classList.add(accent);
    });

    // Set labels and widths
    if (bar1Label) bar1Label.textContent = labels[0];
    if (bar2Label) bar2Label.textContent = labels[1];
    if (bar3Label) bar3Label.textContent = labels[2];
    if (bar1Val) bar1Val.textContent = scores[0] + '/100';
    if (bar2Val) bar2Val.textContent = scores[1] + '/100';
    if (bar3Val) bar3Val.textContent = scores[2] + '/100';
    if (bar1Fill) bar1Fill.style.width = scores[0] + '%';
    if (bar2Fill) bar2Fill.style.width = scores[1] + '%';
    if (bar3Fill) bar3Fill.style.width = scores[2] + '%';

    // Sprint 3: Rewrite suggestions (one free sample, others locked)
    if (rewriteList) {
      rewriteList.innerHTML = '';
      /** @type {{title:string, original:string, rewritten:string}[]} */
      let items = [];
      if (role === 'Scholarship') {
        items = [
          {
            title: 'Academic Achievement — bullet rewrite',
            original: 'Menjadi penerima beasiswa internal kampus, aktif di kegiatan akademik.',
            rewritten: 'Awarded competitive campus scholarship; maintained strong academic standing while contributing to research/club activities with measurable outcomes.'
          },
          {
            title: 'Leadership/Organization — bullet rewrite',
            original: 'Ketua organisasi mahasiswa, memimpin beberapa program kerja.',
            rewritten: 'Led 15+ member student organization to deliver 4 campus-wide programs, increasing participant satisfaction by 20% and fundraising Rp15 juta.'
          },
          {
            title: 'Short Objective — scholarship',
            original: 'Ingin melanjutkan studi dengan beasiswa.',
            rewritten: 'Motivated scholar with strong academic foundation (STEM) seeking scholarship to deepen research in [field], aiming to deliver societal impact via [topic] with faculty collaboration.'
          },
        ];
      } else if (role === 'Career Switcher') {
        items = [
          {
            title: 'Transferable Skills — bullet rewrite',
            original: 'Berpengalaman di peran sebelumnya, ingin beralih karier.',
            rewritten: 'Translated cross-functional experience into data-driven decisions; improved process efficiency by 18% using spreadsheets, dashboards, and stakeholder alignment.'
          },
          {
            title: 'New Role Target — summary',
            original: 'Ingin menjadi Product Manager.',
            rewritten: 'Aspiring Product Manager with analytics, UX sense, and delivery track-record; able to scope MVPs, prioritize roadmap, and align teams to outcomes.'
          },
          {
            title: 'Suggested Project/Portfolio — bullet',
            original: 'Sedang menyiapkan portofolio.',
            rewritten: 'Built a public case study: redesigned onboarding flow, defined success metrics (activation rate), and delivered prototype validated by 5 user interviews.'
          },
        ];
      } else { // Internship
        items = [
          {
            title: 'Project — bullet rewrite (impact-oriented)',
            original: 'Mengerjakan proyek tugas kuliah terkait web.',
            rewritten: 'Developed responsive web app for course project; implemented authentication and REST API integration, achieving 95% Lighthouse performance score.'
          },
          {
            title: 'Organization/Volunteer — bullet rewrite',
            original: 'Aktif di organisasi kampus.',
            rewritten: 'Coordinated volunteer team of 10 to deliver campus event (300+ attendees), managing logistics, sponsors, and post-event reporting.'
          },
          {
            title: '1-page Summary — internship',
            original: 'Ingin magang untuk menambah pengalaman.',
            rewritten: 'STEM undergraduate with hands-on projects and strong willingness to learn; ready to contribute on real tasks, iterate on feedback, and grow with the team.'
          },
        ];
      }

      items.forEach((it, idx) => {
        const locked = idx > 0; // first free, others locked
        const el = document.createElement('div');
        el.className = 'rewrite-item' + (locked ? ' locked' : '');
        el.innerHTML = `
          <div class="rewrite-title">${it.title}</div>
          <div class="rewrite-body">
            <div class="original"><div class="label">Original</div><div>${it.original}</div></div>
            <div class="rewritten"><div class="label">Rewritten</div><div>${it.rewritten}</div></div>
          </div>
          ${locked ? '<div class="lock-overlay"><span class="lock-icon">🔒 Terkunci</span></div>' : ''}
        `;
        rewriteList.appendChild(el);
      });
    }

    // Sprint 3: Preview CV content
    if (previewCard) {
      // Set accent class
      previewCard.classList.remove('accent-green', 'accent-orange', 'accent-purple');
      if (accent) previewCard.classList.add(accent);

      // Populate simple preview content per role
      const byRole = {
        Scholarship: {
          summary: 'Scholarship-focused candidate with solid academics and consistent leadership impact. Interested in research on [topic] with community contribution.',
          projects: [
            'Research assistant: contributed to data collection and analysis; summarized findings into 2-page brief.',
            'Capstone project: built prototype addressing [problem]; presented to faculty panel.'
          ],
          skills: 'Academic Writing • Research Methods • Data Analysis • Leadership'
        },
        'Career Switcher': {
          summary: 'Career switcher transitioning into [target role]; strong transferable skills across analysis, communication, and project delivery.',
          projects: [
            'Case study: redesigned [flow] with metric-driven approach; defined MVP, tracked outcomes.',
            'Self-learning portfolio: completed 3 mini projects relevant to the target role.'
          ],
          skills: 'Problem Solving • Stakeholder Management • Agile • Analytics'
        },
        Internship: {
          summary: 'Undergraduate with practical coursework and projects, eager to learn and contribute to real-world tasks.',
          projects: [
            'Web app project: authentication, API integration, responsive UI.',
            'Data mini-project: cleaned dataset and visualized insights with dashboards.'
          ],
          skills: 'HTML/CSS/JS • Python/Excel • Teamwork • Communication'
        }
      };
      const data = byRole[role] || byRole.Scholarship;
      if (previewSummary) previewSummary.textContent = data.summary;
      if (previewSkills) previewSkills.textContent = data.skills;
      if (previewProjects) {
        previewProjects.innerHTML = '';
        data.projects.forEach(p => {
          const li = document.createElement('li');
          li.textContent = p;
          previewProjects.appendChild(li);
        });
      }
      // downloadBtn handler will be attached later after unlock state check
    }

    // CTA
    const unlockBtn = qs('#unlockBtn');
    const openLock = () => lockModal?.classList.add('show');
    const closeLockFn = () => lockModal?.classList.remove('show');
    unlockBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openLock();
    });
    closeLock?.addEventListener('click', closeLockFn);
    stayFree?.addEventListener('click', closeLockFn);
    goToPayment?.addEventListener('click', () => {
      window.location.href = 'payment.html';
    });

    // Premium unlocked state
    const unlocked = localStorage.getItem('premiumUnlocked') === '1' || params.get('unlocked') === '1';
    if (unlocked) {
      // enable download
      if (downloadBtn) downloadBtn.disabled = false;
      // remove lock overlays and watermark
      document.querySelectorAll('.lock-overlay').forEach(el => el.remove());
      document.querySelectorAll('.preview-watermark').forEach(el => el.remove());
      // adjust premium box title text if exists
      const premiumTitle = document.querySelector('.premium-box .title');
      if (premiumTitle) premiumTitle.textContent = 'Premium Aktif – Akses Penuh Terbuka';
      if (unlockBtn) {
        unlockBtn.textContent = 'Sudah Premium';
        unlockBtn.classList.add('disabled');
        unlockBtn.setAttribute('disabled', 'true');
      }
    }

    // Attach download behavior based on lock state
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (unlocked) {
          alert('Mengunduh CV ATS-friendly (mock).');
        } else {
          openLock();
        }
      });
    }
  }

  // Payment page logic
  if (isPayment) {
    const payBtn = document.getElementById('payConfirm');
    payBtn?.addEventListener('click', () => {
      // Simulate payment success
      localStorage.setItem('premiumUnlocked', '1');
      window.location.href = 'payment-success.html';
    });
  }

  // Payment success page logic
  if (isSuccess) {
    const goAnalysis = document.getElementById('goAnalysis');
    const goDownload = document.getElementById('goDownload');
    goAnalysis?.addEventListener('click', () => {
      window.location.href = 'analysis.html?unlocked=1';
    });
    goDownload?.addEventListener('click', () => {
      window.location.href = 'analysis.html?unlocked=1';
    });
  }

  // Dashboard (Kanban) basic DnD
  if (isDashboard) {
    const cards = qsa('.kanban-card');
    const columns = qsa('.column');
    cards.forEach(card => {
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
      });
    });
    columns.forEach(col => {
      col.addEventListener('dragover', (e) => e.preventDefault());
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const el = document.getElementById(id);
        if (el) col.appendChild(el);
      });
    });

    // Premium gating example
    const unlocked = localStorage.getItem('premiumUnlocked') === '1';
    const cta = document.getElementById('unlockKanban');
    cta?.addEventListener('click', () => {
      window.location.href = 'analysis.html';
    });

    const addBtn = document.getElementById('addAppBtn');
    addBtn?.addEventListener('click', () => {
      const currentCards = qsa('.kanban-card');
      if (!unlocked && currentCards.length >= 1) {
        alert('Fitur multi-application khusus Premium. Unlock untuk menambahkan lebih dari 1 aplikasi.');
        return;
      }
      const draftCol = document.getElementById('col-draft');
      const id = 'card-' + Math.random().toString(36).slice(2, 8);
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.id = id;
      card.innerHTML = '<div><strong>Aplikasi Baru</strong></div><div class="meta"><span>Deadline: TBA</span><span class="deadline-badge">H-7</span></div>';
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
      });
      draftCol?.appendChild(card);
    });
  }

  // Benchmark page interactions
  if (isBenchmark) {
    const tabs = qsa('.bench-tab');
    const score = 72; // demo
    const percentile = score; // simplification for demo
    const posEl = document.getElementById('benchPosition');
    const avgEl = document.getElementById('benchAvg');
    if (posEl) posEl.textContent = `Posisi kamu: Persentil ${percentile} – lebih baik dari ${percentile}% pelamar lain se-Indonesia.`;
    if (avgEl) avgEl.textContent = 'Rata-rata skor role ini: 65.';
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      // would update curve per category here in a real app
    }));

    const unlocked = localStorage.getItem('premiumUnlocked') === '1';
    if (!unlocked) {
      const lockBtn = document.getElementById('unlockBenchmark');
      lockBtn?.addEventListener('click', () => {
        window.location.href = 'analysis.html';
      });
    }
  }
});

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

    const sections = qsa('.form-section');
    const toAnalysisBtn = qs('#toAnalysisBtn');
    const roleLabel = qs('#rolePicked');
    const roleChip = qs('#roleChip');
    const roleEmoji = qs('#roleEmoji');
    const roleFocusCopy = qs('#roleFocusCopy');
    const degreeSelect = qs('#degreeLevel');
    const researchField = qs('#researchField');
    const languageScoreInput = qs('#languageScore');
    const plannedTestField = qs('#plannedTestField');

    let currentRole = role;

    function setActiveRole(r) {
      currentRole = r;
      roleLabel.textContent = r;
      sections.forEach(s => s.classList.toggle('active', s.dataset.role === r));
      document.body.classList.remove('scholarship', 'switcher', 'internship', 'professional', 'jobseeker');
      if (r === 'Scholarship') document.body.classList.add('scholarship');
      if (r === 'Jobseeker') document.body.classList.add('jobseeker');

      const emojiMap = { Scholarship: '🎓', Jobseeker: '💼' };
      if (roleEmoji) roleEmoji.textContent = emojiMap[r] || '🎯';

      const focusMap = {
        Scholarship: 'Pertanyaan khusus untuk kebutuhan beasiswa dan kesiapan akademik kamu.',
        Jobseeker: 'Isi detail pengalaman, skill, dan motivasi agar analisis cocok dengan target kerja kamu.'
      };
      if (roleFocusCopy) roleFocusCopy.textContent = focusMap[r] || 'Jawab pertanyaan sesuai kebutuhan program ini.';

      if (roleChip) {
        roleChip.classList.remove('accent-green', 'accent-blue', 'accent-orange', 'accent-purple');
        const chipAccentMap = {
          Scholarship: 'accent-green',
          Jobseeker: 'accent-blue',
          'Career Switcher': 'accent-orange',
          Internship: 'accent-purple'
        };
        const chipAccent = chipAccentMap[r];
        if (chipAccent) roleChip.classList.add(chipAccent);
      }

      if (r === 'Scholarship') {
        updateScholarshipConditional();
        updateLanguageConditional();
      }
      if (r === 'Jobseeker') setJobseekerDefaults();
    }

    const availableRoles = sections.map(section => section.dataset.role);
    setActiveRole(availableRoles.includes(role) ? role : 'Scholarship');

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function scale(val, inMin, inMax, outMin, outMax) {
      if (inMax === inMin) return outMin;
      const t = (val - inMin) / (inMax - inMin);
      return outMin + t * (outMax - outMin);
    }

    function parseNumberFromText(text) {
      if (!text) return NaN;
      const match = text.replace(',', '.').match(/\d+(?:\.\d+)?/);
      return match ? parseFloat(match[0]) : NaN;
    }

    function parseGpa(text) {
      if (!text) return { value: 0, normalized: 0 };
      const matches = text.replace(',', '.').match(/\d+(?:\.\d+)?/g);
      if (!matches || matches.length === 0) return { value: 0, normalized: 0 };
      const gpa = parseFloat(matches[0]);
      let scaleVal = 4;
      if (matches.length > 1) {
        const parsedScale = parseFloat(matches[1]);
        if (!Number.isNaN(parsedScale) && parsedScale > 0) scaleVal = parsedScale;
      }
      const normalized = clamp((gpa / scaleVal) * 4, 0, 4);
      return { value: gpa, normalized };
    }

    function languageMax(text, numeric) {
      if (!text) return 9;
      const lower = text.toLowerCase();
      if (lower.includes('toefl') || numeric > 9 || lower.includes('ibt')) return 120;
      if (lower.includes('duolingo') || lower.includes('duo')) return 160;
      return 9;
    }

    function updateScholarshipConditional() {
      if (!researchField || !degreeSelect) return;
      const value = degreeSelect.value;
      const showResearch = value === 'Master' || value === 'PhD';
      researchField.classList.toggle('hidden', !showResearch);
    }

    function updateLanguageConditional() {
      if (!plannedTestField || !languageScoreInput) return;
      const text = (languageScoreInput.value || '').toLowerCase();
      const showPlanned = !text || text.includes('belum');
      plannedTestField.classList.toggle('hidden', !showPlanned);
    }

    degreeSelect?.addEventListener('change', updateScholarshipConditional);
    languageScoreInput?.addEventListener('input', updateLanguageConditional);

    function setJobseekerDefaults() {
      // Placeholder for future dynamic defaults.
    }

    function computeScholarship() {
      const { normalized: gpaNormalized } = parseGpa(qs('#gpaScore')?.value || '');
      const degree = degreeSelect?.value || '';
      const academicBase = Math.round(scale(gpaNormalized, 0, 4, 45, 90));
      const degreeBonus = degree === 'PhD' ? 6 : degree === 'Master' ? 4 : degree === 'Bachelor' ? 2 : 0;
      const academic = clamp(academicBase + degreeBonus, 40, 96);

      const languageText = (languageScoreInput?.value || '').trim();
      const languageNumeric = parseNumberFromText(languageText);
      const maxTest = languageMax(languageText, languageNumeric);
      const plannedDate = qs('#plannedTestDate')?.value;
      const scoreExpiry = qs('#scoreExpiry')?.value;
      const hasValidScore = !Number.isNaN(languageNumeric) && languageNumeric > 0;
      const languageScaled = hasValidScore ? Math.round(scale(clamp(languageNumeric, 0, maxTest), 0, maxTest, 40, 92)) : 45;
      let expiryBonus = 0;
      if (scoreExpiry) {
        const expiry = new Date(scoreExpiry);
        const now = new Date();
        const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
        expiryBonus = diffDays > 365 ? 3 : diffDays > 180 ? 1 : diffDays < 0 ? -5 : 0;
      }
      const plannedBonus = !hasValidScore && plannedDate ? 4 : 0;
      const language = clamp(languageScaled + expiryBonus + plannedBonus, 35, 94);

      const workLen = (qs('#workRelevance')?.value || '').trim().length;
      const leadershipLen = (qs('#leadershipStory')?.value || '').trim().length;
      const volunteerLen = (qs('#volunteerImpact')?.value || '').trim().length;
      const researchLen = (qs('#researchAchievements')?.value || '').trim().length;
      const additional = (qs('#additionalTests')?.value || '').trim();
      const experienceBase = Math.round(scale(clamp(workLen + leadershipLen + volunteerLen, 0, 1200), 0, 1200, 42, 92));
      const researchBonus = researchLen > 0 ? 3 : 0;
      const additionalBonus = additional ? 2 : 0;
      const experience = clamp(experienceBase + researchBonus + additionalBonus, 40, 95);

      return {
        labels: ['Academic Background', 'Language Readiness', 'Experience Impact'],
        scores: [academic, language, experience]
      };
    }

    function textLen(selector) {
      return (qs(selector)?.value || '').trim().length;
    }

    function computeJobseeker() {
      const targetLen = textLen('#jsTargetRole');
      const motivationLen = textLen('#jsMotivation');
      const adjustableLen = textLen('#jsAdjustable');
      const portfolioLen = textLen('#jsPortfolio');
      const salaryLen = (qs('#jsSalaryExpectation')?.value || '').trim().length;
      const workModeLen = (document.querySelector('input[name="jsWorkMode"]:checked')?.value || '').length;
      const regionLen = (document.querySelector('input[name="jsRegion"]:checked')?.value || '').length;
      const availability = workModeLen + regionLen;

      // Profile emphasizes clarity of target and motivation
      const profile = Math.round(scale(clamp(targetLen + motivationLen, 0, 1500), 0, 1500, 45, 96));
      // Market readiness emphasizes portfolio visibility, availability preferences, and salary expectation clarity
      const experience = Math.round(scale(clamp(portfolioLen + availability + salaryLen, 0, 1500), 0, 1500, 44, 94));
      // Differentiation comes from flexibility/adjustable notes
      const polish = Math.round(scale(clamp(adjustableLen, 0, 1200), 0, 1200, 42, 92));

      return {
        labels: ['Experience Background', 'Market Readiness', 'Differentiation'],
        scores: [profile, experience, polish]
      };
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
      if (r === 'Jobseeker') return computeJobseeker();
      if (r === 'Career Switcher') return computeSwitcher();
      if (r === 'Internship') return computeIntern();
      return { labels: ['A', 'B', 'C'], scores: [60, 60, 60] };
    }

    toAnalysisBtn.addEventListener('click', () => {
      const active = currentRole;
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
      if (active === 'Jobseeker') {
        const targetRole = (qs('#jsTargetRole')?.value || '').trim();
        const workMode = (document.querySelector('input[name="jsWorkMode"]:checked')?.value || '').trim();
        const region = (document.querySelector('input[name="jsRegion"]:checked')?.value || '').trim();
        const motivation = (qs('#jsMotivation')?.value || '').trim();
        if (targetRole) q.set('targetRole', targetRole);
        if (region) q.set('targetLocation', region);
        if (motivation) q.set('motivation', motivation);
        if (workMode) q.set('workMode', workMode);
      }
      if (active === 'Internship') {
        const level = (document.querySelector('input[name="internLevel"]:checked')?.value || '').trim();
        const notes = (qs('#internLocationOther')?.value || '').trim();
        if (level) q.set('targetRoleLevel', level);
        if (notes) q.set('notes', notes);
      }
      if (active === 'Scholarship') {
        const field = (qs('#intendedField')?.value || '').trim();
        const destination = (qs('#destinationPref')?.value || '').trim();
        if (field) q.set('targetField', field);
        if (destination) q.set('targetLocation', destination);
      }
      window.location.href = `analysis.html?${q.toString()}`;
    });

  }

  // Analysis page logic
  if (isAnalysis) {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || 'Scholarship';

    // Score and header
    const score = Math.max(0, Math.min(100, parseInt(params.get('score') || '65', 10)));
    const scoreValueEl = document.getElementById('scoreValue');
    if (scoreValueEl) scoreValueEl.innerHTML = `${score}<small>/100</small>`;

    const dotEl = document.getElementById('curveDot');
    if (dotEl) {
      const pct = 5 + (score / 100) * 90;
      dotEl.style.left = pct + '%';
    }

    const roleLabelEl = document.getElementById('roleLabel');
    if (roleLabelEl) roleLabelEl.textContent = role;

    // Rebuild highlights with concise points and dynamic red flags
    const highlights = document.querySelector('.highlights');
    if (highlights) {
      highlights.innerHTML = '';
      const add = (text, type = 'success') => {
        const el = document.createElement('div');
        el.className = 'highlight-item';
        const ico = document.createElement('div');
        ico.className = 'ico ' + (type === 'warn' ? 'warn' : 'success');
        ico.textContent = type === 'warn' ? '⚠️' : '✔️';
        const txt = document.createTextNode(' ' + text);
        el.appendChild(ico);
        el.appendChild(txt);
        highlights.appendChild(el);
      };

      if (role === 'Scholarship') {
        // Positive cues
        add('Gunakan Academic CV format: Education • Research • Leadership/Community • Awards • Publications', 'success');
        add('Selaraskan isi CV dengan field/scholarship target (prestasi & impact terlihat)', 'success');

        // Dynamic Red Flags (URL-driven)
        const ieltsScore = parseFloat(params.get('ieltsScore'));
        const ieltsMin = parseFloat(params.get('ieltsMin') || '6.5');
        if (!Number.isNaN(ieltsScore) && !Number.isNaN(ieltsMin) && ieltsScore < ieltsMin) {
          add(`IELTS di bawah minimum (${ieltsScore} < ${ieltsMin})`, 'warn');
        }

        const now = new Date();
        const expStr = params.get('ieltsExpiry'); // expiry date
        const takenStr = params.get('ieltsDate');  // test date
        if (expStr) {
          const exp = new Date(expStr);
          if (!Number.isNaN(exp.getTime()) && exp < now) add('IELTS expired', 'warn');
        } else if (takenStr) {
          const taken = new Date(takenStr);
          if (!Number.isNaN(taken.getTime())) {
            const diffDays = (now - taken) / (1000 * 60 * 60 * 24);
            if (diffDays > 730) add('IELTS expired (>2 tahun)', 'warn');
          }
        }

        const gpa = parseFloat(params.get('gpa'));
        const scale = parseFloat(params.get('gpaScale') || '4');
        const gpaAvg = parseFloat(params.get('gpaAvg') || '3.2');
        if (!Number.isNaN(gpa) && !Number.isNaN(scale) && scale > 0 && !Number.isNaN(gpaAvg)) {
          const normalized = (gpa / scale) * 4;
          if (normalized < gpaAvg) add(`GPA di bawah rata-rata target (${normalized.toFixed(2)}/4 < ${gpaAvg}/4)`, 'warn');
        }
      } else {
        // Non-scholarship concise positives
        add('Format CV rapi dan ringkas', 'success');
        add('Tambahkan keyword relevan dengan role/industry', 'success');
      }
    }

    // Sub-scores
    const defaults = {
      Scholarship: ['Academic Strength', 'Leadership', 'Research Fit'],
      Jobseeker: ['Experience Background', 'Market Readiness', 'Differentiation'],
      'Career Switcher': ['Transferable Skills', 'Role Relevansi', 'Narrative'],
      Internship: ['Project Fit', 'Organization/Activity', 'Growth Potential'],
    };
    const labels = [
      params.get('l1') || (defaults[role]?.[0] || 'Sub-score 1'),
      params.get('l2') || (defaults[role]?.[1] || 'Sub-score 2'),
      params.get('l3') || (defaults[role]?.[2] || 'Sub-score 3'),
    ];
    const s1 = Math.max(0, Math.min(100, parseInt(params.get('s1') || '68', 10)));
    const s2 = Math.max(0, Math.min(100, parseInt(params.get('s2') || '64', 10)));
    const s3 = Math.max(0, Math.min(100, parseInt(params.get('s3') || '62', 10)));

    const bar1LabelEl = document.getElementById('bar1Label');
    const bar2LabelEl = document.getElementById('bar2Label');
    const bar3LabelEl = document.getElementById('bar3Label');
    const bar1ValEl = document.getElementById('bar1Value');
    const bar2ValEl = document.getElementById('bar2Value');
    const bar3ValEl = document.getElementById('bar3Value');
    const bar1FillEl = document.getElementById('bar1Fill');
    const bar2FillEl = document.getElementById('bar2Fill');
    const bar3FillEl = document.getElementById('bar3Fill');

    if (bar1LabelEl) bar1LabelEl.textContent = labels[0];
    if (bar2LabelEl) bar2LabelEl.textContent = labels[1];
    if (bar3LabelEl) bar3LabelEl.textContent = labels[2];
    if (bar1ValEl) bar1ValEl.textContent = s1 + '/100';
    if (bar2ValEl) bar2ValEl.textContent = s2 + '/100';
    if (bar3ValEl) bar3ValEl.textContent = s3 + '/100';
    if (bar1FillEl) bar1FillEl.style.width = s1 + '%';
    if (bar2FillEl) bar2FillEl.style.width = s2 + '%';
    if (bar3FillEl) bar3FillEl.style.width = s3 + '%';

    const accentMap = {
      Scholarship: 'accent-green',
      Jobseeker: 'accent-blue',
      'Career Switcher': 'accent-orange',
      Internship: 'accent-purple',
    };
    const accent = accentMap[role] || '';
    [bar1FillEl, bar2FillEl, bar3FillEl].forEach(el => {
      el?.classList.remove('accent-green', 'accent-orange', 'accent-purple', 'accent-blue');
      if (accent && el) el.classList.add(accent);
    });

    const badgeEl = document.getElementById('profileBadge');
    if (badgeEl) badgeEl.textContent = `${role} Snapshot`;

    // Toggle Scholarship Lens section visibility
    const lensSection = document.getElementById('scholarshipLens');
    if (lensSection) lensSection.style.display = role === 'Scholarship' ? '' : 'none';

    // Scholarship Lens — concise academic CV checklist
    const schChecklist = document.getElementById('schChecklist');
    if (schChecklist && role === 'Scholarship') {
      const items = [
        'Academic CV format (not corporate). Sections: Education • Research • Leadership/Community • Awards • Publications.',
        'Proper structure: clean/ATS-friendly, avoid heavy design.',
        'Language: formal academic tone, consistent formatting, clear action verbs.',
        'Scholarship relevance: Education kuat; leadership/community disorot; capaian terukur; align dengan field.',
        'Red flags to check: IELTS expired/low; GPA di bawah rata-rata; CV terlalu job-style; referees tidak ada.',
        'Visual consistency & neatness: font/margin/heading seragam; bullet alignment; section balance; tidak terlalu padat atau kosong.',
        'Document hygiene: perbaiki typo; filename "CV_Scholarship_Name_2025.pdf"; PDF rapi (<2MB, tidak blur).',
        'Links & contacts: Google Scholar/ResearchGate/LinkedIn aktif; email profesional; link publikasi/portfolio valid.',
        '6-second impression: bidang studi, topik riset, prestasi utama langsung terlihat.',
        'Screening lens: hindari tone terlalu career-oriented; jelaskan gap studi; tekankan academic/leadership impact.',
        'Academic branding: konsisten dengan profil LinkedIn/Scholar; gunakan kata kerja akademik (researched, published, presented); hasil terlihat jelas.'
      ];
      schChecklist.innerHTML = '';
      items.forEach((txt) => {
        const li = document.createElement('li');
        li.className = 'suggest-item';
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = txt;
        li.appendChild(name);
        schChecklist.appendChild(li);
      });
    }

    // Optional: region/background quick fill
    const region = params.get('targetLocation');
    const regionLabelEl = document.getElementById('regionLabel');
    if (region && regionLabelEl) regionLabelEl.textContent = region;
    const motivation = params.get('motivation');
    const backgroundEl = document.getElementById('backgroundLabel');
    if (role === 'Jobseeker' && motivation && backgroundEl) {
      backgroundEl.textContent = motivation.slice(0, 60);
    }

    // Academic CV (ATS) Draft — show only for Scholarship
    const cvDraft = document.getElementById('academicCvDraft');
    if (cvDraft) cvDraft.style.display = role === 'Scholarship' ? '' : 'none';

    if (role === 'Scholarship' && cvDraft) {
      const academicSummary = document.getElementById('academicSummary');
      const eduList = document.getElementById('academicEducation');
      const resList = document.getElementById('academicResearch');
      const pubList = document.getElementById('academicPublications');
      const presList = document.getElementById('academicPresentations');
      const awdList = document.getElementById('academicAwards');
      const leadList = document.getElementById('academicLeadership');
      const sklList = document.getElementById('academicSkills');
      const refList = document.getElementById('academicReferences');

      const targetField = params.get('targetField') || params.get('field') || 'your focus area';
      const gpa = params.get('gpa');
      const gpaScale = params.get('gpaScale') || '4.00';

      if (academicSummary) {
        const gpaSnippet = gpa ? ` (GPA ${parseFloat(gpa).toFixed(2)}/${gpaScale})` : '';
        academicSummary.textContent = `Early-career researcher focusing on ${targetField}. Experienced in quantitative/qualitative methods and academic writing${gpaSnippet}. Aiming to leverage a scholarship to deepen research and deliver measurable impact in ${targetField}.`;
      }

      const fill = (ul, items) => {
        if (!ul) return;
        ul.innerHTML = '';
        items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      };

      fill(eduList, [
        'Your University — Program Studi [Tahun lulus]; highlight: GPA / penghargaan (isi).',
        'Tugas akhir/tesis: sebutkan judul singkat, metode utama, ukuran sampel, dan hasil kunci (angka).'
      ]);

      fill(resList, [
        'Researched [topik] menggunakan [metode/tools: Python/R/SPSS/SQL]; menganalisis n=[N] data; hasil: [metrik, mis. akurasi +x%].',
        'Designed survey/eksperimen (hypothesis testing); validasi instrumen (Cronbach’s α=[x.xx]); uji statistik (t-test/ANOVA/regresi).',
        'Collaborated dengan PI/dosen/asisten; menyusun manuskrip dan submitted ke [konferensi/jurnal].'
      ]);

      fill(pubList, [
        '[Nama Anda], [Rekan]. (Tahun). "[Judul]". [Jurnal/Prosiding]. DOI/Link.',
        'Working paper: "[Judul]", under review at [Konferensi/Jurnal].'
      ]);

      fill(presList, [
        '[Judul Presentasi], [Konferensi/Seminar], [Kota, Tahun].',
        'Poster: [Judul], [Event], [Tahun].'
      ]);

      fill(awdList, [
        '[Nama Beasiswa/Penghargaan], [Penyelenggara], [Tahun].',
        '[Sertifikasi: IELTS x.x (YYYY), TOEFL iBT xxx, dsb.]'
      ]);

      fill(leadList, [
        'Led [N] anggota untuk program [nama]; hasil: [impact terukur: +x%, Rp x], publikasi internal/eksternal.',
        'Mentored [N] mahasiswa pada [topik]; menyusun modul materi dan evaluasi.'
      ]);

      fill(sklList, [
        'Tools: Python (pandas, scikit-learn), R (tidyverse), SPSS, SQL, Tableau/Power BI, Excel Advanced.',
        'Methods: literature review, survey design, data modeling, hypothesis testing, A/B testing, causal inference (DID/PSM), NLP dasar.',
        'Academic: academic writing, publishing workflow, conference presentation, citation management (Zotero/Mendeley).'
      ]);

      fill(refList, [
        '[Nama, Gelar] — [Jabatan, Institusi] — [email] (opsional).'
      ]);
    }

    // Preview card population
    const previewCard = document.getElementById('previewCard');
    const previewSummary = document.getElementById('previewSummary');
    const previewProjects = document.getElementById('previewProjects');
    const previewSkills = document.getElementById('previewSkills');
    if (previewCard) {
      previewCard.classList.remove('accent-green', 'accent-orange', 'accent-purple', 'accent-blue');
      if (accent) previewCard.classList.add(accent);

      const targetRole = params.get('targetRole');
      const previewData = {
        Scholarship: {
          summary: 'Scholarship-focused candidate with solid academics and consistent leadership impact. Interested in research on [topic] with community contribution.',
          projects: [
            'Research assistant: contributed to data collection and analysis; summarized findings into 2-page brief.',
            'Capstone project: built prototype addressing [problem]; presented to faculty panel.'
          ],
          skills: 'Academic Writing • Research Methods • Data Analysis • Leadership'
        },
        Jobseeker: {
          summary: `Strategic professional targeting ${targetRole || 'role baru'}; menonjolkan pengalaman, skill, dan motivasi yang siap dijual ke perusahaan target.`,
          projects: [
            'Key accomplishment: delivered measurable impact (e.g., +18% revenue, -25% churn) dengan kolaborasi lintas tim.',
            'Growth plan: 90-day roadmap (sertifikasi, mentoring, project sampel) untuk mempercepat adaptasi di role baru.'
          ],
          skills: 'Strategic Execution • Stakeholder Management • Impact Storytelling • Continuous Learning'
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
      const entry = previewData[role] || previewData.Scholarship;
      if (previewSummary) previewSummary.textContent = entry.summary;
      if (previewSkills) previewSkills.textContent = entry.skills;
      if (previewProjects && Array.isArray(entry.projects)) {
        previewProjects.innerHTML = '';
        entry.projects.forEach(p => {
          const li = document.createElement('li');
          li.textContent = p;
          previewProjects.appendChild(li);
        });
      }
    }

    // Premium gating & lock modal
    const unlockBtn = document.getElementById('unlockBtn');
    const lockModal = document.getElementById('lockModal');
    const closeLock = document.getElementById('closeLock');
    const stayFree = document.getElementById('stayFree');
    const goToPayment = document.getElementById('goToPayment');
    const downloadBtn = document.getElementById('downloadBtn');

    const unlocked = localStorage.getItem('premiumUnlocked') === '1' || params.get('unlocked') === '1';
    if (unlocked) {
      if (downloadBtn) downloadBtn.disabled = false;
      document.querySelectorAll('.lock-overlay').forEach(el => el.remove());
      document.querySelectorAll('.preview-watermark').forEach(el => el.remove());
      const premiumTitle = document.querySelector('.premium-box .title');
      if (premiumTitle) premiumTitle.textContent = 'Premium Aktif – Akses Penuh Terbuka';
      if (unlockBtn) {
        unlockBtn.textContent = 'Sudah Premium';
        unlockBtn.classList.add('disabled');
        unlockBtn.setAttribute('disabled', 'true');
      }
    }

    unlockBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      lockModal?.classList.add('show');
    });
    closeLock?.addEventListener('click', () => lockModal?.classList.remove('show'));
    stayFree?.addEventListener('click', () => lockModal?.classList.remove('show'));
    goToPayment?.addEventListener('click', () => { window.location.href = 'payment.html'; });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('premiumUnlocked', '1');
        window.location.href = 'payment-success.html';
      });
    }
  }

  // Payment success page logic
  if (isSuccess) {
    const goAnalysis = document.getElementById('goAnalysis');
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

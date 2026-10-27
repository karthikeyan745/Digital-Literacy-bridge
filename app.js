/**
 * Digital Literacy Bridge - Core Application Logic
 * Pair Programming Project 2026
 */

// Application State
const state = {
  userId: localStorage.getItem('dlb_user_id') || 'DLB-2026-8941',
  githubRepo: localStorage.getItem('dlb_github_repo') || '',
  stars: parseInt(localStorage.getItem('dlb_stars') || '0', 10),
  activeModule: 'dashboard',
  fontSizeIndex: 0,
  isDarkMode: false,
  isReadingAloud: false,
  modules: {
    email: { completed: false, starsEarned: false },
    social: { completed: false, starsEarned: false },
    banking: { completed: false, starsEarned: false },
    scam: { completed: false, starsEarned: false, score: 0 }
  }
};

// Load saved modules state if available
try {
  const savedMods = localStorage.getItem('dlb_modules');
  if (savedMods) {
    state.modules = JSON.parse(savedMods);
  }
} catch (e) {
  console.warn('Could not parse saved modules', e);
}

// Module Metadata
const MODULE_NAMES = {
  dashboard: 'Dashboard',
  email: 'Email Essentials',
  social: 'Social & Privacy',
  banking: 'Banking & UPI Safety',
  scam: 'Scam Awareness',
  certificate: 'Certificate of Completion'
};

/* ==========================================================
   INITIALIZATION
   ========================================================== */
window.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
  updateProgressUI();
  updateGithubUI();
  loadModule('dashboard');
  setupConfetti();
});

function saveState() {
  localStorage.setItem('dlb_user_id', state.userId);
  localStorage.setItem('dlb_github_repo', state.githubRepo);
  localStorage.setItem('dlb_stars', state.stars.toString());
  localStorage.setItem('dlb_modules', JSON.stringify(state.modules));
}

/* ==========================================================
   USER ID MANAGEMENT
   ========================================================== */
function updateUserUI() {
  const userElem = document.getElementById('displayUserId');
  const profileName = document.getElementById('learnerProfileName');
  if (userElem) userElem.textContent = state.userId;
  if (profileName) profileName.textContent = state.userId;
}

function promptChangeUser() {
  const modal = document.getElementById('userModal');
  const input = document.getElementById('inputUserId');
  if (modal && input) {
    input.value = state.userId;
    modal.classList.remove('hidden');
    input.focus();
  }
}

function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (modal) modal.classList.add('hidden');
}

function generateRandomUserId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const input = document.getElementById('inputUserId');
  if (input) input.value = `DLB-2026-${rand}`;
}

function saveUserId() {
  const input = document.getElementById('inputUserId');
  if (input && input.value.trim()) {
    state.userId = input.value.trim();
    saveState();
    updateUserUI();
    closeUserModal();
    showToast(`👤 Learner ID updated to ${state.userId}`);
    // If currently on certificate or dashboard, re-render
    if (state.activeModule === 'certificate' || state.activeModule === 'dashboard') {
      loadModule(state.activeModule);
    }
  }
}

/* ==========================================================
   PROGRESS & STARS
   ========================================================== */
function calculateOverallPercentage() {
  const keys = ['email', 'social', 'banking', 'scam'];
  const completedCount = keys.filter(k => state.modules[k].completed).length;
  return Math.round((completedCount / keys.length) * 100);
}

function updateProgressUI() {
  const pct = calculateOverallPercentage();
  const pctElem = document.getElementById('overallPercent');
  const miniBar = document.getElementById('miniBarFill');
  const starsElem = document.getElementById('stars');
  
  if (pctElem) pctElem.textContent = `${pct}%`;
  if (miniBar) miniBar.style.width = `${pct}%`;
  if (starsElem) starsElem.textContent = state.stars;

  // Update sidebar pills
  ['email', 'social', 'banking', 'scam'].forEach(key => {
    const pill = document.getElementById(`pill-${key}`);
    const badge = document.getElementById(`badge-${key}`);
    if (pill) {
      if (state.modules[key].completed) {
        pill.textContent = '100%';
        pill.classList.add('complete');
      } else {
        pill.textContent = '0%';
        pill.classList.remove('complete');
      }
    }
    if (badge) {
      if (state.modules[key].completed) {
        badge.classList.add('earned');
      } else {
        badge.classList.remove('earned');
      }
    }
  });

  // Certificate pill
  const certPill = document.getElementById('pill-certificate');
  if (certPill) {
    if (pct === 100) {
      certPill.textContent = 'Unlocked';
      certPill.classList.add('complete');
    } else {
      certPill.textContent = `${pct}% / 100%`;
      certPill.classList.remove('complete');
    }
  }

  // Learner level badge
  const levelElem = document.getElementById('learnerBadgeLevel');
  if (levelElem) {
    if (pct === 100) levelElem.textContent = '🏆 Certified Cyber Safe';
    else if (pct >= 50) levelElem.textContent = '⚡ Skilled Navigator';
    else if (pct > 0) levelElem.textContent = '🌱 Active Learner';
    else levelElem.textContent = 'Novice Explorer';
  }
}

function earnStar(points = 1) {
  state.stars += points;
  saveState();
  updateProgressUI();
  playMelodicChime();
  launchConfetti();

  const badge = document.getElementById('starsBadge');
  if (badge) {
    badge.classList.add('active-pulse');
    setTimeout(() => badge.classList.remove('active-pulse'), 800);
  }
}

function resetProgress() {
  if (confirm('Are you sure you want to reset all your progress, tasks, and stars?')) {
    state.stars = 0;
    state.modules = {
      email: { completed: false, starsEarned: false },
      social: { completed: false, starsEarned: false },
      banking: { completed: false, starsEarned: false },
      scam: { completed: false, starsEarned: false, score: 0 }
    };
    saveState();
    updateProgressUI();
    loadModule(state.activeModule);
    showToast('🔄 All progress has been reset.');
  }
}

/* ==========================================================
   AUDIO SYNTHESIS (Zero External Asset Chime)
   ========================================================== */
function playMelodicChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.38);
    });
  } catch (err) {
    console.log('Audio chime not supported or muted', err);
  }
}

/* ==========================================================
   ACCESSIBILITY: TEXT-TO-SPEECH & READ ALOUD
   ========================================================== */
function toggleReadAloud() {
  if (!('speechSynthesis' in window)) {
    showToast('⚠️ Text-to-speech is not supported by your browser.');
    return;
  }

  const btn = document.getElementById('ttsBtn');
  const icon = document.getElementById('ttsIcon');

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    state.isReadingAloud = false;
    if (btn) btn.classList.remove('active-pulse');
    if (icon) icon.textContent = '🔊';
    showToast('⏹️ Reading stopped.');
    return;
  }

  const contentArea = document.getElementById('content');
  if (!contentArea) return;

  const textToRead = contentArea.innerText.replace(/[\n\r]+/g, '. ');
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    state.isReadingAloud = false;
    if (btn) btn.classList.remove('active-pulse');
    if (icon) icon.textContent = '🔊';
  };

  utterance.onerror = () => {
    state.isReadingAloud = false;
    if (btn) btn.classList.remove('active-pulse');
    if (icon) icon.textContent = '🔊';
  };

  window.speechSynthesis.speak(utterance);
  state.isReadingAloud = true;
  if (btn) btn.classList.add('active-pulse');
  if (icon) icon.textContent = '⏸️';
  showToast('🔊 Reading page aloud...');
}

/* Font Sizing */
function cycleFontSize() {
  const sizes = ['', 'font-size-large', 'font-size-xlarge'];
  const labels = ['Default Text Size', 'Large Text Size', 'Extra-Large Text Size'];
  
  sizes.forEach(cls => { if (cls) document.body.classList.remove(cls); });
  state.fontSizeIndex = (state.fontSizeIndex + 1) % sizes.length;
  
  const nextClass = sizes[state.fontSizeIndex];
  if (nextClass) document.body.classList.add(nextClass);
  showToast(`🔤 ${labels[state.fontSizeIndex]}`);
}

/* Dark Mode */
function toggleDarkMode() {
  state.isDarkMode = !state.isDarkMode;
  document.body.classList.toggle('dark-mode', state.isDarkMode);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = state.isDarkMode ? '☀️' : '🌙';
  }
  showToast(state.isDarkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

/* Toast Notifications */
function showToast(msg) {
  const toast = document.getElementById('notification-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

/* ==========================================================
   MODULE LOADER & ROUTER
   ========================================================== */
function loadModule(mod) {
  // If reading aloud, cancel speech on navigation
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    const btn = document.getElementById('ttsBtn');
    const icon = document.getElementById('ttsIcon');
    if (btn) btn.classList.remove('active-pulse');
    if (icon) icon.textContent = '🔊';
  }

  state.activeModule = mod;
  const modLabel = document.getElementById('activeModuleName');
  if (modLabel) modLabel.textContent = MODULE_NAMES[mod] || mod;

  // Active navigation button style
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${mod}`);
  if (activeBtn) activeBtn.classList.add('active');

  const container = document.getElementById('content');
  if (!container) return;

  // Route to module view
  switch (mod) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'email':
      renderEmailModule(container);
      break;
    case 'social':
      renderSocialModule(container);
      break;
    case 'banking':
      renderBankingModule(container);
      break;
    case 'scam':
      renderScamModule(container);
      break;
    case 'certificate':
      renderCertificateModule(container);
      break;
    default:
      renderDashboard(container);
  }

  updateProgressUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   1. DASHBOARD VIEW
   ========================================================== */
function renderDashboard(container) {
  const pct = calculateOverallPercentage();
  const emailDone = state.modules.email.completed;
  const socialDone = state.modules.social.completed;
  const bankingDone = state.modules.banking.completed;
  const scamDone = state.modules.scam.completed;

  container.innerHTML = `
    <div class="hero-banner">
      <h2 class="hero-title">Welcome to Digital Literacy Bridge, ${state.userId}!</h2>
      <p class="hero-subtitle">
        Bridging the digital divide with interactive simulations in Email Safety, Social Privacy, Digital Banking / UPI, and Scam Detection.
      </p>
      <div class="hero-stats-row">
        <div class="hero-stat-box">
          <div class="hero-stat-number">${pct}%</div>
          <div class="hero-stat-label">Course Progress</div>
        </div>
        <div class="hero-stat-box">
          <div class="hero-stat-number">${state.stars} ⭐</div>
          <div class="hero-stat-label">Stars Earned</div>
        </div>
        <div class="hero-stat-box">
          <div class="hero-stat-number">${[emailDone, socialDone, bankingDone, scamDone].filter(Boolean).length}/4</div>
          <div class="hero-stat-label">Modules Mastered</div>
        </div>
      </div>
    </div>

    <div class="card-header">
      <h3 class="card-title">🚀 Interactive Learning Modules</h3>
      <span class="badge-label">Click any card to start</span>
    </div>

    <div class="module-grid">
      <!-- Email Module Card -->
      <div class="mod-card">
        <div class="mod-card-top">
          <div class="mod-card-icon">📧</div>
          <span class="mod-card-status ${emailDone ? 'done' : ''}">${emailDone ? '✅ Completed' : '0% Progress'}</span>
        </div>
        <h4 class="mod-card-title">1. Email Essentials</h4>
        <p class="mod-card-summary">
          Master how to spot phishing links, inspect sender addresses, verify attachments, and send secure messages.
        </p>
        <button class="btn ${emailDone ? 'secondary' : 'primary'}" onclick="loadModule('email')">
          ${emailDone ? 'Review Module' : 'Start Email Module →'}
        </button>
      </div>

      <!-- Social Media Card -->
      <div class="mod-card">
        <div class="mod-card-top">
          <div class="mod-card-icon">🌐</div>
          <span class="mod-card-status ${socialDone ? 'done' : ''}">${socialDone ? '✅ Completed' : '0% Progress'}</span>
        </div>
        <h4 class="mod-card-title">2. Social Media & Privacy</h4>
        <p class="mod-card-summary">
          Protect your personal identity, evaluate password strength, and configure privacy toggles against identity theft.
        </p>
        <button class="btn ${socialDone ? 'secondary' : 'primary'}" onclick="loadModule('social')">
          ${socialDone ? 'Review Module' : 'Start Privacy Module →'}
        </button>
      </div>

      <!-- Banking & UPI Card -->
      <div class="mod-card">
        <div class="mod-card-top">
          <div class="mod-card-icon">🏦</div>
          <span class="mod-card-status ${bankingDone ? 'done' : ''}">${bankingDone ? '✅ Completed' : '0% Progress'}</span>
        </div>
        <h4 class="mod-card-title">3. Digital Banking & UPI</h4>
        <p class="mod-card-summary">
          Learn the Golden Rule of UPI PINs, safe QR code scanning, and OTP defense against fraudulent collect requests.
        </p>
        <button class="btn ${bankingDone ? 'secondary' : 'primary'}" onclick="loadModule('banking')">
          ${bankingDone ? 'Review Module' : 'Start Banking Module →'}
        </button>
      </div>

      <!-- Scam Awareness Card -->
      <div class="mod-card">
        <div class="mod-card-top">
          <div class="mod-card-icon">🕵️</div>
          <span class="mod-card-status ${scamDone ? 'done' : ''}">${scamDone ? '✅ Completed' : '0% Progress'}</span>
        </div>
        <h4 class="mod-card-title">4. Scam & Fraud Awareness</h4>
        <p class="mod-card-summary">
          Hands-on simulation cards: Identify fake electricity notices, lottery scams, part-time job frauds, and emergency calls.
        </p>
        <button class="btn ${scamDone ? 'secondary' : 'primary'}" onclick="loadModule('scam')">
          ${scamDone ? 'Review Module' : 'Start Scam Buster →'}
        </button>
      </div>
    </div>

    <!-- Daily Digital Safety Tip Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">💡 Today's Digital Safety Golden Rules</h3>
        <button class="btn secondary" onclick="showToast('💡 Tip saved to your study notes!')">Bookmark</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
          <strong>🔑 Golden Rule #1: UPI PIN</strong>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">
            UPI PIN is <em>ONLY</em> for sending money or checking balance. You NEVER need to enter a UPI PIN to receive money.
          </p>
        </div>
        <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--warning);">
          <strong>🔒 Golden Rule #2: One Time Passwords (OTP)</strong>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">
            Bank employees, police, or courier agents will NEVER ask for your OTP. Sharing an OTP gives complete access to your account.
          </p>
        </div>
        <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--success);">
          <strong>🌐 Golden Rule #3: Verify Links</strong>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">
            Always inspect the domain name before clicking. Official websites end with trusted domains (e.g. .gov.in, .edu, or official domain).
          </p>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================
   2. EMAIL ESSENTIALS MODULE
   ========================================================== */
function renderEmailModule(container) {
  const isDone = state.modules.email.completed;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">📧 Module 1: Email Essentials & Phishing Shield</h2>
          <p class="card-desc">
            Learn the anatomy of an email, how to identify deceptive senders, and practice spotting phishing threats in a simulated inbox.
          </p>
        </div>
        <span class="mod-card-status ${isDone ? 'done' : ''}">${isDone ? '✅ Completed' : 'Task Incomplete'}</span>
      </div>

      <!-- Quick Concept Guide -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div style="background: var(--bg-app); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--primary);">1. Check Sender Address</strong>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Look past the display name. Check the actual domain (e.g. @support-google-login.xyz is FAKE).</p>
        </div>
        <div style="background: var(--bg-app); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--primary);">2. Beware False Urgency</strong>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Scammers create panic like "Account suspended in 24 hours!" to stop you from thinking clearly.</p>
        </div>
        <div style="background: var(--bg-app); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--primary);">3. Dangerous Attachments</strong>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Never open files ending in .exe, .scr, or double extensions like invoice.pdf.exe.</p>
        </div>
      </div>

      <!-- Interactive Email Inbox Simulator -->
      <h3 style="margin-bottom: 12px; font-size: 1.15rem;">📥 Practical Simulator: Interactive Phishing Inspector</h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">
        Click the emails below to inspect them. Decide which one is a malicious phishing scam!
      </p>

      <div class="email-inbox">
        <div class="email-list">
          <div class="email-item active" id="mail-tab-1" onclick="switchEmailTab(1)">
            <div class="email-sender">
              <span>Security Alert</span>
              <span style="color: var(--danger); font-size: 0.75rem;">Urgent</span>
            </div>
            <div class="email-subj">⚠️ Account Security Notice: Verify Now</div>
          </div>
          <div class="email-item" id="mail-tab-2" onclick="switchEmailTab(2)">
            <div class="email-sender">
              <span>Dean Academic Office</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Today</span>
            </div>
            <div class="email-subj">📋 Project 2026 Schedule & Guidelines</div>
          </div>
        </div>

        <div class="email-view" id="email-view-content">
          <!-- Default loaded email 1 -->
        </div>
      </div>

      <!-- Module Completion Action -->
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-weight: 700; font-size: 1rem;">Module Status:</span>
          <span id="emailTaskStatusText" style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; margin-left: 8px;">
            ${isDone ? 'Completed! +2 Stars Awarded ⭐⭐' : 'Complete the email inspection task above.'}
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn secondary" onclick="loadModule('dashboard')">Back to Dashboard</button>
          <button class="btn ${isDone ? 'secondary' : 'primary'}" id="btnCompleteEmail" onclick="completeEmailModule()">
            ${isDone ? 'Review Completed Task' : 'Submit & Claim ⭐ (+2 Stars)'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Render first sample email
  switchEmailTab(1);
}

function switchEmailTab(id) {
  const tab1 = document.getElementById('mail-tab-1');
  const tab2 = document.getElementById('mail-tab-2');
  const view = document.getElementById('email-view-content');

  if (id === 1) {
    if (tab1) tab1.classList.add('active');
    if (tab2) tab2.classList.remove('active');
    view.innerHTML = `
      <div class="email-header-meta">
        <div class="meta-row"><span class="meta-label">From:</span> <strong>Security Team &lt;no-reply@acc0unt-sec-g00gle.xyz&gt;</strong></div>
        <div class="meta-row"><span class="meta-label">To:</span> ${state.userId} &lt;learner@dlb.org&gt;</div>
        <div class="meta-row"><span class="meta-label">Subject:</span> <strong>URGENT: Your account will be DELETED within 24 hours!</strong></div>
      </div>
      <div class="email-body-text">
        Dear User,<br><br>
        We detected an unauthorized login attempt from a strange IP address. To prevent immediate suspension and permanent deletion of your files, you must verify your identity immediately by clicking below:<br><br>
        <a href="#fakelink" onclick="event.preventDefault(); inspectFakeLink();" style="display:inline-block; background:#ef4444; color:#fff; padding:8px 16px; border-radius:6px; text-decoration:none; font-weight:700;">
          👉 Click Here To Verify Password & Identity
        </a><br><br>
        If you do not verify within 24 hours, your account will be locked forever.<br><br>
        Sincerely,<br>
        Security Administration
      </div>
      <div class="phishing-banner">
        <span>🔎 <strong>Inspection Clues:</strong> Notice the domain is <code>acc0unt-sec-g00gle.xyz</code> (Zero instead of letter 'O', ends in .xyz instead of google.com). Creates artificial panic.</span>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button class="btn danger" onclick="markEmailVerdict(true)">🚨 Flag as Phishing Scam</button>
        <button class="btn secondary" onclick="markEmailVerdict(false)">Mark as Safe Email</button>
      </div>
      <div id="email-verdict-box" style="margin-top: 10px;"></div>
    `;
  } else {
    if (tab1) tab1.classList.remove('active');
    if (tab2) tab2.classList.add('active');
    view.innerHTML = `
      <div class="email-header-meta">
        <div class="meta-row"><span class="meta-label">From:</span> <strong>Academic Office &lt;dean.academics@college.edu&gt;</strong></div>
        <div class="meta-row"><span class="meta-label">To:</span> ${state.userId} &lt;learner@dlb.org&gt;</div>
        <div class="meta-row"><span class="meta-label">Subject:</span> <strong>Project 2026 Submission Schedule & Digital Literacy Guidelines</strong></div>
      </div>
      <div class="email-body-text">
        Dear Student,<br><br>
        The official schedule for the 2026 Academic Project Reviews has been published on the student portal. Please check the portal syllabus section for full guidelines.<br><br>
        No passwords or personal details are required to view the calendar. Please reach out to your faculty guide for review timing.<br><br>
        Best regards,<br>
        Academic Affairs Directorate
      </div>
      <div style="background: var(--success-bg); border: 1px solid #86efac; color: #166534; padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem;">
        <span>✅ <strong>Legitimate Email:</strong> Sent from trusted domain <code>college.edu</code>, contains no threat of account deletion, asks for no passwords or OTPs.</span>
      </div>
    `;
  }
}

function inspectFakeLink() {
  alert('⚠️ WARNING: In real life, hovering or clicking links in suspicious emails can lead to dangerous malware or credential harvesting websites! Always check sender address first.');
}

function markEmailVerdict(isPhishing) {
  const box = document.getElementById('email-verdict-box');
  if (isPhishing) {
    box.innerHTML = `
      <div class="verdict-box correct">
        🎉 <strong>Spot-on! Correct Decision!</strong><br>
        You correctly identified this as a Phishing attack. The fake domain, extreme urgency, and request for credentials were dead giveaways!
      </div>
    `;
    state.modules.email.taskPassed = true;
    showToast('🎯 Excellent eye! You identified the phishing email.');
  } else {
    box.innerHTML = `
      <div class="verdict-box wrong">
        ❌ <strong>Caution!</strong> This email is a dangerous phishing attempt. Notice the misspelled domain <code>acc0unt-sec-g00gle.xyz</code> and the threat of urgent suspension.
      </div>
    `;
    showToast('⚠️ Caution: That was a phishing scam!');
  }
}

function completeEmailModule() {
  if (!state.modules.email.completed) {
    state.modules.email.completed = true;
    earnStar(2);
    saveState();
    updateProgressUI();
    showToast('🎉 Module 1 Completed! +2 Stars earned!');
    loadModule('email');
  } else {
    showToast('✅ Module already completed! You can review or proceed to Module 2.');
  }
}

/* ==========================================================
   3. SOCIAL MEDIA & PRIVACY MODULE
   ========================================================== */
function renderSocialModule(container) {
  const isDone = state.modules.social.completed;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">🌐 Module 2: Social Media & Privacy Defense</h2>
          <p class="card-desc">
            Configure social account security, learn how data aggregators profile you, and test your password resilience.
          </p>
        </div>
        <span class="mod-card-status ${isDone ? 'done' : ''}">${isDone ? '✅ Completed' : 'Task Incomplete'}</span>
      </div>

      <!-- Privacy Setting Simulation -->
      <h3 style="margin-bottom: 10px; font-size: 1.15rem;">🛡️ Interactive Privacy Guard Simulator</h3>
      <p style="font-size: 0.9rem; color: var(--text-muted);">
        Toggle these settings to establish an optimal defense profile for your social media account:
      </p>

      <div class="privacy-toggle-list">
        <div class="privacy-toggle-item">
          <div class="privacy-meta">
            <h4>Private Profile Mode</h4>
            <p>Only people you explicitly approve as friends can view your photos and posts.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="privToggle1" checked onchange="updatePrivacyScore()">
            <span class="slider"></span>
          </label>
        </div>

        <div class="privacy-toggle-item">
          <div class="privacy-meta">
            <h4>Hide Phone Number & Email from Public Search</h4>
            <p>Prevents scammers from looking up your profile with leaked databases.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="privToggle2" checked onchange="updatePrivacyScore()">
            <span class="slider"></span>
          </label>
        </div>

        <div class="privacy-toggle-item">
          <div class="privacy-meta">
            <h4>Require Tag Approval</h4>
            <p>Review and approve photos or posts before they appear on your public timeline.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="privToggle3" checked onchange="updatePrivacyScore()">
            <span class="slider"></span>
          </label>
        </div>

        <div class="privacy-toggle-item">
          <div class="privacy-meta">
            <h4>Disable Real-time GPS Location Tagging</h4>
            <p>Avoid revealing where you live or when your house is empty while traveling.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="privToggle4" checked onchange="updatePrivacyScore()">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Password Strength Tester -->
      <div class="pw-tester-card">
        <h3 style="font-size: 1.1rem; margin-bottom: 6px;">🔑 Interactive Password Strength Evaluator</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted);">
          Type any sample password below to see how strong it is and learn what makes a bulletproof password:
        </p>
        <div class="pw-input-wrap">
          <input type="text" id="samplePwInput" class="pw-input" placeholder="e.g. Try typing: password123 vs Safe#Bridge2026!" oninput="evaluatePasswordStrength(this.value)">
        </div>
        <div class="pw-meter">
          <div class="pw-meter-bar" id="pwMeterBar"></div>
        </div>
        <div class="pw-feedback" id="pwFeedbackText">Enter a sample password to evaluate.</div>
      </div>

      <!-- Action Footer -->
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-weight: 700; font-size: 1rem;">Module Status:</span>
          <span id="socialTaskStatusText" style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; margin-left: 8px;">
            ${isDone ? 'Completed! +2 Stars Awarded ⭐⭐' : 'Adjust privacy settings or test a strong password.'}
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn secondary" onclick="loadModule('dashboard')">Back to Dashboard</button>
          <button class="btn ${isDone ? 'secondary' : 'primary'}" onclick="completeSocialModule()">
            ${isDone ? 'Review Completed Task' : 'Save Settings & Claim ⭐ (+2 Stars)'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Init password evaluate default
  evaluatePasswordStrength('Safe#Bridge2026!');
}

function updatePrivacyScore() {
  const t1 = document.getElementById('privToggle1').checked;
  const t2 = document.getElementById('privToggle2').checked;
  const t3 = document.getElementById('privToggle3').checked;
  const t4 = document.getElementById('privToggle4').checked;
  const activeCount = [t1, t2, t3, t4].filter(Boolean).length;
  showToast(`🛡️ Privacy Protection Level: ${(activeCount / 4) * 100}%`);
}

function evaluatePasswordStrength(val) {
  const bar = document.getElementById('pwMeterBar');
  const text = document.getElementById('pwFeedbackText');
  if (!bar || !text) return;

  if (!val) {
    bar.style.width = '0%';
    bar.className = 'pw-meter-bar';
    text.textContent = 'Enter a password to test.';
    return;
  }

  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (score <= 2) {
    bar.className = 'pw-meter-bar weak';
    text.innerHTML = '<span style="color:var(--danger)">⚠️ Weak Password:</span> Too short or easily guessed by automated dictionary attacks.';
  } else if (score <= 4) {
    bar.className = 'pw-meter-bar medium';
    text.innerHTML = '<span style="color:var(--warning)">⚡ Medium Password:</span> Good start! Add special symbols (#, $, !) and make it 12+ characters.';
  } else {
    bar.className = 'pw-meter-bar strong';
    text.innerHTML = '<span style="color:var(--success)">🛡️ Strong & Resilient:</span> Excellent combination of length, casing, numbers, and symbols!';
  }
}

function completeSocialModule() {
  if (!state.modules.social.completed) {
    state.modules.social.completed = true;
    earnStar(2);
    saveState();
    updateProgressUI();
    showToast('🎉 Module 2 Completed! +2 Stars earned!');
    loadModule('social');
  } else {
    showToast('✅ Module already completed! You can review or proceed to Module 3.');
  }
}

/* ==========================================================
   4. DIGITAL BANKING & UPI SAFETY MODULE
   ========================================================== */
function renderBankingModule(container) {
  const isDone = state.modules.banking.completed;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">🏦 Module 3: Digital Banking & UPI Safety</h2>
          <p class="card-desc">
            Understand how UPI (Unified Payments Interface), NetBanking, and OTPs work. Practice handling deceptive payment requests.
          </p>
        </div>
        <span class="mod-card-status ${isDone ? 'done' : ''}">${isDone ? '✅ Completed' : 'Task Incomplete'}</span>
      </div>

      <!-- Critical Lesson Cards -->
      <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: var(--radius-md); padding: 18px; margin-bottom: 24px; color: #78350f;">
        <h4 style="font-size: 1.15rem; font-weight: 800; display:flex; align-items:center; gap:8px;">
          <span>🚨</span> THE SUPREME RULE OF UPI TRANSACTIONS:
        </h4>
        <p style="margin-top: 6px; font-size: 1rem; line-height: 1.6;">
          You <strong>NEVER</strong> enter your <strong>UPI PIN</strong> to <em>RECEIVE</em> money! A UPI PIN is required <strong>ONLY</strong> when money is being deducted (sent) from your account. If anyone asks you to enter your PIN to claim a lottery, reward, or refund — it is a 100% scam!
        </p>
      </div>

      <!-- Interactive Phone Simulator -->
      <h3 style="margin-bottom: 12px; font-size: 1.15rem; text-align: center;">📱 Simulated UPI Transaction Challenge</h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); text-align: center; margin-bottom: 20px;">
        A stranger contacts you claiming you have an accidental refund of ₹5,000, and sends this request to your phone. What do you do?
      </p>

      <div class="upi-sim-phone">
        <div class="phone-screen-header">
          <span>9:41 AM</span>
          <span>📶 5G 🔋 98%</span>
        </div>
        <div class="phone-app-bar">
          <span>⚡ FastPay UPI</span>
        </div>
        <div class="phone-app-content">
          <div style="font-size: 0.85rem; color: #64748b;">COLLECT REQUEST RECEIVED</div>
          <div class="upi-request-card">
            <div style="font-size: 0.9rem; font-weight: 700;">From: Power Corp Refund (unverified)</div>
            <div style="font-size: 0.78rem; color: #64748b;">upi-collector9281@fakepay</div>
            <div class="upi-amount">₹5,000.00</div>
            <div style="font-size: 0.85rem; color: #1e3a8a; font-weight: 600;">Message: "Enter UPI PIN to receive ₹5,000 electricity bill refund"</div>
          </div>

          <div class="upi-pin-notice">
            ⚠️ WARNING: Authorizing this will DEBIT ₹5,000 from your Bank Account!
          </div>

          <div class="phone-actions">
            <button class="btn danger" onclick="handleUpiDecision(true)" style="width: 100%;">
              🛑 Decline & Block Fraudster
            </button>
            <button class="btn secondary" onclick="handleUpiDecision(false)" style="width: 100%; border: 1px solid #cbd5e1;">
              Enter UPI PIN to Claim
            </button>
          </div>

          <div id="upi-feedback-box" style="margin-top: 10px;"></div>
        </div>
      </div>

      <!-- Action Footer -->
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-weight: 700; font-size: 1rem;">Module Status:</span>
          <span id="bankingTaskStatusText" style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; margin-left: 8px;">
            ${isDone ? 'Completed! +2 Stars Awarded ⭐⭐' : 'Make the correct decision on the UPI phone simulator above.'}
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn secondary" onclick="loadModule('dashboard')">Back to Dashboard</button>
          <button class="btn ${isDone ? 'secondary' : 'primary'}" onclick="completeBankingModule()">
            ${isDone ? 'Review Completed Task' : 'Complete Module & Claim ⭐ (+2 Stars)'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleUpiDecision(declined) {
  const box = document.getElementById('upi-feedback-box');
  if (declined) {
    box.innerHTML = `
      <div class="verdict-box correct">
        🎉 <strong>HERO MOVE! You Protected Your Money!</strong><br>
        By declining, you stopped ₹5,000 from being stolen. The fraudster sent a "Collect Request" disguised as a refund.
      </div>
    `;
    state.modules.banking.taskPassed = true;
    showToast('🛡️ Awesome! You protected your bank account.');
  } else {
    box.innerHTML = `
      <div class="verdict-box wrong">
        🚨 <strong>MONEY LOST (SIMULATION)!</strong><br>
        Entering your UPI PIN causes your bank to SEND ₹5,000 to the attacker. Remember: You NEVER enter UPI PIN to receive money!
      </div>
    `;
    showToast('❌ Caution: Entering PIN sends money!');
  }
}

function completeBankingModule() {
  if (!state.modules.banking.completed) {
    state.modules.banking.completed = true;
    earnStar(2);
    saveState();
    updateProgressUI();
    showToast('🎉 Module 3 Completed! +2 Stars earned!');
    loadModule('banking');
  } else {
    showToast('✅ Module already completed! You can review or proceed to Module 4.');
  }
}

/* ==========================================================
   5. SCAM & FRAUD AWARENESS MODULE
   ========================================================== */
const SCAM_QUESTIONS = [
  {
    id: 'scam1',
    title: 'Case #1: The WhatsApp Lottery Alert',
    message: '🎉 Congratulations! Your mobile number won 1st prize in KBC WhatsApp Lucky Draw worth ₹25,00,000! Contact SBI Bank Manager Mr. Rana at 98765-XXXXX. Pay ₹2,500 registration tax to release funds immediately.',
    isScam: true,
    explanation: 'Scam! Legitimate lotteries never notify you via WhatsApp for contests you never entered, and never ask you to pay an advance "processing tax" to claim a prize.'
  },
  {
    id: 'scam2',
    title: 'Case #2: The Impending Electricity Cutoff',
    message: 'Dear Customer, your electricity power supply will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Immediately call electricity officer at 91234-XXXXX to avoid power cut.',
    isScam: true,
    explanation: 'Scam! Utility companies send formal postal notices or SMS with your registered Consumer Number, not random mobile numbers demanding immediate calls under threat of 9:30 PM cutoff.'
  },
  {
    id: 'scam3',
    title: 'Case #3: Part-Time "YouTube Video Liker" Job',
    message: 'Work from home! Earn ₹3,000 to ₹8,000 daily by simply subscribing to YouTube channels and giving 5-star Google Maps reviews. No experience needed. Join Telegram group to receive advance bonus.',
    isScam: true,
    explanation: 'Scam! This is the infamous "Task Scam". They pay ₹150 for the first task, then lure victims to deposit thousands of rupees into "crypto investment pools" which cannot be withdrawn.'
  },
  {
    id: 'scam4',
    title: 'Case #4: Official College Examination Notice',
    message: 'College Examination Cell: The semester practical timetable is published on the college portal https://mycollege.edu.in. Students can download hall tickets using standard portal login.',
    isScam: false,
    explanation: 'Legitimate Notice! Notice the official .edu.in domain, normal login process without threats, and no request to download external .apk files or transfer fees.'
  }
];

function renderScamModule(container) {
  const isDone = state.modules.scam.completed;

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">🕵️ Module 4: Scam Buster & Fraud Detection</h2>
          <p class="card-desc">
            Test your cyber street-smarts against real-world SMS, WhatsApp, and call scenarios. Identify scams to earn your Fraud Hunter badge!
          </p>
        </div>
        <span class="mod-card-status ${isDone ? 'done' : ''}">${isDone ? '✅ Completed' : 'Task Incomplete'}</span>
      </div>

      <div class="scam-challenge-container">
        ${SCAM_QUESTIONS.map((q, idx) => `
          <div class="scam-item-card" id="card-${q.id}">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${idx + 1}. ${q.title}</h4>
            <div class="scam-mock-message">
              ${q.message}
            </div>
            <div class="scam-btn-row">
              <button class="btn danger" onclick="checkScamAnswer('${q.id}', true)">🚨 This is a SCAM</button>
              <button class="btn success" onclick="checkScamAnswer('${q.id}', false)">✅ This is LEGITIMATE</button>
            </div>
            <div class="verdict-box" id="verdict-${q.id}"></div>
          </div>
        `).join('')}
      </div>

      <!-- Action Footer -->
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-weight: 700; font-size: 1rem;">Module Status:</span>
          <span id="scamTaskStatusText" style="color: ${isDone ? 'var(--success)' : 'var(--text-muted)'}; margin-left: 8px;">
            ${isDone ? 'Completed! +2 Stars Awarded ⭐⭐' : 'Answer all 4 scenarios above.'}
          </span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn secondary" onclick="loadModule('dashboard')">Back to Dashboard</button>
          <button class="btn ${isDone ? 'secondary' : 'primary'}" onclick="completeScamModule()">
            ${isDone ? 'Review Completed Task' : 'Submit Answers & Claim ⭐ (+2 Stars)'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function checkScamAnswer(id, chosenIsScam) {
  const item = SCAM_QUESTIONS.find(q => q.id === id);
  if (!item) return;

  const verdictBox = document.getElementById(`verdict-${id}`);
  if (!verdictBox) return;

  const isCorrect = chosenIsScam === item.isScam;

  if (isCorrect) {
    verdictBox.className = 'verdict-box correct';
    verdictBox.innerHTML = `
      🎉 <strong>Correct!</strong> ${item.explanation}
    `;
    playMelodicChime();
    showToast('🎯 Accurate assessment!');
  } else {
    verdictBox.className = 'verdict-box wrong';
    verdictBox.innerHTML = `
      ❌ <strong>Incorrect.</strong> ${item.explanation}
    `;
    showToast('⚠️ Review the explanation.');
  }

  // Record answer in state
  if (!state.modules.scam.answers) state.modules.scam.answers = {};
  state.modules.scam.answers[id] = isCorrect;
}

function completeScamModule() {
  if (!state.modules.scam.completed) {
    state.modules.scam.completed = true;
    earnStar(2);
    saveState();
    updateProgressUI();
    showToast('🎉 Module 4 Completed! +2 Stars earned!');
    loadModule('scam');
  } else {
    showToast('✅ Module already completed! Check your Certificate.');
  }
}

/* ==========================================================
   6. CERTIFICATE OF COMPLETION
   ========================================================== */
function renderCertificateModule(container) {
  const pct = calculateOverallPercentage();
  const isUnlocked = pct === 100;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">🎓 Digital Literacy Certificate of Mastery</h2>
          <p class="card-desc">
            ${isUnlocked 
              ? 'Congratulations! You have successfully mastered all 4 digital safety pathways.' 
              : `You are currently at ${pct}% completion. Complete all 4 modules to unlock your verified graduation certificate.`}
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn primary" onclick="window.print()" ${isUnlocked ? '' : 'disabled'}>
            🖨️ Print / Download PDF
          </button>
        </div>
      </div>

      ${!isUnlocked ? `
        <div style="background: #fffbeb; border: 1px dashed #f59e0b; padding: 18px; border-radius: var(--radius-md); text-align: center; margin-bottom: 24px;">
          <p style="font-size: 1rem; color: #92400e; font-weight: 600;">
            🔒 Certificate Preview Mode (Requires 100% completion across all 4 modules)
          </p>
          <button class="btn secondary" style="margin-top: 10px;" onclick="loadModule('dashboard')">
            Continue Learning to Unlock
          </button>
        </div>
      ` : ''}

      <!-- Certificate Render Sheet -->
      <div class="certificate-preview-wrap">
        <div class="certificate">
          <div class="cert-header">
            <div class="cert-emblem">🌉</div>
            <h1 class="cert-title">Certificate of Digital Competency</h1>
            <p class="cert-subtitle">Project 2026 • Digital Literacy Bridge Initiative</p>
          </div>

          <div class="cert-body">
            <p class="cert-text">This is proudly awarded to recognize that</p>
            <h2 class="cert-recipient" id="certLearnerName">${state.userId}</h2>
            <p class="cert-text">
              has demonstrated superior knowledge and practical readiness in <strong>Email Security, Social Media Privacy, Digital Banking / UPI Fraud Prevention, and Scam Interception</strong>.
            </p>
            <div style="margin-top: 14px; font-weight: 700; color: #1e3a8a;">
              Total Stars Earned: ${state.stars} ⭐ • Completion Grade: 100% Honors
            </div>
          </div>

          <div class="cert-footer">
            <div style="text-align: left;">
              <div style="font-size: 0.85rem; color: #64748b;">Date of Completion</div>
              <div style="font-weight: 700;">${today}</div>
              <div style="font-size: 0.72rem; color: #94a3b8; font-family: monospace; margin-top: 4px;">
                VERIFY-ID: DLB-${Math.abs(hashString(state.userId + today)).toString(16).toUpperCase()}
              </div>
            </div>

            <div class="cert-seal">
              ★
            </div>

            <div style="text-align: right;">
              <div class="cert-sign-line">Director of Digital Literacy</div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Academic Evaluation Board</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (isUnlocked) {
    launchConfetti();
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/* ==========================================================
   CONFETTI CELEBRATION (Lightweight Canvas Engine)
   ========================================================= */
let confettiParticles = [];
let confettiCtx = null;
let confettiAnimId = null;

function setupConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  confettiCtx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas || !confettiCtx) return;

  confettiParticles = [];
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      gravity: 0.35,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  animateConfetti();
}

function animateConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!confettiCtx || !canvas) return;

  confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

  let aliveCount = 0;
  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rot += p.rotSpeed;
    p.opacity -= 0.012;

    if (p.opacity > 0 && p.y < canvas.height) {
      aliveCount++;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      confettiCtx.restore();
    }
  });

  if (aliveCount > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ==========================================================
   GITHUB REPOSITORY CONNECTION HANDLERS
   ========================================================== */
function updateGithubUI() {
  const btn = document.getElementById('githubLinkBtn');
  const btnText = document.getElementById('githubBtnText');
  const hint = document.getElementById('hintRepoUrl');
  const input = document.getElementById('inputGithubRepo');

  if (state.githubRepo) {
    if (btn) btn.href = state.githubRepo;
    if (btnText) btnText.textContent = 'Repo Link';
    if (hint) hint.textContent = state.githubRepo;
    if (input) input.value = state.githubRepo;
  } else {
    if (btn) btn.href = '#';
    if (btnText) btnText.textContent = 'Connect GitHub';
    if (hint) hint.textContent = 'https://github.com/<your-username>/digital-literacy-bridge.git';
  }
}

function handleGithubClick(e) {
  if (!state.githubRepo) {
    e.preventDefault();
    openGithubModal(e);
  }
}

function openGithubModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('githubModal');
  const input = document.getElementById('inputGithubRepo');
  if (modal) {
    if (input && state.githubRepo) input.value = state.githubRepo;
    modal.classList.remove('hidden');
  }
}

function closeGithubModal() {
  const modal = document.getElementById('githubModal');
  if (modal) modal.classList.add('hidden');
}

function saveGithubRepoUrl() {
  const input = document.getElementById('inputGithubRepo');
  if (input) {
    const val = input.value.trim();
    state.githubRepo = val;
    saveState();
    updateGithubUI();
    closeGithubModal();
    if (val) {
      showToast('🐙 GitHub Repository connected!');
    } else {
      showToast('ℹ️ GitHub link cleared.');
    }
  }
}

function openNewRepoPage() {
  window.open('https://github.com/new', '_blank');
}

function testVisitRepo() {
  const input = document.getElementById('inputGithubRepo');
  const url = input && input.value.trim() ? input.value.trim() : state.githubRepo;
  if (url) {
    window.open(url, '_blank');
  } else {
    showToast('⚠️ Please enter a GitHub repository URL first.');
  }
}


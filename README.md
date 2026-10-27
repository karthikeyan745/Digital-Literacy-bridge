# 🌉 Digital Literacy Bridge

> **College Project 2026** — An interactive, accessible web platform empowering safe and confident digital citizens.

---

## 📖 Overview
**Digital Literacy Bridge** is designed to bridge the digital divide by providing hands-on, simulated learning experiences in digital safety, cybersecurity, and essential online tools. It features real-time progress tracking, learner profiles, interactive simulations, and an authenticated Certificate of Completion.

---

## ✨ Key Features

- **👤 Learner Profile & Tracking**:
  - Customizable Learner User ID (e.g. `DLB-2026-8941`).
  - Active Module status badge.
  - Dynamic Overall Completion Percentage (0% – 100%).
  - ⭐ Star Reward system with melodic audio chimes & confetti animations.

- **📚 Interactive Learning Pathways**:
  1. **📧 Email Essentials & Phishing Shield**:
     - Anatomy of an email (headers, domain validation, spoof detection).
     - Interactive phishing email inspector with real-time feedback.
  2. **🌐 Social Media & Privacy Defense**:
     - Privacy controls simulator (tagging permissions, location visibility, public profile locks).
     - Interactive real-time password strength evaluator.
  3. **🏦 Digital Banking & UPI Safety**:
     - Simulated mobile smartphone interface.
     - UPI Collect Request defense: *UPI PIN is strictly for sending money, never receiving!*
     - Fraud alert simulation and OTP protection guidelines.
  4. **🕵️ Scam Buster & Fraud Awareness**:
     - Real-world scenario challenges (fake lottery alerts, urgent electricity bills, task scams).
     - Instant decision verdict cards and educational explanations.

- **🎓 Verified Certificate of Completion**:
  - Unlocked upon completing all modules.
  - Generates an authentic, printable certificate with the learner's User ID, completion date, and verification hash.
  - Built-in print / save as PDF styling.

- **♿ Accessibility & Inclusive Design**:
  - Built-in **Text-to-Speech (Read Aloud)** for novice or elderly learners using Web Speech API.
  - Multi-level font sizing adjuster (`Aa`).
  - Dark Mode & Light Mode support.
  - 100% client-side — requires no external backend or database setup.

---

## 🚀 Quick Start / How to Run

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/karthikeyan745/Digital-Literacy-bridge.git
   cd Digital-Literacy-bridge
   ```

2. **Run Locally**:
   - Simply double-click `index.html` to open it in any modern web browser (Chrome, Edge, Firefox, Brave), **OR**
   - Start a local HTTP server:
     ```bash
     # Using Python
     python -m http.server 3000
     ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, Flexbox, CSS Grid), Vanilla JavaScript (ES6+).
- **APIs**: Web Speech Synthesis API, Web Audio API, Canvas Confetti.
- **Storage**: `localStorage` (offline persistence for user progress and stars).

---

## 📜 License
This project is developed for educational purposes as part of the **College Project 2026**.

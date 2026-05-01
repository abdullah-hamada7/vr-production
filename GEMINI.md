# Project Context: Rehabilitation AI (REHAB)

This document provides high-fidelity context for AI agents and future developers to understand the design philosophy and technical architecture of the Rehabilitation platform.

## 1. Mission Statement
To bridge the gap between in-clinic physiotherapy and home-based recovery by providing "Clinical-Grade" feedback. This is NOT a fitness/gym app; it is a diagnostic tool designed for patients recovering from surgery or injury.

## 2. Design Philosophy
- **Precision Over Motivation**: We prioritize accurate ROM (Range of Motion) data over counting "bad" reps. If a rep is unstable or has poor posture, it is discarded.
- **Medical Aesthetic**: The UI uses a high-contrast, professional design (Glassmorphism + Dark Mode) to convey trust and precision. The skeletal overlay (Red dots, Green lines) is intentionally clinical.
- **The "Truth" Score**: Unlike fitness apps that smooth everything, we capture the **Raw Peak Angle** for the clinical report to ensure the therapist sees the patient's actual end-range capacity.

## 3. Core Architecture
- **MediaPipe Loop**: `App.jsx` handles the main `requestAnimationFrame` loop. It pipes video frames into MediaPipe Pose.
- **State Machine**: Reps are tracked via a `stage` ref (`UP` -> `DOWN` -> `UP`).
- **Exercise Modules**: Located in `src/exercises/`, these contain the "Clinical Rules" (e.g., Squats require back > 145° and Stability > 75%).
- **Diagnostic Engine**:
    - **ROM**: Computed relative to a dynamic baseline.
    - **Symmetry**: Bilateral joint comparison.
    - **TUT**: Time Under Tension (Eccentric vs. Concentric).
    - **Weight Shift**: Frontal plane trunk-lean detection.

## 4. Key Design Decisions (The "Why")
- **Dynamic Baseline**: We don't assume a user can stand at a perfect 180°. We capture their resting posture and measure ROM relative to *their* baseline.
- **TTS Feedback**: Audio cues (e.g., "Watch your alignment") are triggered via the Web Speech API to allow the patient to correct form without looking at the screen.
- **Print-First Reporting**: The `TherapistReport` is optimized for A4 printing because many clinicians still rely on physical paper for medical charts.

## 5. Current Implementation Status (v1.2)
- [x] Real-time Bilateral Symmetry tracking.
- [x] Kinetic Chain Stability (Drift) detection.
- [x] Time Under Tension (TUT) timing.
- [x] Lateral Weight-Shift (Trunk Lean) analysis.
- [x] One-page printable Therapist assessment.
- [ ] YouTube Clinical Demo integration (Pending).

## 6. Future Roadmap
- **Arabic Localization**: Complete UI translation for Middle Eastern markets.
- **PDF Generation**: Replace browser print with a server-side or client-side PDF library (e.g., jsPDF).
- **Longitudinal Data**: Graph progress across multiple sessions.

---
*Context updated: 2026-04-23*

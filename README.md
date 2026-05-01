# Rehabilitation AI: Clinical-Grade Exercise Tracker

A professional-grade AI rehabilitation platform that transforms home exercise into a clinical diagnostic experience. Using computer vision and real-time biomechanical analysis, the platform provides objective metrics previously only available in specialized motion labs.

## Clinical Diagnostic Features

The platform goes beyond simple rep counting to provide high-fidelity anatomical diagnostics:

*   Range of Motion (ROM) Analysis: Calculates joint flexion (Knee/Elbow) relative to a dynamic baseline captured from the patient's resting posture.
*   Bilateral Symmetry Tracking: Detects joint angle deviation between left and right limbs to identify compensatory "limp" patterns.
*   Kinetic Chain Stability: Monitors horizontal drift of the Ankle-Knee-Hip alignment to identify joint instability or valgus/varus issues.
*   Time Under Tension (TUT): Measures exactly how many seconds are spent in the Eccentric (descent) vs. Concentric (ascent) phases for motor control evaluation.
*   Weight Shift Analysis: Detects lateral trunk lean and center-of-mass deviation to identify unilateral weakness.

## Exercise Library

All exercises include placeholder slots for clinical demonstrations and strict form validation:

1.  Squats: Focuses on knee flexion, back posture alignment, and bilateral symmetry.
2.  Bicep Curls: Tracks elbow flexion with strict elbow-tuck (stability) enforcement.
3.  Lunges: Analyzes kinetic chain stability and eccentric control.
4.  Heel Slides: Specialized for post-surgical knee rehabilitation.

## Therapist Assessment Report

Upon session completion, the platform generates a professional medical report including:
*   Average ROM vs. Clinical Targets.
*   Stability and Symmetry scores.
*   Automated diagnostic observations (e.g., "Eccentric control is poor").
*   Single-page PDF export for physician/therapist review.

## Technology Stack

*   Frontend: React + Vite
*   Logic: Vanilla JavaScript
*   Styling: Professional Glassmorphic UI (Vanilla CSS)
*   AI Engine: MediaPipe Pose (Real-time 33-point skeletal tracking)
*   Speech: Web Speech API (Real-time clinical TTS guidance)

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   Modern browser with webcam access

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1.  Select an exercise from the clinical library.
2.  Set your target repetitions.
3.  Ensure your full body is visible in the frame (sideways view is recommended for ROM accuracy).
4.  Follow the real-time audio and visual feedback.
5.  Click "Finish Session" to generate and print your Therapist Assessment Report.


export const ROM_CONFIG = {
  squats: {
    primaryKey: 'knee', label: 'Knee Flexion',
    targetAngle: 100, startAngle: 165, normalRange: '≤ 100°',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
    clinicalAdvice: 'Keep knees behind toes. Descend until thighs are parallel to floor. Maintain neutral spine throughout.'
  },
  heelSlides: {
    primaryKey: 'knee', label: 'Knee Flexion',
    targetAngle: 90, startAngle: 165, normalRange: '≤ 90°',
    videoUrl: 'https://www.youtube.com/embed/t17Z6HeiiQs',
    clinicalAdvice: 'Lie flat. Slowly slide heel toward buttocks. Hold at end-range for 2s. Return slowly. Avoid hip hiking.'
  },
  bicepCurls: {
    primaryKey: 'elbow', label: 'Elbow Flexion',
    targetAngle: 40, startAngle: 165, normalRange: '≤ 40°',
    videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
    clinicalAdvice: 'Keep elbow pinned to side. Full extension at bottom, full flexion at top. Control the eccentric phase.'
  },
  lunges: {
    primaryKey: 'knee', label: 'Knee Flexion',
    targetAngle: 90, startAngle: 165, normalRange: '≤ 90°',
    videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
    clinicalAdvice: 'Step forward, lower back knee toward floor. Keep front shin vertical. Maintain upright torso.'
  },
  straightLegRaise: {
    primaryKey: 'hip', label: 'Hip Flexion',
    targetAngle: 120, startAngle: 170, normalRange: '≤ 120°',
    videoUrl: 'https://www.youtube.com/embed/U4L_6JEv9Jg',
    clinicalAdvice: 'Keep knee fully extended. Tighten quad before lifting. Raise to ~45°. Hold 2s. Lower slowly. Avoid trunk rotation.'
  },
  anklePump: {
    primaryKey: 'ankle', label: 'Ankle Range',
    targetAngle: 70, startAngle: 130, normalRange: '70° - 130°',
    videoUrl: 'https://www.youtube.com/embed/hh_fsJOpFjQ',
    clinicalAdvice: 'Pump ankle up (dorsiflexion) and down (plantarflexion) through full range. Slow, controlled rhythm. Promotes DVT prophylaxis.'
  },
  quadSets: {
    primaryKey: 'holdTime', label: 'Hold Duration',
    targetAngle: 3, startAngle: 0, normalRange: '≥ 2s',
    videoUrl: 'https://www.youtube.com/embed/khUhNAq2Fzo',
    clinicalAdvice: 'Lie flat. Press back of knee firmly into bed. Hold 5–10s per contraction. Activate quad fully before hold.'
  },
};

const DIAGNOSES = {
  squats: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Squat depth within clinical targets.' },
    { minScore: 65, status: 'mild',     label: 'Mild Restriction', advice: 'Depth mildly limited.' },
    { minScore: 40, status: 'moderate', label: 'Moderate Restriction', advice: 'Significant flexion deficit.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Possible post-surgical stiffness.' },
  ],
  heelSlides: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Target knee flexion achieved.' },
    { minScore: 65, status: 'mild',     label: 'Mild Restriction', advice: 'Slight restriction common.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Immediate therapist review recommended.' },
  ],
  bicepCurls: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Full elbow flexion achieved.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Suspend and arrange assessment.' },
  ],
  lunges: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Excellent lunge depth.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Do not advance depth.' },
  ],
  straightLegRaise: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Excellent hip flexion.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Extensor lag present.' },
  ],
  anklePump: [
    { minScore: 88, status: 'optimal',  label: 'Full ROM', advice: 'Good ankle mobility.' },
    { minScore: 0,  status: 'severe',   label: 'Severe Restriction', advice: 'Clinical assessment advised.' },
  ],
  quadSets: [
    { minScore: 88, status: 'optimal',  label: 'Target Hold Time', advice: 'Strong isometric contraction.' },
    { minScore: 0,  status: 'severe',   label: 'No Contraction', advice: 'No visible activation.' },
  ],
};

export const computeROMScore = (exerciseId, peakAngle) => {
  const cfg = ROM_CONFIG[exerciseId];
  if (!cfg || peakAngle == null) return null;
  const range = Math.abs(cfg.startAngle - cfg.targetAngle);
  const achieved = Math.abs(cfg.startAngle - peakAngle);
  return Math.max(0, Math.min(100, Math.round((achieved / range) * 100)));
};

export const getDiagnosis = (exerciseId, romScore) => {
  const list = DIAGNOSES[exerciseId];
  if (!list || romScore == null) return null;
  return list.find(d => romScore >= d.minScore) ?? list[list.length - 1];
};

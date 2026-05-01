import { calculateAngle } from '../utils/angles';

export default {
  id: 'heelSlides',
  name: 'Heel Slides',
  initialStage: 'EXTEND',
  joints: {
    hip: 23,
    knee: 25,
    ankle: 27
  },
  analyze(landmarks, stage) {
    const hip = landmarks[23];
    const knee = landmarks[25];
    const ankle = landmarks[27];

    if (hip.visibility < 0.65 || knee.visibility < 0.65 || ankle.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Keep leg in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side', 
        angles: null 
      };
    }

    const kneeAngle = calculateAngle(hip, knee, ankle);

    let nextStage = stage;
    let feedback = { textEn: 'Maintain smooth movement', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true;

    if (kneeAngle > 165) {
      if (stage === 'FLEX') {
        isGoodRep = true;
        feedback = { textEn: 'Full extension achieved', type: 'good' };
      }
      nextStage = 'EXTEND';
    }

    if (kneeAngle < 110) {
      if (stage === 'EXTEND') {
        feedback = { textEn: 'Optimal flexion reached', type: 'good' };
        nextStage = 'FLEX';
      }
    }

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: 'side', 
      angles: { knee: kneeAngle } 
    };
  }
};

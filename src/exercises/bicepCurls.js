import { calculateAngle } from '../utils/angles';

export default {
  id: 'bicepCurls',
  name: 'Bicep Curls',
  joints: {
    shoulder: 11,
    elbow: 13,
    wrist: 15
  },
  analyze(landmarks, stage) {
    const shoulder = landmarks[11];
    const elbow = landmarks[13];
    const wrist = landmarks[15];

    if (shoulder.visibility < 0.65 || elbow.visibility < 0.65 || wrist.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Keep arm in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side',
        angles: null 
      };
    }

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);

    const elbowDrift = Math.abs(elbow.x - shoulder.x);
    const isElbowTucked = elbowDrift < 0.15; 
    
    let nextStage = stage;
    let feedback = { textEn: 'Curl your arm...', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true;

    if (!isElbowTucked) {
      feedback = { textEn: 'Keep elbows tucked to your side', type: 'error' };
      isCorrectForm = false;
    }

    if (elbowAngle > 160) {
      if (stage === 'UP') {
        if (isCorrectForm) {
          isGoodRep = true;
          feedback = { textEn: 'Excellent control. Rep counted.', type: 'good' };
        } else {
          feedback = { textEn: 'Rep discarded: keep elbows tucked', type: 'error' };
        }
      }
      nextStage = 'DOWN';
    }

    if (elbowAngle < 50) { 
      if (stage === 'DOWN') {
        if (isCorrectForm) {
          feedback = { textEn: 'Full contraction achieved!', type: 'good' };
          nextStage = 'UP';
        } else {
          feedback = { textEn: 'Good depth, but keep elbow still', type: 'error' };
        }
      }
    }

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: 'side', 
      angles: { elbow: elbowAngle } 
    };
  }
};

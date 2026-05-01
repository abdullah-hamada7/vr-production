import { calculateAngle } from '../utils/angles';

export default {
  id: 'straightLegRaise',
  name: 'Straight Leg Raise',
  initialStage: 'REST',
  joints: {
    hip: 23,
    knee: 25,
    ankle: 27,
    contraHip: 24
  },
  analyze(landmarks, stage) {
    const hip = landmarks[23];
    const knee = landmarks[25];
    const ankle = landmarks[27];
    const contraHip = landmarks[24]; // Used for compensatory detection

    if (hip.visibility < 0.65 || knee.visibility < 0.65 || ankle.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Keep leg in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side' 
      };
    }

    const legStraightness = calculateAngle(hip, knee, ankle);

    const hipDistance = Math.abs(hip.x - contraHip.x);
    const isCompensating = hipDistance > 0.12; // 0.12 reduces false positives from breathing; 0.08 was too sensitive

    let nextStage = stage;
    let feedback = { textEn: 'Keep leg straight and lift', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = false;

    if (legStraightness < 155) { // MediaPipe reads ~158° on a visually straight limb in motion; 165° was impossible mid-lift
      feedback = { textEn: 'Keep leg straight', type: 'error' };
    } else if (isCompensating) {
      feedback = { textEn: 'Control hip rotation', type: 'error' };
    } else {
      isCorrectForm = true;
    }

    const heightLifted = hip.y - knee.y; 

    if (heightLifted > 0.1) { 
      if (stage === 'REST') {
        if (isCorrectForm) {
          feedback = { textEn: 'Target height reached!', type: 'good' };
        }
      }
      nextStage = 'RAISE';
    }

    if (heightLifted < 0.08) { 
      if (stage === 'RAISE') {
        if (isCorrectForm) {
          isGoodRep = true;
          feedback = { textEn: 'Good control. Rep counted.', type: 'good' };
        } else {
          feedback = { textEn: 'Rep discarded: keep leg straight', type: 'error' };
        }
      }
      nextStage = 'REST';
    }

    const pseudoAngle = 170 - (heightLifted * 100);

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: 'side', 
      angles: { hip: pseudoAngle, legStraightness } 
    };
  }
};

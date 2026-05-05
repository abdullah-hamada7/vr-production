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
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Detect which leg is being lifted (the lifted knee will have a lower Y value)
    const liftL = leftHip.y - leftKnee.y;
    const liftR = rightHip.y - rightKnee.y;
    
    const useLeft = liftL > liftR || (leftKnee.visibility > rightKnee.visibility && liftL > -0.05);

    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;
    const ankle = useLeft ? leftAnkle : rightAnkle;
    const contraHip = useLeft ? rightHip : leftHip;
    const heightLifted = useLeft ? liftL : liftR;

    if (hip.visibility < 0.65 || knee.visibility < 0.65 || ankle.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Ensure leg is visible to camera', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side',
        angles: null
      };
    }

    const legStraightness = calculateAngle(hip, knee, ankle);

    const hipDistance = Math.abs(hip.x - contraHip.x);
    const isCompensating = hipDistance > 0.12; 

    let nextStage = stage;
    let feedback = { textEn: 'Keep leg straight and lift', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = false;

    if (legStraightness < 155) { 
      feedback = { textEn: 'Keep leg straight', type: 'error' };
    } else if (isCompensating) {
      feedback = { textEn: 'Control hip rotation', type: 'error' };
    } else {
      isCorrectForm = true;
    }

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
      angles: { 
        hip: pseudoAngle, 
        legStraightness,
        side: useLeft ? 'left' : 'right'
      } 
    };
  }
};

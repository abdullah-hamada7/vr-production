import { calculateAngle } from '../utils/angles';

export default {
  id: 'squats',
  name: 'Squats',
  joints: {
    shoulder: 11,
    hip: 23,
    knee: 25,
    ankle: 27,
    rightShoulder: 12,
    rightHip: 24,
    rightKnee: 26,
    rightAnkle: 28
  },
  analyze(landmarks, stage) {
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const leftShoulder = landmarks[11];
    
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];
    const rightShoulder = landmarks[12];

    const isSideView = Math.abs(leftShoulder.x - rightShoulder.x) < 0.1;

    if (leftHip.visibility < 0.65 || rightHip.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Please ensure full body is in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'front', 
        angles: null 
      };
    }

    const kneeL = calculateAngle(leftHip, leftKnee, leftAnkle);
    const kneeR = calculateAngle(rightHip, rightKnee, rightAnkle);
    const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    const getAlignmentError = (hip, knee, ankle) => {
      const mid = (hip.x + ankle.x) / 2;
      return Math.abs(knee.x - mid);
    };
    
    const baseMidX = (leftAnkle.x + rightAnkle.x) / 2;
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const weightShift = Math.abs(shoulderMidX - baseMidX);

    const driftL = getAlignmentError(leftHip, leftKnee, leftAnkle);
    const driftR = getAlignmentError(rightHip, rightKnee, rightAnkle);
    const maxDrift = Math.max(driftL, driftR);
    const stabilityScore = Math.max(0, 100 - (maxDrift * 500));

    let nextStage = stage;
    let feedback = { textEn: 'Maintaining stable posture', type: 'good' };
    let isGoodRep = false;
    let isCorrectForm = true;

    const isBackStraight = backAngle > 145;
    const isStable = stabilityScore > 75;
    const isBalanced = weightShift < 0.08;

    if (!isBackStraight) {
      feedback = { textEn: 'Keep your back upright', type: 'error' };
      isCorrectForm = false;
    } else if (!isStable) {
      feedback = { textEn: 'Watch knee alignment', type: 'error' };
      isCorrectForm = false;
    } else if (!isBalanced) {
      feedback = { textEn: 'Center your body weight', type: 'error' };
      isCorrectForm = false;
    }

    const primaryKnee = isSideView ? kneeL : Math.min(kneeL, kneeR);

    if (primaryKnee > 160) {
      if (stage === 'DOWN') {
        if (isCorrectForm) {
          isGoodRep = true;
          feedback = { textEn: 'Depth achieved. Rep counted.', type: 'good' };
        } else {
          feedback = { textEn: 'Rep discarded: poor form', type: 'error' };
        }
      }
      nextStage = 'UP';
    }

    if (primaryKnee < 100) {
      if (stage === 'UP') {
        feedback = { textEn: 'Target depth reached!', type: 'good' };
        nextStage = 'DOWN';
      }
    }

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: isSideView ? 'side' : 'front', 
      angles: { 
        knee: kneeL, 
        kneeL, 
        kneeR, 
        back: backAngle,
        stability: stabilityScore,
        asymmetry: Math.abs(kneeL - kneeR),
        weightShift: weightShift * 100
      } 
    };
  }
};

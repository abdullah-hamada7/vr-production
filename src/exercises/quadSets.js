import { calculateAngle } from '../utils/angles';

export default {
  id: 'quadSets',
  name: 'Quad Sets',
  initialStage: 'RELAX',
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
        viewType: 'side' 
      };
    }

    const kneeAngle = calculateAngle(hip, knee, ankle);
    
    let nextStage = stage;
    let feedback = { textEn: 'Press knee down', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = false;

    if (kneeAngle < 170) {
      feedback = { textEn: 'Straighten your leg', type: 'error' };
    } else {
      isCorrectForm = true;
    }

    const isContracting = kneeAngle > 175;

    if (isContracting) {
      if (stage === 'RELAX') {
        feedback = { textEn: 'Hold the squeeze...', type: 'good' };
      }
      nextStage = 'CONTRACT';
    } else {
      if (stage === 'CONTRACT') {
        isGoodRep = true; 
        feedback = { textEn: 'Relax. Rep counted.', type: 'good' };
      }
      nextStage = 'RELAX';
    }

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: 'side', 
      angles: { holdTime: isContracting ? 3 : 0, knee: kneeAngle }
    };
  }
};

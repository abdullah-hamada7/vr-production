import { calculateAngle } from '../utils/angles';

export default {
  id: 'lunges',
  name: 'Lunges',
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
    let feedback = { textEn: 'Step forward...', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true; 

    if (kneeAngle > 160) {
      if (stage === 'DOWN') {
        isGoodRep = true;
        feedback = { textEn: 'Good rep!', type: 'good' };
      }
      nextStage = 'UP';
    }

    if (kneeAngle < 120) { // 120° = functional lunge depth for rehab; 100° required full athletic depth
      if (stage === 'UP') {
        feedback = { textEn: 'Great depth!', type: 'good' };
        nextStage = 'DOWN';
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

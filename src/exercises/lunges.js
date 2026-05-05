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
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Calculate angles for both sides
    const kneeL = calculateAngle(leftHip, leftKnee, leftAnkle);
    const kneeR = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // The active leg in a lunge will be the one that bends the most
    const useLeft = (leftKnee.visibility > 0.65 && kneeL < 155) || (leftKnee.visibility > rightKnee.visibility);

    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;
    const ankle = useLeft ? leftAnkle : rightAnkle;
    const kneeAngle = useLeft ? kneeL : kneeR;

    if (hip.visibility < 0.65 || knee.visibility < 0.65 || ankle.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Keep both legs in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side',
        angles: null
      };
    }

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

    if (kneeAngle < 120) { 
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
      angles: { 
        knee: kneeAngle,
        side: useLeft ? 'left' : 'right'
      } 
    };
  }
};

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
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Detect which leg is moving or more visible
    const kneeL = calculateAngle(leftHip, leftKnee, leftAnkle);
    const kneeR = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // In Heel Slides, the active leg will have a smaller angle (flexion)
    const useLeft = (leftKnee.visibility > 0.65 && kneeL < 155) || (leftKnee.visibility > rightKnee.visibility);

    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;
    const ankle = useLeft ? leftAnkle : rightAnkle;
    const kneeAngle = useLeft ? kneeL : kneeR;

    if (hip.visibility < 0.65 || knee.visibility < 0.65 || ankle.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Ensure your leg is visible to the camera', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side', 
        angles: null 
      };
    }

    let nextStage = stage;
    let feedback = { textEn: 'Maintain smooth movement', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true;

    if (kneeAngle > 155) { 
      if (stage === 'FLEX') {
        isGoodRep = true;
        feedback = { textEn: 'Full extension achieved', type: 'good' };
      }
      nextStage = 'EXTEND';
    }

    if (kneeAngle < 120) { 
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
      angles: { 
        knee: kneeAngle,
        side: useLeft ? 'left' : 'right'
      } 
    };
  }
};

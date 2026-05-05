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
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    // Determine which side is more visible or active
    const useLeft = leftElbow.visibility > rightElbow.visibility;
    
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const elbow = useLeft ? leftElbow : rightElbow;
    const wrist = useLeft ? leftWrist : rightWrist;

    if (shoulder.visibility < 0.65 || elbow.visibility < 0.65 || wrist.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Please stand so your arm is visible', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side',
        angles: null 
      };
    }

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);

    const elbowDrift = Math.abs(elbow.x - shoulder.x);
    const isElbowTucked = elbowDrift < 0.25; 
    
    let nextStage = stage;
    let feedback = { textEn: 'Curl your arm...', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true;

    if (!isElbowTucked) {
      feedback = { textEn: 'Keep elbow tucked to your side', type: 'error' };
      isCorrectForm = false;
    }

    if (elbowAngle > 150) {
      if (stage === 'UP') {
        if (isCorrectForm) {
          isGoodRep = true;
          feedback = { textEn: 'Excellent control. Rep counted.', type: 'good' };
        } else {
          feedback = { textEn: 'Rep discarded: keep elbow tucked', type: 'error' };
        }
      }
      nextStage = 'DOWN';
    }

    if (elbowAngle < 70) {
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
      angles: { 
        elbow: elbowAngle,
        side: useLeft ? 'left' : 'right'
      } 
    };
  }
};

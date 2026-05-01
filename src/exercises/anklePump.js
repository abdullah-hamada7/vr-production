import { calculateAngle } from '../utils/angles';

export default {
  id: 'anklePump',
  name: 'Ankle Pump',
  initialStage: 'PLANTAR',
  joints: {
    knee: 25,
    ankle: 27,
    footIndex: 31
  },
  analyze(landmarks, stage) {
    const knee = landmarks[25];
    const ankle = landmarks[27];
    const footIndex = landmarks[31];

    if (knee.visibility < 0.65 || ankle.visibility < 0.65 || footIndex.visibility < 0.65) {
      return { 
        stage, 
        feedback: { textEn: 'Keep foot in view', type: 'neutral' }, 
        isGoodRep: false, 
        isCorrectForm: false,
        viewType: 'side' 
      };
    }

    const ankleAngle = calculateAngle(knee, ankle, footIndex);
    
    let nextStage = stage;
    let feedback = { textEn: 'Pump your ankle', type: 'neutral' };
    let isGoodRep = false;
    let isCorrectForm = true; 

    if (ankleAngle > 115) { // 115° catches moderate plantarflexion; 125° missed patients with limited ROM
      if (stage === 'DORSI') {
        feedback = { textEn: 'Good stretch', type: 'good' };
      }
      nextStage = 'PLANTAR';
    }

    if (ankleAngle < 95) { // 95° = near-neutral; active dorsiflexion typically peaks at 90–95°; 80° required extreme pull-back
      if (stage === 'PLANTAR') {
        isGoodRep = true;
        feedback = { textEn: 'Full pump completed!', type: 'good' };
      }
      nextStage = 'DORSI';
    }

    return { 
      stage: nextStage, 
      feedback, 
      isGoodRep, 
      isCorrectForm,
      viewType: 'side', 
      angles: { ankle: ankleAngle } 
    };
  }
};

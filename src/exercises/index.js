import squats from './squats';
import bicepCurls from './bicepCurls';
import lunges from './lunges';
import heelSlides from './heelSlides';
import straightLegRaise from './straightLegRaise';
import anklePump from './anklePump';
import quadSets from './quadSets';

export const exercises = {
  squats,
  bicepCurls,
  lunges,
  heelSlides,
  straightLegRaise,
  anklePump,
  quadSets
};

export const getExercise = (id) => exercises[id] || exercises.squats;

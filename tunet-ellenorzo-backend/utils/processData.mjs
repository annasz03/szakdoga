export function processData(data, key, value) {
    let matching = 0;
  
    if (!genderCheck(data.gender, value.gender)) {
      return 0;
    } else {
      matching += ageCheck(data.age, value.age);
      matching += symptomsCheck(data.symptoms, value.symptoms);
      if (data.pain === true && Array.isArray(data.painLocation) && Array.isArray(value.painLocation)) {
        matching += painCheck(data.painLocation, value.painLocation);
      }
    }
  
    return matching;
  }
  
  export function orderResult(result) {
    return result.sort((a, b) => b.currRes - a.currRes);
  }
  
  function ageCheck(inputAge, diseaseAge) {
    if(diseaseAge.age == -1 || (inputAge >= diseaseAge[0] && inputAge <= diseaseAge[1])) {
      return 1;
    }
    return 0;
  }
  
  function genderCheck(inputGender, diseaseGender) {
    if(diseaseGender == 'Mindkettő') {
      return true;
    }
    if(inputGender == 'male' && diseaseGender == 'Férfi' || diseaseGender == 'Nő' && inputGender == 'female') {
      return true;
    }
    return false;
  }
  
  function symptomsCheck(inputSymptoms, diseaseSymptoms) {
    let matches = 0;
    inputSymptoms.forEach(symptom => {
      if(diseaseSymptoms.includes(symptom)) {
        matches++;
      }
    });
    return matches;
  }
  
  function painCheck(inputPainLocation, diseasePainLocation) {
    let matches = 0;
    inputPainLocation.forEach(location => {
      if(diseasePainLocation.includes(location)) {
        matches++;
      }
    });
    return matches;
  }
  
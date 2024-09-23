const grades = {};
const gradeOptions = ['', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0'];

function populateGradeOptions() {
  document.querySelectorAll('select').forEach(select => {
    gradeOptions.forEach(grade => {
      const option = document.createElement('option');
      option.value = grade;
      option.textContent = grade;
      select.appendChild(option);
    });
  });
}

function roundToHalf(num) {
  return Math.round(num * 2) / 2;
}

function calculateNaturwissenschaft(chemie, physik) {
  const chemieGrade = parseFloat(chemie);
  const physikGrade = parseFloat(physik);

  if (!isNaN(chemieGrade) && !isNaN(physikGrade)) {
    return roundToHalf((chemieGrade + physikGrade) / 2);
  }
  return null;
}

function calculateNaturwissenschaftenAP() {
  const chemieAP = parseFloat(grades.chemieAP);
  const physikAP = parseFloat(grades.physikAP);
  
  if (!isNaN(chemieAP) && !isNaN(physikAP)) {
    return roundToHalf((chemieAP + 2 * physikAP) / 3);
  }
  return null;
}

function calculateSemesterGrade(semesterGrades, semesterNumber) {
  let sum = 0;
  let count = 0;

  Object.entries(semesterGrades).forEach(([subject, grade]) => {
    if (grade && subject !== 'chemie' && subject !== 'physik') {
      sum += parseFloat(grade);
      count++;
    }
  });

  if (semesterNumber === 2 || semesterNumber === 3) {
    const naturwissenschaftGrade = calculateNaturwissenschaft(semesterGrades.chemie, semesterGrades.physik);
    if (naturwissenschaftGrade !== null) {
      sum += naturwissenschaftGrade;
      count++;
    }
  }

  return count > 0 ? roundToOneTenth(sum / count) : 0;
}

function calculateFinalGrade(erfahrungsnote, apGrade) {
  if (erfahrungsnote !== null && erfahrungsnote !== undefined && apGrade !== null && apGrade !== undefined) {
    return roundToOneTenth((parseFloat(erfahrungsnote) + parseFloat(apGrade)) / 2);
  }
  return null;
}

function calculateGeschichteUndPolitik() {
  const grade1 = parseFloat(grades.geschichtePolitik1) || 0;
  const grade2 = parseFloat(grades.geschichtePolitik2) || 0;
  if (grade1 && grade2) {
    return Math.round((grade1 + grade2) / 2 * 10) / 10;
  }
  return null;
}

function calculateWirtschaftUndRecht() {
  const grade1 = parseFloat(grades.wirtschaftRecht1) || 0;
  const grade2 = parseFloat(grades.wirtschaftRecht2) || 0;
  if (grade1 && grade2) {
    return Math.round((grade1 + grade2) / 2 * 10) / 10;
  }
  return null;
}

function calculateMathematikGF() {
  const grade1 = parseFloat(grades.mathematikGF1) || 0;
  const grade2 = parseFloat(grades.mathematikGF2) || 0;
  if (grade1 && grade2) {
    return Math.round((grade1 + grade2) / 2 * 10) / 10;
  }
  return null;
}

function calculateErfahrungsnote(subject) {
  const subjectGrades = [1, 2, 3]
    .map(sem => grades[`${subject}${sem}`])
    .filter(grade => grade !== undefined && grade !== '')
    .map(grade => parseFloat(grade));
  
  return subjectGrades.length > 0 
    ? roundToHalf(subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length) 
    : null;
}

function determinePassFailStatus(grades, finalGrades) {
  const requiredSubjects = [
    'deutsch', 'franzosisch', 'englisch', 'geschichtePolitik', 'wirtschaftRecht', 'chemie', 'physik', 'mathematikGF', 'mathematiksf'
  ];
  const requiredAP = ['deutschAP', 'franzosischAP', 'englischAP', 'mathematiksfAP', 'chemieAP', 'physikAP'];

  const allFilled = requiredSubjects.every(subject => {
    if (subject === 'mathematikGF') {
      return grades.mathematikGF1 && grades.mathematikGF2 && grades.bmNoteMathematikGF;
    }
    if (subject === 'mathematiksf') {
      return grades.mathematiksf3 && grades.mathematiksfAP;
    }
    if (subject === 'chemie' || subject === 'physik') {
      return grades[`${subject}2`] && grades[`${subject}3`] && grades[`${subject}AP`];
    }
    return grades[`${subject}1`] && grades[`${subject}2`] && (subject !== 'geschichtePolitik' && subject !== 'wirtschaftRecht' ? grades[`${subject}3`] : true);
  }) && requiredAP.every(ap => grades[ap]);

  if (!allFilled) {
    return { status: 'incomplete', message: 'Please fill everything in', color: '#808080' };
  }

  const passingGrade = 4.0;
  const failingGrades = finalGrades.filter(grade => grade < passingGrade);
  const totalUnderFour = failingGrades.reduce((sum, grade) => sum + (passingGrade - grade), 0);
  
  const sumOfGrades = finalGrades.reduce((sum, grade) => sum + grade, 0);
  const geschichtePolitikGrade = parseFloat(grades.geschichtePolitik2) || parseFloat(grades.geschichtePolitik1);
  const wirtschaftRechtGrade = parseFloat(grades.wirtschaftRecht2) || parseFloat(grades.wirtschaftRecht1);
  const mathematikGFGrade = parseFloat(grades.bmNoteMathematikGF);
  
  const totalSum = sumOfGrades + geschichtePolitikGrade + wirtschaftRechtGrade + mathematikGFGrade;
  const overallAverage = totalSum / (finalGrades.length + 3);

  if (failingGrades.length > 2) {
    return { status: 'fail', message: 'Failed: More than 2 grades under 4', color: '#F44336' };
  } else if (totalUnderFour > 2) {
    return { status: 'fail', message: 'Failed: Total amount under 4 is more than 2', color: '#F44336' };
  } else if (overallAverage < passingGrade) {
    return { status: 'fail', message: 'Failed: Overall average under 4', color: '#F44336' };
  } else {
    return { status: 'pass', message: 'Passed!', color: '#4CAF50' };
  }
}

function roundToOneTenth(num) {
  return Math.round(num * 10) / 10;
}

function updateFinalGradesTable() {
  const tableBody = document.querySelector('#finalGradesTable tbody');
  tableBody.innerHTML = '';

  const subjects = ['Deutsch', 'Französisch', 'Englisch', 'Geschichte und Politik', 'Wirtschaft und Recht', 'Naturwissenschaften', 'Mathematik GF', 'Mathematik SF'];
  let totalFinalGrade = 0;
  let totalErfahrungsnote = 0;
  let totalAPGrade = 0;
  let validFinalGradesCount = 0;
  let validErfahrungsnotenCount = 0;
  let validAPGradesCount = 0;
  const finalGrades = [];

  subjects.forEach(subject => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = subject;

    let erfahrungsnote, apGrade, finalGrade;

    try {
      if (subject === 'Naturwissenschaften') {
        const natur2 = calculateNaturwissenschaft(grades.chemie2, grades.physik2);
        const natur3 = calculateNaturwissenschaft(grades.chemie3, grades.physik3);
        if (natur2 !== null && natur3 !== null) {
          erfahrungsnote = roundToHalf((natur2 + natur3) / 2);
        } else {
          erfahrungsnote = natur2 || natur3 || null;
        }
        apGrade = calculateNaturwissenschaftenAP();
      } else if (subject === 'Mathematik GF') {
        erfahrungsnote = calculateMathematikGF();
        finalGrade = grades.bmNoteMathematikGF ? parseFloat(grades.bmNoteMathematikGF) : null;
      } else if (subject === 'Geschichte und Politik') {
        finalGrade = calculateGeschichteUndPolitik();
        erfahrungsnote = finalGrade;
      } else if (subject === 'Wirtschaft und Recht') {
        finalGrade = calculateWirtschaftUndRecht();
        erfahrungsnote = finalGrade;
      } else if (subject === 'Mathematik SF') {
        const subjectKey = 'mathematiksf';
        erfahrungsnote = calculateErfahrungsnote(subjectKey);
        apGrade = grades[`${subjectKey}AP`] ? parseFloat(grades[`${subjectKey}AP`]) : null;
      } else {
        const subjectKey = subject.toLowerCase().replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ä/g, 'a').replace(/ /g, '');
        erfahrungsnote = calculateErfahrungsnote(subjectKey);
        apGrade = grades[`${subjectKey}AP`] ? parseFloat(grades[`${subjectKey}AP`]) : null;
      }

      if (!['Mathematik GF', 'Geschichte und Politik', 'Wirtschaft und Recht'].includes(subject)) {
        finalGrade = calculateFinalGrade(erfahrungsnote, apGrade);
      }

      const erfahrungsnoteCell = row.insertCell(1);
      erfahrungsnoteCell.textContent = erfahrungsnote !== null && erfahrungsnote !== undefined ? Number(erfahrungsnote).toFixed(1) : '-';
      
      const apGradeCell = row.insertCell(2);
      apGradeCell.textContent = apGrade !== null && apGrade !== undefined ? Number(apGrade).toFixed(1) : '-';
      
      if (['Geschichte und Politik', 'Wirtschaft und Recht', 'Mathematik GF'].includes(subject)) {
        apGradeCell.style.backgroundColor = '#808080';
        apGradeCell.style.color = '#A9A9A9';
      } else if (apGrade !== null && apGrade !== undefined) {
        totalAPGrade += apGrade;
        validAPGradesCount++;
      }
      
      const finalGradeCell = row.insertCell(3);
      if (finalGrade !== null && finalGrade !== undefined) {
        const roundedFinalGrade = roundToHalf(finalGrade); // Updated to round to half
        finalGradeCell.textContent = roundedFinalGrade.toFixed(1);
        
        if (roundedFinalGrade < 4) {
          finalGradeCell.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        }
      
        totalFinalGrade += roundedFinalGrade;
        validFinalGradesCount++;
        finalGrades.push(roundedFinalGrade);
      } else {
        finalGradeCell.textContent = '-';
      }

      if (erfahrungsnote !== null && erfahrungsnote !== undefined) {
        totalErfahrungsnote += erfahrungsnote;
        validErfahrungsnotenCount++;
      }
    } catch (error) {
      console.error(`Error processing ${subject}:`, error);
      row.insertCell(1).textContent = '-';
      row.insertCell(2).textContent = '-';
      row.insertCell(3).textContent = '-';
    }
  });

  if (validFinalGradesCount > 0 || validErfahrungsnotenCount > 0 || validAPGradesCount > 0) {
    const averageRow = tableBody.insertRow();
    averageRow.insertCell(0).textContent = 'Overall Average';
    
    const avgErfahrungsnoteCell = averageRow.insertCell(1);
    if (validErfahrungsnotenCount > 0) {
      const overallErfahrungsnote = roundToOneTenth(totalErfahrungsnote / validErfahrungsnotenCount);
      avgErfahrungsnoteCell.textContent = overallErfahrungsnote.toFixed(1);
    } else {
      avgErfahrungsnoteCell.textContent = '-';
    }
    
    const avgAPGradeCell = averageRow.insertCell(2);
    if (validAPGradesCount > 0) {
      const overallAPGrade = roundToOneTenth(totalAPGrade / validAPGradesCount);
      avgAPGradeCell.textContent = overallAPGrade.toFixed(1);
    } else {
      avgAPGradeCell.textContent = '-';
    }
    
    const finalAverageCell = averageRow.insertCell(3);
    if (validFinalGradesCount > 0) {
      const overallAverage = roundToOneTenth(totalFinalGrade / validFinalGradesCount); // Still rounding the overall average to one-tenth
      finalAverageCell.textContent = overallAverage.toFixed(1);
    
      if (overallAverage < 4) {
        finalAverageCell.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      }
    } else {
      finalAverageCell.textContent = '-';
    }
  }

  const passFailStatus = determinePassFailStatus(grades, finalGrades);
  const passFailIndicator = document.getElementById('passFailIndicator');
  passFailIndicator.textContent = passFailStatus.message;
  passFailIndicator.style.backgroundColor = passFailStatus.color;
  passFailIndicator.style.color = passFailStatus.status === 'incomplete' ? '#000000' : '#FFFFFF';
}

function updateAllCalculations() {
  ['1', '2', '3'].forEach(sem => {
    const semesterGrades = Object.fromEntries(
      Object.entries(grades).filter(([key]) => key.endsWith(sem))
    );
    const semesterGrade = calculateSemesterGrade(semesterGrades, parseInt(sem));
    document.getElementById(`semester${sem}Grade`).textContent = semesterGrade.toFixed(1);

    if (sem === '2' || sem === '3') {
      const naturwissenschaftGrade = calculateNaturwissenschaft(grades[`chemie${sem}`], grades[`physik${sem}`]);
      document.getElementById(`naturwissenschaft${sem}`).textContent = naturwissenschaftGrade ? naturwissenschaftGrade.toFixed(1) : '-';
    }
  });

  const apNaturwissenschaften = calculateNaturwissenschaftenAP();
  const apNaturwissenschaftenElement = document.getElementById('apNaturwissenschaften');
  if (apNaturwissenschaftenElement) {
    apNaturwissenschaftenElement.textContent = apNaturwissenschaften ? apNaturwissenschaften.toFixed(1) : '-';
  }

  updateFinalGradesTable();
}

function saveGrades() {
  localStorage.setItem('grades', JSON.stringify(grades));
}

function loadGrades() {
  const savedGrades = localStorage.getItem('grades');
  if (savedGrades) {
    Object.assign(grades, JSON.parse(savedGrades));
    Object.keys(grades).forEach(key => {
      const element = document.getElementById(key);
      if (element) element.value = grades[key];
    });
  }
  updateAllCalculations();
}

function validateGradeInput(input) {
  const value = parseFloat(input.value);
  if (isNaN(value) || value < 1.0 || value > 6.0 || (value * 10) % 5 !== 0) {
    input.setCustomValidity('Please enter a valid grade between 1.0 and 6.0 in 0.5 increments.');
    input.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  } else {
    input.setCustomValidity('');
    input.style.backgroundColor = '';
  }
  input.reportValidity();
}

document.addEventListener('DOMContentLoaded', () => {
  populateGradeOptions();
  loadGrades();
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', (e) => {
      validateGradeInput(e.target);
      if (e.target.validity.valid) {
        grades[e.target.id] = e.target.value;
        saveGrades();
        updateAllCalculations();
      }
    });
  });

  const darkModeToggle = document.getElementById('darkModeToggle');
  const icon = darkModeToggle.querySelector('i');

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
  });
});

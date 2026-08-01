// ============================================================
// FILE: utils/matchScore.js
// Research Match Score Calculator
//
// ResearchConnect context:
// When Mansora views Dr. Sarah Chen's profile, it shows
// "94% Research Match". This file calculates that number.
//
// The Math — Jaccard Similarity:
// How many research interests do they SHARE divided by
// how many they have COMBINED.
//
// Example:
// Mansora interests: ["Medical Imaging", "AI", "SHAP", "Python"]
// Dr. Sarah interests: ["Medical Imaging", "AI", "Vision Transformers"]
//
// Shared: ["Medical Imaging", "AI"] = 2
// Combined (unique): ["Medical Imaging", "AI", "SHAP", "Python", "Vision Transformers"] = 5
// Score = 2/5 = 0.4 = 40%
//
// We also factor in:
// - Skills overlap (30% weight)
// - Research interests overlap (50% weight)
// - Role compatibility (20% weight)
//   e.g. student seeking PhD + supervisor open to PhD = bonus
//
// Why Jaccard and not Cosine Similarity?
// Jaccard works better for short lists of tags.
// Cosine works better for long text documents.
// Our interests are short tag lists so Jaccard is better.
//
// Later in Phase 2 we will upgrade this to use
// Sentence Transformers in Python which understands
// that "CNN" and "Convolutional Neural Network" are the same.
// For now Jaccard gives us a working match score immediately.
// ============================================================

function jaccardSimilarity(setA, setB) {
  // Convert to lowercase for case-insensitive comparison
  // "Medical Imaging" and "medical imaging" should match
  const a = new Set(setA.map(s => s.toLowerCase().trim()));
  const b = new Set(setB.map(s => s.toLowerCase().trim()));

  // Find intersection — what they share
  const intersection = new Set([...a].filter(x => b.has(x)));

  // Find union — everything combined without duplicates
  const union = new Set([...a, ...b]);

  // Avoid division by zero
  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

function calculateMatchScore(student, supervisor) {
  // Weight 1: Research interests similarity (50%)
  const interestScore = jaccardSimilarity(
    student.researchInterests || [],
    supervisor.researchInterests || []
  );

  // Weight 2: Skills overlap (30%)
  // Does the student have skills the supervisor values?
  const skillScore = jaccardSimilarity(
    student.skills || [],
    supervisor.skills || []
  );

  // Weight 3: Role compatibility bonus (20%)
  // Is the supervisor open to what the student needs?
  let compatibilityBonus = 0;

  // Student seeking PhD + supervisor open to PhD supervision
  if (
    student.seekingSupervisor &&
    supervisor.availability &&
    supervisor.availability.status === 'open'
  ) {
    compatibilityBonus = 0.3;
  } else if (
    student.seekingSupervisor &&
    supervisor.availability &&
    supervisor.availability.status === 'limited'
  ) {
    compatibilityBonus = 0.15;
  }

  // Funding match bonus
  // Student needs full funding + supervisor has funded slots
  if (
    student.fundingNeeded === 'Full scholarship preferred' &&
    supervisor.availability &&
    supervisor.availability.fundedSlots > 0
  ) {
    compatibilityBonus += 0.1;
  }

  // Calculate weighted final score
  const rawScore = (
    interestScore * 0.5 +
    skillScore * 0.3 +
    compatibilityBonus * 0.2
  );

  // Convert to percentage and cap at 99
  // We never show 100% because no match is perfect
  const percentage = Math.min(Math.round(rawScore * 100), 99);

  return {
    score: percentage,
    breakdown: {
      interestMatch: Math.round(interestScore * 100),
      skillMatch: Math.round(skillScore * 100),
      compatibilityBonus: Math.round(compatibilityBonus * 100),
      sharedInterests: (student.researchInterests || []).filter(
        i => (supervisor.researchInterests || [])
          .map(s => s.toLowerCase())
          .includes(i.toLowerCase())
      ),
      sharedSkills: (student.skills || []).filter(
        s => (supervisor.skills || [])
          .map(sk => sk.toLowerCase())
          .includes(s.toLowerCase())
      )
    }
  };
}

module.exports = { calculateMatchScore, jaccardSimilarity };
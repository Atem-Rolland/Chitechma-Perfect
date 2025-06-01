
export const DEPARTMENTS = {
  CESM: "Department of computer engineering and system maintenance",
  NES: "Department of network engineering and security",
  EPS: "Department of electrical power systems",
  LTM: "Department of logistics and transport management",
  PRM: "Department of project management",
  ACC: "Department of accounting",
  HMC: "Department of hotel management and catering",
  BFP: "Department of baking and food processing",
  FCT: "Department of fashion,clothing and textile",
  NUS: "Department of nursing",
  MLS: "Department of medical laboratory sciences",
  CPT: "Department of Crop Production Technology", // New Department
};

export const VALID_LEVELS = [200, 300, 400, 500, 600, 700]; // Assuming final year could be 400 for B.Eng or higher for other programs

export const ACADEMIC_YEARS = ["2022/2023", "2023/2024", "2024/2025", "2025/2026"];
export const SEMESTERS = ["First Semester", "Second Semester", "Resit Semester"];

export const GRADE_POINTS_CONFIG: Record<string, { points: number; remark: string; minScore: number; isPass: boolean }> = {
  "A":  { points: 4.0, remark: "Excellent",     minScore: 80, isPass: true },
  "B+": { points: 3.5, remark: "Very Good",     minScore: 70, isPass: true },
  "B":  { points: 3.0, remark: "Good",          minScore: 60, isPass: true },
  "C+": { points: 2.5, remark: "Pass",          minScore: 55, isPass: true },
  "C":  { points: 2.0, remark: "Average",       minScore: 50, isPass: true },
  "D+": { points: 1.5, remark: "Failed",        minScore: 45, isPass: false },
  "D":  { points: 1.0, remark: "Failed",        minScore: 40, isPass: false },
  "F":  { points: 0.0, remark: "Poor",          minScore: 0,  isPass: false },
};

// Function to get grade details from score
export function getGradeDetailsFromScore(score: number | null): { gradeLetter: string; points: number; remark: string; isPass: boolean } {
  if (score === null || score < 0 || score > 100) {
    // Handle cases where score is not yet available or invalid
    return { gradeLetter: "NG", points: 0.0, remark: "Not Graded", isPass: false }; // NG for Not Graded
  }
  if (score >= 80) return { gradeLetter: "A", ...GRADE_POINTS_CONFIG["A"] };
  if (score >= 70) return { gradeLetter: "B+", ...GRADE_POINTS_CONFIG["B+"] };
  if (score >= 60) return { gradeLetter: "B", ...GRADE_POINTS_CONFIG["B"] };
  if (score >= 55) return { gradeLetter: "C+", ...GRADE_POINTS_CONFIG["C+"] };
  if (score >= 50) return { gradeLetter: "C", ...GRADE_POINTS_CONFIG["C"] };
  if (score >= 45) return { gradeLetter: "D+", ...GRADE_POINTS_CONFIG["D+"] };
  if (score >= 40) return { gradeLetter: "D", ...GRADE_POINTS_CONFIG["D"] };
  return { gradeLetter: "F", ...GRADE_POINTS_CONFIG["F"] };
}

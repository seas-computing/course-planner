const getCurrentAcademicYear = (): number => {
  const now = new Date();
  const calendarYear = now.getFullYear();
  const JUNE = 5;
  const academicYear = now.getMonth() <= JUNE
    ? calendarYear
    : calendarYear + 1;
  return academicYear;
};

export default getCurrentAcademicYear;

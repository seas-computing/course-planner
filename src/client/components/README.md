# Component Hierarchy

This component hierarchy doesn't make an explicit distinction between presentational components and logical containers. That said, you can broadly assume that the components under `/pages` will maintain most of the state and will be used to compose the other components underneath them.

This plan covers 10 directories and includes 66 files (for comparison, the EAF project ended with 16 directories and 89 files).

[Associated GitHub Project](https://github.com/seas-computing/course-planner/projects/2)

```
components
├── forms 
│   ├── __tests__
│   ├── AttendanceForm.tsx 
│   ├── EditViewForm.tsx
│   ├── EditCourseForm.tsx
│   ├── EditFacultyForm.tsx 
│   ├── index.ts
│   ├── NewCourseForm.tsx 
│   ├── NewFacultyForm.tsx 
│   └── RoomSelectionForm.tsx 
├── generics
│   ├── buttons
│   │   ├── __tests__
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── index.ts
│   │   ├── LinkButton.tsx
│   │   └── TextButton.tsx
│   ├── inputs
│   │   ├── __tests__
│   │   ├── DateField.tsx
│   │   ├── Dropdown.tsx
│   │   ├── index.ts
│   │   ├── NumberField.tsx
│   │   └── TextField.tsx
│   ├── spinners
│   │   ├── __tests__
│   │   ├── FetchingSpinner.tsx
│   │   ├── index.ts
│   │   └── SavingSpinner.tsx
│   └── index.ts
├── layout
│   ├── __tests__
│   ├── Body.tsx
│   ├── Header.tsx
│   ├── index.ts
│   ├── Message.tsx
│   ├── Modal.tsx
│   ├── Navigation.tsx
│   ├── Page.tsx
│   ├── Sidebar.tsx
│   └── UserMenu.tsx
├── pages
│   ├── __tests__
│   ├── AdminCourses.tsx
│   ├── AdminFaculty.tsx
│   ├── AdminRooms.tsx
│   ├── Admin.tsx
│   ├── Courses.tsx
│   ├── Faculty.tsx
│   ├── index.ts
│   ├── Plan.tsx
│   ├── Rooms.tsx
│   └── Schedule.tsx
├── routes
│   ├── __tests__
│   ├── AdminRoutes.tsx
│   ├── index.ts
│   ├── MasterRoutes.tsx
│   ├── NoMatch.tsx
│   ├── PlanningRoutes.tsx
│   ├── PublicRoutes.tsx
│   └── Unauthorized.tsx
├── schedule
│   ├── __tests__
│   ├── AreaBlock.tsx
│   ├── AreaHeading.tsx
│   ├── CalendarBox.tsx
│   ├── CourseListing.tsx
│   ├── DayBlock.tsx
│   ├── DayHeading.tsx
│   ├── HourHeading.tsx
│   └── index.ts
├── table
│   ├── __tests__
│   ├── index.ts
│   ├── TableBody.tsx
│   ├── TableCellFacultyListItem.tsx
│   ├── TableCellFacultyList.tsx
│   ├── TableCell.tsx
│   ├── TableHeaderCell.tsx
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   └── Table.tsx
├── __tests__
└── App.tsx
```

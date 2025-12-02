# Admin Dashboard Features

## New Features Added

### 1. Create Department
**Location:** Admin Dashboard → Departments Tab

**How to Use:**
1. Login as admin (username: `admin`, role: ADMIN)
2. Navigate to the "Departments" tab
3. Click the "**+ Add Department**" button (top right)
4. Enter the department name in the modal
5. Click "Create"

**Features:**
- Simple modal form with department name input
- Instant UI update after creation
- New department appears immediately in the departments list

---

### 2. Create Module (Inside Department)
**Location:** Admin Dashboard → Departments Tab → Select a Department

**How to Use:**
1. Login as admin
2. Go to "Departments" tab
3. Click on any department card to view its details
4. Click the "**+ Add Module**" button (top right)
5. Fill in the module form:
   - **Module Code**: e.g., CS401
   - **Module Name**: e.g., Machine Learning
   - **Assign Lecturer**: Select from active lecturers in this department
   - **Student Limit**: Set enrollment capacity (default: 30)
6. Click "Create Module"

**Features:**
- Modal form with all required fields
- Dropdown to assign lecturers (only shows active lecturers from the department)
- Configurable student limit (1-100)
- New module appears immediately in the department's module list
- Module starts with 0 enrolled students

**Validation:**
- All fields are required
- Only active lecturers can be assigned
- Student limit must be between 1 and 100

---

## Updated AuthContext Functions

### `createDepartment(name: string): Department`
Creates a new department with a unique ID.

**Parameters:**
- `name`: Department name (string)

**Returns:** The newly created Department object

---

### `createModule(moduleData): Module`
Creates a new module in a specific department with an assigned lecturer.

**Parameters:**
```typescript
{
  code: string;        // Module code (e.g., "CS401")
  name: string;        // Module name (e.g., "Machine Learning")
  departmentId: string; // ID of the department
  lecturerId: string;   // ID of the assigned lecturer
  limit: number;        // Maximum enrollment capacity
}
```

**Returns:** The newly created Module object

---

### `assignLecturer(moduleId: string, lecturerId: string): boolean`
Assigns or reassigns a lecturer to an existing module.

**Parameters:**
- `moduleId`: ID of the module
- `lecturerId`: ID of the lecturer to assign

**Returns:** `true` if successful, `false` if module not found

---

## UI Improvements

### Departments Tab
- **Add Department Button**: Blue button at top right of departments list
- **Add Module Button**: Blue button at top right when viewing department details
- **Modal Forms**: Clean, centered modals with form validation
- **Immediate Updates**: All changes reflect immediately without page refresh

### Department Detail View
Shows:
- Back button to return to departments list
- Department name as header
- Add Module button
- Grid of all modules in the department
- List of all lecturers in the department

---

## Testing the New Features

### Test Scenario 1: Create a New Department
1. Login as `admin` (role: ADMIN)
2. Go to Departments tab
3. Click "+ Add Department"
4. Enter "Engineering" as department name
5. Click Create
6. Verify new department appears in the list

### Test Scenario 2: Create a Module
1. Login as `admin`
2. Go to Departments tab
3. Click on "Computer Science" department
4. Click "+ Add Module"
5. Fill in:
   - Code: CS501
   - Name: Cloud Computing
   - Lecturer: Select "lecturer1" (active lecturer)
   - Limit: 35
6. Click "Create Module"
7. Verify module appears in the modules grid with:
   - Status: "Open" (green badge)
   - Capacity: 0/35
   - Assigned lecturer name

### Test Scenario 3: Verify Lecturer Filtering
1. Login as `admin`
2. Navigate to Mathematics department
3. Click "+ Add Module"
4. Check the lecturer dropdown
5. Verify that only active lecturers are shown (should not see "lecturer_pending")

---

## Technical Implementation

### State Management
- `useState` for modal visibility
- `useState` for form data
- Context API for global state updates

### Modal Implementation
- Full-screen overlay with backdrop
- Centered modal with form fields
- Cancel button to close without saving
- Form validation before submission

### Data Flow
1. User fills form in modal
2. Form validation runs
3. Context function called (createDepartment/createModule)
4. State updates trigger re-render
5. Modal closes automatically
6. New data appears in UI immediately

---

## Future Enhancements (Suggestions)

1. **Edit Department**: Add ability to rename departments
2. **Delete Department**: Add deletion with confirmation (only if no modules)
3. **Edit Module**: Modify module details and reassign lecturers
4. **Delete Module**: Remove modules (only if no enrollments)
5. **Bulk Operations**: Import/export departments and modules
6. **Search & Filter**: Search modules by code/name, filter by lecturer
7. **Module Templates**: Save common module configurations
8. **Audit Log**: Track who created what and when

---

## API Integration Notes

When connecting to the backend, these functions will need to call:

### POST /api/departments
```json
{
  "name": "Engineering"
}
```

### POST /api/modules
```json
{
  "code": "CS501",
  "name": "Cloud Computing",
  "departmentId": "dept1",
  "lecturerId": "lecturer1",
  "limit": 35
}
```

### PUT /api/modules/:id/lecturer
```json
{
  "lecturerId": "lecturer2"
}
```

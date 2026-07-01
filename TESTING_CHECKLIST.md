# Comprehensive Production Testing Checklist & Scenario Manual

This document outlines the end-to-end testing matrix for the Swapboard platform. It covers all roles (**Super Admin**, **Org Admin**, **Manager**, **Worker**), all core workflows, data validations, edge cases, security controls, browser compatibility, compliance, performance, and integrations.

---

## 1. AUTHENTICATION & AUTHORIZATION

### Functional Checklist
- [ ] **Sign-Up Validation**:
  - [ ] User can sign up with a valid, unique email address.
  - [ ] System blocks sign-up with invalid email format (missing `@`, missing domain, invalid characters).
  - [ ] System blocks sign-up with a duplicate email and shows an appropriate error message.
  - [ ] Passwords must meet complexity requirements (minimum 8 characters, number, letter, special character).
  - [ ] Disallowed email domains check: System blocks common personal domains if configured to require business domains.
- [ ] **Login Verification**:
  - [ ] Login with correct email and password redirects user to their appropriate dashboard.
  - [ ] Login fails with incorrect password, showing a clear but secure error message.
  - [ ] Login fails with non-existent email.
  - [ ] Rate limiting: Block login attempts after 5 consecutive failures (triggers lock-out period).
- [ ] **Session & State**:
  - [ ] Logout invalidates the Supabase session, clears cookies/local storage, and redirects to `/login`.
  - [ ] Accessing protected routes (e.g., `/shifts`, `/admin`, `/super-admin`) without an active session redirects to `/login`.
  - [ ] Refreshing any dashboard maintains session and doesn't trigger flash redirect loops.
- [ ] **Role-Based Redirect Gating (RBAC)**:
  - [ ] **Super Admin**: Redirects automatically to `/super-admin`. Accessing `/dashboard` or `/admin` redirects back to `/super-admin`.
  - [ ] **Org Admin**: Redirects automatically to `/admin/dashboard`. Accessing `/dashboard` redirects back to `/admin/dashboard`.
  - [ ] **Manager**: Redirects to `/dashboard`. Accessing `/admin` or `/super-admin` redirects back to `/dashboard`.
  - [ ] **Worker**: Redirects to `/my-shifts`. Accessing `/dashboard`, `/admin`, or `/super-admin` redirects to `/my-shifts`.

### Scenario Walkthroughs

#### Scenario 1.1: Unauthorized Navigation Attempt
* **Pre-conditions**: Active worker user account `worker@swapboard.com`.
* **Steps**:
  1. Login as `worker@swapboard.com`.
  2. Once on `/my-shifts`, manually change the browser URL to `/admin/dashboard` and press Enter.
  3. Change the browser URL to `/dashboard` and press Enter.
  4. Change the browser URL to `/super-admin` and press Enter.
* **Expected Outcomes**:
  - Step 2: Access is denied. Middleware intercepts request and redirects back to `/my-shifts`.
  - Step 3: Access is denied. Redirects back to `/my-shifts`.
  - Step 4: Access is denied. Redirects back to `/my-shifts`.

#### Scenario 1.2: Super Admin First-Time Login & Portal Gating
* **Pre-conditions**:
  1. An account exists with `user_role` set to `'super_admin'`.
  2. Database contains active records for multiple organizations, users, and swaps.
* **Steps**:
  1. Navigate to `/login` and sign in with the Super Admin credentials.
  2. Attempt to manually navigate to `/admin/dashboard`.
  3. Attempt to manually navigate to `/dashboard`.
  4. Click the "Profile Settings" option in the header dropdown.
* **Expected Outcomes**:
  - Step 1: User is redirected automatically to `/super-admin`.
  - Step 2: System intercepts the request and redirects the user to `/super-admin` (or `/super-admin/dashboard`).
  - Step 3: System intercepts the request and redirects the user to `/super-admin`.
  - Step 4: User is navigated to the platform/super-admin settings page.

---

## 2. SHIFT MANAGEMENT - ADMIN & MANAGER

### Functional Checklist
- [ ] **Shift Creation**:
  - [ ] Admin can create a shift for any department in the organization.
  - [ ] Manager can create shifts only for their assigned departments (and the "General" department).
  - [ ] Validation: Shift title, start time, end time, and department are required.
  - [ ] Validation: System blocks creating shifts in the past.
  - [ ] Validation: End time must be after start time.
  - [ ] Validation: Overlapping shift alert or block if assigning the same worker to two concurrent shifts.
  - [ ] General department shifts can only be posted as "Unassigned" (open shifts).
- [ ] **Schedule View & Grid**:
  - [ ] Shift list loads in chronological order.
  - [ ] Shifts display correct department color codes.
  - [ ] Shift card displays title, times, department, status, and assigned worker.
  - [ ] Filtering shifts by department works and updates the list instantly.
  - [ ] Filtering shifts by status (e.g., Unassigned, Claimed, Swapped) works.
- [ ] **Editing & Deleting**:
  - [ ] Authorized user can edit shift title, times, notes, department, and assigned worker.
  - [ ] Changing assigned worker updates the shift state correctly in the database.
  - [ ] Deleting a shift prompts a confirmation dialog.
  - [ ] Deleted shifts are soft-deleted (`deleted_at` timestamp is set, shift disappears from normal view but records remain in database for audit logs).
  - [ ] Bulk delete multiple shifts works.

### Scenario Walkthroughs

#### Scenario 2.1: Department Manager Creating Shift
* **Pre-conditions**: Logged in as manager `manager@swapboard.com` who is scoped ONLY to the "Kitchen" department.
* **Steps**:
  1. Open the schedule page and click "Add Shift".
  2. Look at the Department dropdown selection.
  3. Attempt to create a shift in the "Reception" department.
  4. Create a shift in the "Kitchen" department scheduled for tomorrow 9 AM - 5 PM.
* **Expected Outcomes**:
  - Step 2: The manager can only select "Kitchen" and "General" departments.
  - Step 3: UI blocks the action; API rejects the request if manually triggered.
  - Step 4: Shift is created successfully. A confirmation toast appears, and the new shift is visible on the schedule.

---

## 3. SHIFT MANAGEMENT - WORKER

### Functional Checklist
- [ ] **Schedule Visibility**:
  - [ ] Worker lands on `/my-shifts` displaying only their assigned shifts.
  - [ ] Shifts are split cleanly between "Upcoming Shifts" and "Shift History" (past shifts).
  - [ ] Shift card shows start/end times in the worker's local browser timezone.
- [ ] **Open Shifts & Claims**:
  - [ ] Worker can navigate to the "Open Shifts" page.
  - [ ] Open shifts list displays only unassigned shifts in the worker's department and "General" shifts.
  - [ ] Clicking "Claim Shift" opens a confirmation dialog.
  - [ ] Claiming a shift changes its status from `not_started` to `pending_approval_claim` or directly to assigned depending on settings.
  - [ ] Claimed shift immediately disappears from the "Open Shifts" view for other workers.

### Scenario Walkthroughs

#### Scenario 3.1: Worker Claiming Open Shift
* **Pre-conditions**:
  1. An unassigned shift "Kitchen Assistant" tomorrow 12 PM - 4 PM exists.
  2. Worker `worker1@swapboard.com` (assigned to "Kitchen" department) is logged in.
  3. Worker `worker2@swapboard.com` (assigned to "Delivery" department) is logged in on a separate browser.
* **Steps**:
  1. `worker2` logs in and checks "Open Shifts".
  2. `worker1` logs in, goes to "Open Shifts", and clicks "Claim Shift" on the "Kitchen Assistant" shift.
  3. `worker1` confirms the claim.
* **Expected Outcomes**:
  - Step 1: `worker2` cannot see the "Kitchen Assistant" shift because they belong to "Delivery".
  - Step 2: `worker1` sees the shift and can trigger the claim.
  - Step 3: Shift status updates. A notification toast appears, and the shift is added to `worker1`'s upcoming shifts list.

---

## 4. SWAP FUNCTIONALITY & APPROVALS

### Functional Checklist
- [ ] **Posting a Swap**:
  - [ ] Worker can post their upcoming assigned shift for swap.
  - [ ] Worker can optionally enter a reason for the swap (e.g., "Doctor's appointment").
  - [ ] Shift status changes to `up_for_swap`.
  - [ ] Shift appears in the "Available Swaps" pool for other qualified workers in the same department.
  - [ ] Worker cannot swap a shift that has already started or ended.
- [ ] **Bidding/Covering a Swap**:
  - [ ] Another worker in the same department can view the swap and offer to cover it.
  - [ ] Offering to cover changes the swap request status to `worker_accepted`.
  - [ ] Original requester receives a real-time notification that someone offered coverage.
  - [ ] The swap is locked from other workers trying to bid on it.
- [ ] **Manager/Admin Approvals**:
  - [ ] Pending swaps show up on the manager's and admin's dashboards.
  - [ ] Details show: original worker, covering worker, shift title/times, and swap reason.
  - [ ] Approving a swap updates the shift's `assigned_to` column to the covering worker and sets status back to normal.
  - [ ] Rejecting a swap leaves the shift assigned to the original worker and sets status back to normal.
  - [ ] Actions write an audit log entry in the database.
- [ ] **Swap History**:
  - [ ] Approved swaps visible in history.
  - [ ] Rejected swaps visible in history.
  - [ ] Cancelled swaps visible in history.
  - [ ] Timeline shows all swap events.

### Scenario Walkthroughs

#### Scenario 4.1: Complete Swap Loop (Worker to Worker to Admin Approval)
* **Pre-conditions**:
  1. Worker A has shift tomorrow 9 AM - 5 PM.
  2. Worker B is in the same department.
  3. Org Admin is active.
* **Steps**:
  1. Worker A logs in, selects the shift, and clicks "Request Swap", entering the reason "Family Event".
  2. Worker B logs in, goes to "Available Swaps", and clicks "Offer to Cover" on Worker A's shift.
  3. Org Admin logs in, views the dashboard, locates the pending approval queue, and clicks "Approve".
* **Expected Outcomes**:
  - Step 1: Shift status in database becomes `up_for_swap`.
  - Step 2: Shift status in database becomes `worker_accepted` (pending manager/admin approval).
  - Step 3: Shift is reassigned to Worker B. Worker A is released from the shift. Dashboards update stats (Total Swaps increments, Cost Savings, and Manager Hours Saved recalculate dynamically). No database schema errors are thrown.

---

## 5. USER ROLES & PERMISSIONS

### Functional Checklist
- [ ] **Super Admin (Platform Owner)**:
  - [ ] Has global access to `/super-admin`.
  - [ ] Can view MRR (Monthly Recurring Revenue), total active organizations, total registered users, and active trials.
  - [ ] Can view plan breakdown metrics (Starter, Pro, Enterprise, Trial).
  - [ ] Can view platform-wide analytics showing total swap volume trends across all clients.
  - [ ] Can toggle organization statuses or edit billing tiers.
  - [ ] Can access internal platform settings at `/super-admin/settings` (system health status, db connections, API integrations).
- [ ] **Org Admin (Organization Owner)**:
  - [ ] Scoped to their specific organization.
  - [ ] Can create departments, invite team members, edit roles.
  - [ ] Can access the full `/admin/dashboard` showing organization-wide metrics.
  - [ ] Has unrestricted access to view, schedule, and approve shifts/swaps across all departments.
  - [ ] Can click profile settings and navigate correctly to `/admin/settings`.
  - [ ] Can view and dismiss the Pro trial progress banner.
- [ ] **Manager**:
  - [ ] Scoped to assigned departments + "General" department.
  - [ ] Can schedule and approve shifts/swaps only for their scoped departments.
  - [ ] Cannot edit organizational settings, billing, or delete departments.
  - [ ] Can access manager dashboard.
- [ ] **Worker**:
  - [ ] Can only manage own schedule, post swaps, or claim shifts.
  - [ ] No access to administrative pages or actions.

### Role Comparison Matrix

| Action | Super Admin | Org Admin | Manager | Worker |
| :--- | :---: | :---: | :---: | :---: |
| View Global Platform MRR | Yes | No | No | No |
| Change Org Subscription Plan | Yes | No | No | No |
| Create Departments | No | Yes | No | No |
| Edit Employee Roles | No | Yes | No | No |
| Schedule Shift (Scoped Dept) | No | Yes | Yes | No |
| Schedule Shift (Any Dept) | No | Yes | No | No |
| Request Swap | No | No | No | Yes |
| Approve Swap (Scoped Dept) | No | Yes | Yes | No |

---

## 6. DEPARTMENT & TEAM MANAGEMENT

### Functional Checklist
- [ ] **Department Setup**:
  - [ ] Create a department with a custom name and color badge.
  - [ ] Prevent creation of duplicate department names within the same organization.
  - [ ] System automatically provisions a "General" department for every new workspace.
  - [ ] Safety check: Block deleting a department if it has active assigned workers or upcoming shifts.
- [ ] **Team Invitations & Onboarding**:
  - [ ] Org Admin can send email invites to workers and managers.
  - [ ] Invites contain a secure, unique token stored in the database with an expiration date.
  - [ ] Recipient clicking the invite link is routed to complete their password setup and onboarding profile.
  - [ ] Link invalidates immediately after acceptance or expiration.
  - [ ] Admin can edit user profiles, assign departments, change roles, or toggle user status (Active/Inactive).

### Scenario Walkthroughs

#### Scenario 6.1: Safe Department Deletion Block
* **Pre-conditions**: Department "Emergency Room" exists with 1 upcoming shift assigned.
* **Steps**:
  1. Log in as Org Admin.
  2. Go to Settings > Departments.
  3. Click "Delete" on "Emergency Room".
* **Expected Outcomes**:
  - Step 3: Deletion is blocked. A warning dialog appears stating: "Cannot delete department with active shifts or assigned team members." The record remains unchanged in the database.

---

## 7. PROFILE MANAGEMENT

### Functional Checklist
- [ ] **Worker Profile Completion**:
  - [ ] Dashboard displays a completion percentage bar based on profile fields filled.
  - [ ] Worker can update full name, personal email, phone number, and emergency contact details.
  - [ ] Updating profile details recalculates completion score in real-time.
- [ ] **Notification Preferences**:
  - [ ] User can configure preferences for Email and In-App notifications.
  - [ ] Settings include toggles for Immediate notifications and Daily digest formats.
  - [ ] Changes save securely to the database (in the profile's JSON columns) and persist across sessions.
- [ ] **Manager/Admin Profile Settings**:
  - [ ] Manager can view assigned departments on profile.
  - [ ] Admin can navigate to organization profile settings.

---

## 8. REAL-TIME NOTIFICATIONS & ALERTS

### Functional Checklist
- [ ] **In-App Toast Alerts**:
  - [ ] Actions like creating a shift, posting a swap, or approving requests trigger success/error toast alerts.
  - [ ] Toasts slide in gracefully, display clear messages, and auto-dismiss after 3-5 seconds.
- [ ] **Notification Center**:
  - [ ] Clicking the notification bell icon opens the list of user alerts.
  - [ ] Unread notifications are marked with a colored badge indicator.
  - [ ] Clicking a notification marks it as read and redirects the user to the relevant page (e.g., clicking a swap notification routes to `/swaps`).
  - [ ] User can clear or mark all notifications as read.
- [ ] **Email Dispatch (Resend Integration)**:
  - [ ] Event: Shift assigned -> email sent to worker.
  - [ ] Event: Swap requested -> email sent to coworkers (or managers).
  - [ ] Event: Swap status updated -> email sent to requester and cover worker.
  - [ ] Emails display clean HTML styling with organizational branding.

---

## 9. DATA INTEGRITY, CONSTRAINTS & TIMEZONES

### Functional Checklist
- [ ] **Timezone Conversions**:
  - [ ] Shift times are stored in UTC format in the database.
  - [ ] UI converts UTC times to display correctly in the user's browser local timezone.
  - [ ] Scheduling night shifts (spanning past midnight, e.g., 10 PM - 6 AM) calculates duration and dates accurately.
- [ ] **Foreign Key Constraints**:
  - [ ] Shift records must link to valid worker profile IDs and department IDs.
  - [ ] Swap requests must reference a valid shift ID. Deleting a shift cascades to cancel or clean up associated pending swap requests.
- [ ] **State Machine Validation**:
  - [ ] Shift status transitions must follow the strict workflow:
    `not_started` ➔ `up_for_swap` ➔ `pending_approval_swap` ➔ `swapped` ➔ `done_pending_approval` ➔ `done_manager_approved`.
  - [ ] Blocks illegal status jumps (e.g., changing a completed shift status back to `up_for_swap`).

---

## 10. FILTERING, SEARCH & PAGINATION

### Functional Checklist
- [ ] **Schedule Filters**:
  - [ ] Combined filtering: User can filter shifts by department AND status AND date range simultaneously.
  - [ ] Clearing filters returns the full set of active shifts.
  - [ ] Searching by worker name displays only shifts assigned to that worker.
- [ ] **User Roster Search**:
  - [ ] Searching by email or name filters the user table dynamically.
  - [ ] Pagination controls allow browsing through large rosters (e.g., 25, 50, 100 entries per page).

---

## 11. ERROR HANDLING

### Functional Checklist
- [ ] **Network Errors**:
  - [ ] Graceful handling of connection loss (no app crash).
  - [ ] Retry option for failed requests.
  - [ ] Error messages clearly displayed.
- [ ] **Validation Errors**:
  - [ ] Required field validation messages clear.
  - [ ] Format validation errors helpful (e.g., phone format, email format).
- [ ] **Database Errors**:
  - [ ] Constraint violations handled gracefully.
  - [ ] User-friendly error descriptions (no plain database stack trace).
- [ ] **Authorization Errors**:
  - [ ] Unauthorized access prevents action.
  - [ ] User informed why action blocked.
  - [ ] Cannot bypass via URL manipulation.

---

## 12. SECURITY

### Functional Checklist
- [ ] **Authentication Security**:
  - [ ] Passwords hashed in database (using standard security providers).
  - [ ] HTTPS enforced.
  - [ ] Session tokens secure.
- [ ] **Authorization Security**:
  - [ ] RLS (Row-Level Security) policies enforced at database level.
  - [ ] Cannot access other org's data.
  - [ ] Cannot access restricted endpoints via API.
  - [ ] Role-based access enforced server-side.
- [ ] **Data Protection**:
  - [ ] Sensitive data not logged.
  - [ ] Passwords never visible in UI.
  - [ ] API responses only contain authorized data.

---

## 13. PERFORMANCE

### Functional Checklist
- [ ] **Load Times**:
  - [ ] Dashboard loads < 2 seconds.
  - [ ] Shift list loads < 1.5 seconds.
  - [ ] Swap approval instant (< 500ms).
- [ ] **Database Performance**:
  - [ ] Queries optimized with indexes.
  - [ ] No N+1 queries.
  - [ ] Pagination works for large datasets.
- [ ] **UI Performance**:
  - [ ] No layout shifts (CLS minimized).
  - [ ] Animations smooth (60fps).
  - [ ] Modal/dialog opens instantly.
- [ ] **Scalability**:
  - [ ] System handles 100+ concurrent users.
  - [ ] Database scales with data growth.

---

## 14. BROWSER & MOBILE COMPATIBILITY

### Functional Checklist
- [ ] **Desktop Browsers**:
  - [ ] Chrome (latest 2 versions).
  - [ ] Firefox (latest 2 versions).
  - [ ] Safari (latest 2 versions).
  - [ ] Edge (latest 2 versions).
- [ ] **Mobile Browsers**:
  - [ ] iOS Safari.
  - [ ] Chrome Mobile.
  - [ ] Firefox Mobile.
- [ ] **Responsive Design**:
  - [ ] Mobile layout works (< 480px).
  - [ ] Tablet layout works (480px - 1024px).
  - [ ] Desktop layout works (> 1024px).
  - [ ] Touch interactions work on mobile.
  - [ ] No horizontal scrolling on mobile.

---

## 15. ACCESSIBILITY

### Functional Checklist
- [ ] **WCAG 2.1 AA Compliance**:
  - [ ] Keyboard navigation works.
  - [ ] Tab order logical.
  - [ ] Focus indicators visible.
  - [ ] Color not only indicator.
  - [ ] Contrast ratios meet standards.
  - [ ] Form labels associated correctly.
- [ ] **Screen Readers**:
  - [ ] Semantic HTML used.
  - [ ] ARIA labels where needed.
  - [ ] Images have alt text.

---

## 16. CONCURRENT OPERATIONS & EDGE CASES

### Scenario Walkthroughs

#### Scenario 16.1: Concurrent Shift Claims (Race Condition)
* **Pre-conditions**:
  1. An open shift "Receptionist Saturday" tomorrow 9 AM - 1 PM exists.
  2. Worker A and Worker B are both logged in.
* **Steps**:
  1. Both Worker A and Worker B open the open shifts page.
  2. At the exact same time, both click "Claim Shift" on the "Receptionist Saturday" shift.
  3. Both click confirm within milliseconds.
* **Expected Outcomes**:
  - Database constraint or transaction lock handles the requests sequentially.
  - The first request to arrive succeeds, updating the shift assignment.
  - The second request is rejected with a clear message: "This shift has already been claimed by another worker."
  - No duplicate assignments exist in the database.

#### Scenario 16.2: Timezone Daylight Saving Transition
* **Pre-conditions**:
  1. Testing in a region undergoing a DST transition (e.g., clocks forward 1 hour at 2 AM).
* **Steps**:
  1. Create a shift spanning 1 AM to 5 AM during the transition night.
  2. Verify the display duration and UTC timestamps in the database.
* **Expected Outcomes**:
  - Shift duration reflects the actual elapsed hours (3 hours instead of 4).
  - UTC start/end times in the database are stored correctly.

---

## 17. COMPLIANCE & AUDIT

### Functional Checklist
- [ ] **Audit Trail**:
  - [ ] All shifts logged with timestamp.
  - [ ] All swaps logged with timestamp.
  - [ ] Approvals/rejections logged.
  - [ ] User actions traceable.
- [ ] **Data Retention**:
  - [ ] Deleted data soft-deleted (recoverable).
  - [ ] Backup strategy in place.
  - [ ] Data backup tested (restore works).

---

## 18. ANALYTICS & REPORTING

### Functional Checklist
- [ ] **KPI Calculations**:
  - [ ] Swap Fulfillment Rate = (Approved Swaps / Total Requested Swaps) * 100.
  - [ ] Cost Savings = Overtime avoided hours * average hourly rates.
  - [ ] Manager Time Saved = Swaps completed * 1.5 hours per manual swap saved.
- [ ] **Reporting & Formats**:
  - [ ] CSV Export: Generates a downloadable spreadsheet containing all filtered shift/swap records.
  - [ ] PDF Export: Generates a print-ready report card matching the dashboard widgets.

### Scenario Walkthroughs

#### Scenario 18.1: Super Admin Platform Metrics Verification
- **Pre-conditions**:
  1. Logged in as Super Admin at `/super-admin/dashboard`.
  2. Database has 4 organizations (e.g. 2 on trial, 1 starter, 1 pro).
- **Steps**:
  1. Verify the "Metric Cards" displayed at the top.
  2. Verify the "Recent Sign-ups" list.
  3. Verify the "Plan Distribution" progress bars.
  4. Verify the "Recently Joined Members" table.
- **Expected Outcomes**:
  - Step 1: Total Organizations card shows `4`. MRR is accurately calculated. Active Trials shows `2`.
  - Step 2: Lists the organizations in descending order of creation. Plan badge for trial orgs is muted gray, while starter/pro are gold/colored.
  - Step 3: Displays Starter (25%), Pro (25%), Trial (50%) with gold loading bars.
  - Step 4: Table correctly joins profiles with their organizations, displaying member name, email, organization name, plan type, total swaps, and signup date.

#### Scenario 18.2: Org Admin Org-Wide Analytics & Shared Pages
- **Pre-conditions**:
  1. User logged in with `user_role` set to `'org_admin'`.
  2. Organization has multiple departments (e.g. "General", "ICU", "Pediatrics").
  3. Swap requests exist in different departments.
- **Steps**:
  1. Navigate to `/admin/dashboard` and verify the "Team Members" and "Departments" counts.
  2. Verify that pending approvals (swaps, claims, completions) show items from all departments.
  3. Click on "Shifts" in the sidebar to load `/shifts`.
  4. Click on "Team" in the sidebar to load `/team`.
- **Expected Outcomes**:
  - Step 1: Team Members shows the total active profile count for this organization. Departments card shows the total department count.
  - Step 2: No department-scoping filters are applied; swaps/claims from ICU and Pediatrics both appear in the queues.
  - Step 3: The page loads successfully with the `AdminSidebar` on the left. The admin can see and schedule shifts for all departments.
  - Step 4: The team member roster displays all workers and managers in the organization, and the admin can edit roles or department assignments.

#### Scenario 18.3: Org Admin Profile Dropdown Navigation
- **Pre-conditions**:
  1. Logged in as `org_admin`.
- **Steps**:
  1. Click on the profile avatar in the upper right header.
  2. Verify the displayName and user_role label.
  3. Click on "Profile Settings".
- **Expected Outcomes**:
  - Step 1: Dropdown menu opens smoothly.
  - Step 2: Display name matches the admin's full name (or email if name is empty). The role badge shows "org_admin" in uppercase.
  - Step 3: Navigates to `/admin/settings` (instead of `/settings` which is for general managers).

#### Scenario 18.4: Database Constraint Integrity (Relationship Queries)
- **Pre-conditions**:
  1. Logged in as `org_admin` or `manager`.
- **Steps**:
  1. Trigger a shift swap request and have it accepted by a worker.
  2. Approve the swap request.
  3. Open the Dashboard.
- **Expected Outcomes**:
  - Step 1: The swap request is successfully created and shows as pending.
  - Step 2: The approving manager/admin profile is successfully written to the database under the `approved_by` column.
  - Step 3: The KPI metrics cards (Fulfillment Rate, Cost Savings, Hours Saved) load instantly with updated numbers instead of falling back to 0. No database or schema relation errors are logged in the browser console.

---

## 19. INTEGRATION TESTING

### Functional Checklist
- [ ] **Cross-Feature Workflows**:
  - [ ] Admin creates shift → Worker claims → Manager approves (full flow).
  - [ ] Worker posts for swap → Another worker claims → Manager approves.
  - [ ] Multiple swaps in same department handled correctly.
- [ ] **API Integration**:
  - [ ] All endpoints return correct status codes.
  - [ ] All endpoints validate input.
  - [ ] All endpoints check authorization.

---

## 20. DEPLOYMENT & DEVOPS

### Functional Checklist
- [ ] **Environment Configuration**:
  - [ ] .env variables properly configured.
  - [ ] Database migrations run successfully.
  - [ ] Initial data seeded correctly.
- [ ] **Monitoring & Logging**:
  - [ ] Error logging in place.
  - [ ] Performance monitoring active.
  - [ ] Uptime monitoring configured.
- [ ] **Backup & Disaster Recovery**:
  - [ ] Automated backups enabled.
  - [ ] Backup integrity verified.

---

## 21. PRODUCTION READINESS

### Functional Checklist
- [ ] **Final Checks**:
  - [ ] No console errors in production build.
  - [ ] No console warnings in production build.
  - [ ] All error messages user-friendly.
- [ ] **Load Testing**:
  - [ ] Test with 100 concurrent users.
  - [ ] Ensure graceful degradation.
- [ ] **Smoke Testing (Post-Deploy)**:
  - [ ] Can login.
  - [ ] Can create shift.
  - [ ] Can post for swap.
  - [ ] Can approve swap.

---

## 22. USER ACCEPTANCE TESTING (UAT)

### Functional Checklist
- [ ] **Admin UAT**:
  - [ ] Super Admin: Verify multi-organization statistics dashboard displays accurate values.
  - [ ] Org Admin: Create shifts for multiple departments.
  - [ ] Org Admin: Approve 5 swaps across different departments.
- [ ] **Manager UAT**:
  - [ ] Create shifts for assigned departments.
  - [ ] View team performance.
  - [ ] Approve/reject swaps.
- [ ] **Worker UAT**:
  - [ ] Claim open shifts.
  - [ ] Post shift for swap.
  - [ ] Accept swap offers.
  - [ ] View schedule on mobile.

---

## 23. DOCUMENTATION

### Functional Checklist
- [ ] API documentation complete.
- [ ] Database schema documented.
- [ ] Deployment guide written.
- [ ] Troubleshooting guide available.

---

## 24. SIGN-OFF

**Testing Date:** _______________

**Tested By:** _______________

**Test Environment:** [ ] Development [ ] Staging [ ] Production

**Overall Status:** [ ] Pass [ ] Fail [ ] Conditional Pass

**Issues Found:** _______________

**Blockers Resolved:** [ ] Yes [ ] No

**Ready for Production:** [ ] Yes [ ] No [ ] Conditional

**Approval Signature:** _______________

**Date:** _______________

---

## NOTES & COMMENTS

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

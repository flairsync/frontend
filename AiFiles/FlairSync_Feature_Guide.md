# FlairSync — Complete Feature Guide

> **For Frontend Agents**: This document lists every feature in the platform with a plain-language explanation and step-by-step instructions. Use each section as the basis for one tutorial page. Keep the tone friendly and practical. Each page should show the steps exactly as listed here — do not merge sections into one page.

---

## How to Use This Document

Each section = one tutorial page.
- **What it is** — one-paragraph plain-English explanation
- **Who uses it** — the intended audience
- **Steps** — numbered, actionable, no jargon
- **Tips** — edge cases or gotchas worth surfacing to users

---

---

# PART 1 — GETTING STARTED

---

## 1.1 — Creating Your Account

**What it is**: Register and verify your identity so you can access the platform.

**Who uses it**: Anyone new to FlairSync.

**Steps**:
1. Click **Sign Up** on the login page.
2. Enter your full name, email address, and a strong password.
3. Click **Create Account**.
4. Open your inbox — you'll receive a 6-digit verification code.
5. Enter the code on the verification screen.
6. Your account is now active. You'll be taken to your dashboard.

**Tips**:
- The verification code expires in 10 minutes. Request a new one if it expires.
- You can also sign up via **Continue with Google** — no code needed.

---

## 1.2 — Logging In

**What it is**: Access your account with email/password or Google.

**Who uses it**: All users.

**Steps**:
1. Go to the login page and enter your email and password.
2. Click **Log In**.
3. If you have two-factor authentication enabled, enter the 6-digit code from your authenticator app.
4. You're in.

**Tips**:
- Sessions expire after 15 minutes of inactivity. You'll be automatically re-authenticated if your refresh token is valid.
- Click **Forgot Password** to receive a reset link by email.

---

## 1.3 — Resetting Your Password

**What it is**: Recover access to your account when you've forgotten your password.

**Who uses it**: Any user locked out of their account.

**Steps**:
1. On the login page, click **Forgot Password**.
2. Enter your registered email address and click **Send Reset Link**.
3. Open your inbox and click the link in the email.
4. Enter your new password twice to confirm.
5. Click **Reset Password** — you can now log in with the new password.

---

## 1.4 — Setting Up Two-Factor Authentication (2FA)

**What it is**: An extra layer of security that requires a time-based code from an authenticator app every time you log in.

**Who uses it**: Any user who wants stronger account security.

**Steps**:
1. Go to **Profile Settings → Security**.
2. Click **Enable Two-Factor Authentication**.
3. Open an authenticator app (Google Authenticator, Authy, or similar) on your phone.
4. Scan the QR code shown on screen.
5. Enter the 6-digit code shown in your app to confirm.
6. Save your backup codes somewhere safe — you'll need them if you lose your phone.
7. 2FA is now active. Future logins will ask for your authenticator code.

**Tips**:
- To turn off 2FA, go to **Profile Settings → Security → Disable 2FA** and enter a valid authenticator code.

---

## 1.5 — Updating Your Profile

**What it is**: Edit your name, profile picture, and personal details.

**Who uses it**: All users.

**Steps**:
1. Click your avatar in the top-right corner.
2. Select **Profile Settings**.
3. Update your name, email, or other information.
4. To change your profile picture, click **Upload Avatar** and choose an image file.
5. Click **Save Changes**.

---

## 1.6 — Managing Active Sessions

**What it is**: See every device currently logged into your account and revoke access from any of them.

**Who uses it**: Users concerned about account security.

**Steps**:
1. Go to **Profile Settings → Sessions**.
2. You'll see a list of active sessions with device info and location.
3. To sign out of a specific device, click **Revoke** next to it.
4. To sign out of all other devices, click **Revoke All Other Sessions**.

---

---

# PART 2 — BUSINESS SETUP

---

## 2.1 — Creating Your Business

**What it is**: Register your restaurant or venue on FlairSync so you can manage staff, menus, orders, and more.

**Who uses it**: Business owners onboarding for the first time.

**Steps**:
1. From your dashboard, click **Create a Business**.
2. Enter your business name and select a **Business Type** (e.g., Restaurant, Café, Bar).
3. Add your business address and country.
4. Click **Create Business**.
5. You'll be taken to your new business dashboard.

**Tips**:
- You can manage multiple businesses from one account — just repeat this process.
- Your subscription plan determines how many businesses you can create.

---

## 2.2 — Completing Your Business Profile

**What it is**: Add all the details guests and customers will see when they discover your business.

**Who uses it**: Business owners after initial setup.

**Steps**:
1. Go to **Business Settings → Profile**.
2. Upload your **Logo** (appears in search results and your public profile).
3. Add a short **Description** of your venue.
4. Select relevant **Tags** (e.g., Rooftop, Vegan, Live Music) — these help customers find you.
5. Set your **Price Range** ($ to $$$$).
6. Add a **Phone Number** and **Website** if you have one.
7. Upload **Gallery Photos** to showcase your space (up to your plan limit).
8. Click **Save**.

---

## 2.3 — Setting Opening Hours

**What it is**: Define when your business is open so the system can manage reservations and show accurate hours to customers.

**Who uses it**: Business owners.

**Steps**:
1. Go to **Business Settings → Opening Hours**.
2. For each day of the week, toggle it **On** if you're open that day.
3. Set the **Opening Time** and **Closing Time**.
4. If you're closed on a particular day, leave the toggle off.
5. Click **Save Hours**.

**Tips**:
- You can set different hours for public holidays separately.

---

## 2.4 — Setting Up Tax Rates

**What it is**: Configure the tax rates that apply to orders at your business.

**Who uses it**: Business owners responsible for billing.

**Steps**:
1. Go to **Business Settings → Taxes**.
2. Click **Add Tax Group** and give it a name (e.g., "Standard VAT").
3. Enter the tax **Percentage** (e.g., 20 for 20%).
4. Assign the tax group to applicable menu items later in Menu Settings.
5. Click **Save**.

---

---

# PART 3 — STAFF MANAGEMENT

---

## 3.1 — Inviting Staff Members

**What it is**: Send email invitations to employees so they can join your business on FlairSync.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Staff → Invitations**.
2. Click **Invite Staff Member**.
3. Enter the staff member's **email address**.
4. Select the **role** they'll have (e.g., Waiter, Kitchen Staff, Manager).
5. Click **Send Invitation**.
6. The staff member will receive an email with a link to accept the invitation and create or link their account.

**Tips**:
- You can resend or cancel invitations from the Invitations list.
- The invitation link expires after 7 days.

---

## 3.2 — Creating and Managing Roles

**What it is**: Define custom job roles (e.g., "Head Chef", "Shift Manager") and control exactly what each role can see and do in the system.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Staff → Roles**.
2. Click **Create Role**.
3. Give the role a name and optional description.
4. Click **Create**.
5. Now click **Edit Permissions** on the new role.
6. Toggle on the permissions this role needs (e.g., View Orders, Manage Reservations, View Inventory).
7. Click **Save Permissions**.

**Tips**:
- Changes to a role's permissions take effect immediately for all staff with that role.
- One staff member can have multiple roles — their permissions are the union of all their roles.

---

## 3.3 — Managing Employee Details

**What it is**: View your full staff list, update employment details, set hourly rates, and manage each person's access.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Staff → Employees**.
2. Click on any staff member to open their employment profile.
3. To update their **role**, click **Edit Role** and select a new one.
4. To set their **hourly rate** (used for payroll), click **Edit Rate** and enter the value.
5. To set a **POS PIN** for tablet login, click **Set PIN** and enter a 4-6 digit number.
6. To remove someone from the business, click **End Employment** at the bottom of their profile.

---

## 3.4 — Organizing Staff into Teams

**What it is**: Group employees into teams like "Kitchen", "Front of House", or "Bar" so you can manage and schedule them together.

**Who uses it**: Managers in larger venues.

**Steps**:
1. Go to **Staff → Teams**.
2. Click **Create Team** and give it a name.
3. Open the team and click **Add Members**.
4. Select the employees you want to add to this team.
5. Click **Save**.

**Tips**:
- Teams make bulk shift creation much faster — you can create a shift for an entire team at once.

---

---

# PART 4 — SCHEDULING & SHIFTS

---

## 4.1 — Creating a Shift for One Employee

**What it is**: Schedule a work shift for a specific employee on a specific date.

**Who uses it**: Managers.

**Steps**:
1. Go to **Scheduling → Schedule**.
2. Click **Add Shift** or click directly on a day in the calendar.
3. Select the **employee**.
4. Set the **start time** and **end time**.
5. Optionally select a **shift template** if you have recurring patterns saved.
6. Click **Save Shift**.
7. The employee will receive a notification about their new shift.

---

## 4.2 — Creating Shifts for a Team

**What it is**: Create the same shift for all members of a team at once — great for setting weekly rosters quickly.

**Who uses it**: Managers.

**Steps**:
1. Go to **Scheduling → Schedule**.
2. Click **Bulk Create → Team Shift**.
3. Select the **team** you want to schedule.
4. Set the **date, start time, and end time**.
5. Click **Create Shifts** — one shift will be created for every active member of the team.

---

## 4.3 — Generating a Weekly Schedule Draft

**What it is**: Automatically generate a draft weekly schedule based on staff availability and templates, which managers can review and adjust before publishing.

**Who uses it**: Managers.

**Steps**:
1. Go to **Scheduling → Schedule**.
2. Click **Generate Weekly Draft**.
3. Select the week you want to schedule.
4. The system will create draft shifts (shown in a "Draft" state).
5. Review the draft — adjust any shifts by clicking on them.
6. When satisfied, click **Publish Schedule**.
7. All staff on the schedule will be notified.

---

## 4.4 — Managing Shift Swaps

**What it is**: Allows staff to request swapping a shift with a colleague. Managers review and approve or deny the request.

**Who uses it**: Staff (request) and Managers (approve).

**Steps — Staff requesting a swap**:
1. Go to **My Schedule**.
2. Click on the shift you want to swap.
3. Click **Request Swap** and select a colleague to swap with.
4. Submit the request.

**Steps — Manager approving a swap**:
1. Go to **Scheduling → Swap Requests**.
2. Review the pending request and the two employees involved.
3. Click **Approve** or **Deny**.
4. Both employees are notified of the decision.

---

## 4.5 — Shift Bidding (Open Shifts)

**What it is**: Post an open (uncovered) shift and let staff bid to take it. Managers pick who gets it.

**Who uses it**: Managers and staff.

**Steps — Posting an open shift**:
1. Create a shift without assigning it to an employee (leave the employee field blank or mark it as "Open").
2. The shift appears in the **Open Shifts** board visible to all eligible staff.

**Steps — Staff bidding**:
1. Go to **My Schedule → Open Shifts**.
2. Click on an available shift and click **Place Bid**.

**Steps — Manager selecting a bid**:
1. Go to **Scheduling → Open Shifts**.
2. Open the shift and review all bids.
3. Click **Accept Bid** next to the employee you want to assign.

---

## 4.6 — Managing Time-Off Requests

**What it is**: Staff can request days off. Managers review and approve or reject requests.

**Who uses it**: Staff (request) and Managers (approve).

**Steps — Staff submitting time-off**:
1. Go to **My Schedule → Time Off**.
2. Click **Request Time Off**.
3. Select the **date range** and enter a **reason** (optional).
4. Submit the request.

**Steps — Manager reviewing requests**:
1. Go to **Scheduling → Time-Off Requests**.
2. Review each pending request.
3. Click **Approve** or **Reject**, optionally leaving a note.
4. The staff member is notified.

---

## 4.7 — Setting Staff Availability

**What it is**: Staff can declare which days and hours they're generally available so managers can schedule them appropriately.

**Who uses it**: Staff.

**Steps**:
1. Go to **My Profile → Availability**.
2. For each day of the week, set the hours you're available.
3. Toggle off days you're never available.
4. Click **Save Availability**.

---

---

# PART 5 — ATTENDANCE & PAYROLL

---

## 5.1 — Clocking In and Out

**What it is**: Track when staff start and end their work. Can be done via the web app or a POS station tablet.

**Who uses it**: All staff.

**Steps**:
1. At the start of your shift, go to **Attendance** or use the POS station.
2. Click **Clock In** — your start time is recorded.
3. To take a break, click **Start Break**.
4. Click **End Break** when returning.
5. At the end of your shift, click **Clock Out**.

---

## 5.2 — Recording Absences

**What it is**: Managers can log when an employee is absent (sick day, unpaid leave, etc.) to keep attendance records accurate.

**Who uses it**: Managers.

**Steps**:
1. Go to **Attendance → Absences**.
2. Click **Record Absence**.
3. Select the employee and the date.
4. Choose the absence type (Sick, Unpaid Leave, Other).
5. Add a note if needed and click **Save**.

---

## 5.3 — Generating Payroll

**What it is**: Automatically calculate what each employee is owed for a given period based on their attendance and hourly rate.

**Who uses it**: Business owners and managers.

**Steps**:
1. Make sure all employees have an **hourly rate** set (Staff → Employees → Edit Rate).
2. Go to **Payroll**.
3. Select the **pay period** (e.g., June 2026).
4. Click **Generate Payroll**.
5. Review the breakdown — hours worked × hourly rate per employee.
6. Click **Export to CSV** to download the report for your accounting software.

---

---

# PART 6 — MENU MANAGEMENT

---

## 6.1 — Creating a Menu

**What it is**: Set up a menu (e.g., "Lunch Menu", "Dinner Menu", "Drinks") that will contain your categories and items.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Menu**.
2. Click **Create Menu**.
3. Enter a menu name and optional description.
4. Click **Create**.

---

## 6.2 — Adding Categories and Items

**What it is**: Organize your menu by grouping items into categories (e.g., Starters, Mains, Desserts) and adding the items within each.

**Who uses it**: Business owners and managers.

**Steps — Add a category**:
1. Open your menu and click **Add Category**.
2. Enter the category name (e.g., "Starters") and click **Save**.

**Steps — Add an item**:
1. Click on a category to expand it, then click **Add Item**.
2. Enter the item **name**, **description**, **price**, and upload an **image**.
3. Set **dietary info** (vegan, gluten-free, etc.) and **allergens**.
4. Click **Save Item**.

---

## 6.3 — Adding Variants and Modifiers

**What it is**: Variants let you offer the same dish in different sizes or styles (e.g., Small / Large). Modifiers let customers customize an item (e.g., add toppings, choose a sauce).

**Who uses it**: Business owners and managers.

**Steps — Add variants (e.g., sizes)**:
1. Open a menu item and go to **Variants**.
2. Click **Add Variant** and enter a name (e.g., "Large") and its price.
3. Repeat for each variant.

**Steps — Add a modifier group (e.g., "Choose your sauce")**:
1. Open a menu item and go to **Modifiers**.
2. Click **Add Modifier Group** and give it a name.
3. Set whether it's **required** or optional, and the min/max selections.
4. Click **Add Option** within the group and enter each choice with its price (0 if free).

---

## 6.4 — Scheduling a Menu

**What it is**: Automatically activate or deactivate a menu on specific dates, times, or days of the week — perfect for lunch specials or seasonal menus.

**Who uses it**: Business owners and managers.

**Steps**:
1. Open a menu and click **Schedule**.
2. Set an **active from** date/time and an **active until** date/time, or choose specific days of the week.
3. Click **Save Schedule**.
4. The menu will automatically go live and expire at the set times.

---

---

# PART 7 — FLOOR PLAN & TABLES

---

## 7.1 — Setting Up Your Floor Plan

**What it is**: Create a visual map of your venue's floors and tables so you can assign orders and reservations to specific tables.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Floor Plan**.
2. Click **Add Floor** and give it a name (e.g., "Ground Floor", "Terrace").
3. On the floor, click **Add Table**.
4. Set the table **number or name**, **capacity** (number of seats), and its **position** on the map.
5. Repeat for all tables.
6. Click **Save**.

**Tips**:
- Use **Add Multiple Tables** to create several tables at once with sequential numbering.

---

## 7.2 — Viewing Table Status

**What it is**: See in real time which tables are occupied, available, or reserved.

**Who uses it**: Hosts, servers, managers.

**Steps**:
1. Go to **Floor Plan** or the **Tables** view on the POS station.
2. Tables are color-coded: green = available, red = occupied, yellow = reserved.
3. Click on any table to see who's seated, the active order, or the upcoming reservation.

---

---

# PART 8 — ORDERS

---

## 8.1 — Creating an Order

**What it is**: Open a new order for a table or for takeaway/delivery.

**Who uses it**: Servers and POS staff.

**Steps**:
1. Go to **Orders** or use the POS station.
2. Click **New Order**.
3. Select the **order type**: Dine-in, Takeaway, or Delivery.
4. For dine-in, select the **table**.
5. Browse the menu and click items to add them.
6. For items with variants or modifiers, make the required selections in the pop-up.
7. Adjust **quantities** as needed.
8. Click **Send Order** — the order is sent to the kitchen.

---

## 8.2 — Managing an Order's Lifecycle

**What it is**: Track an order from placement through to completion, moving it through the correct stages.

**Who uses it**: Kitchen staff, servers, managers.

**Steps**:
1. When a new order comes in, it appears as **Pending**.
2. Click **Accept** to confirm the kitchen received it (status → Accepted).
3. When cooking starts, click **Preparing** (status → Preparing).
4. When the food is ready to serve, click **Ready** (status → Ready).
5. After delivering to the customer, click **Complete** (status → Completed).

**Tips**:
- You can **cancel** an order at any stage before completion. Add a reason when prompted.

---

## 8.3 — Taking Payment

**What it is**: Record payment for an order once the customer is ready to pay.

**Who uses it**: Servers and cashiers.

**Steps**:
1. Open the completed or active order and click **Take Payment**.
2. Select the **payment method** (Cash, Card, etc.).
3. Enter the **amount received**.
4. If splitting the bill, click **Split Bill** first and divide the amount between guests.
5. Click **Confirm Payment**.
6. The order is now marked as Paid.

---

## 8.4 — Issuing a Refund

**What it is**: Process a full or partial refund on a payment that has already been recorded.

**Who uses it**: Managers and cashiers.

**Steps**:
1. Open the order and go to the **Payments** tab.
2. Find the payment you want to refund and click **Refund**.
3. Enter the refund amount (full or partial).
4. Add a reason for the refund.
5. Click **Confirm Refund**.

---

---

# PART 9 — KITCHEN DISPLAY SYSTEM (KDS)

---

## 9.1 — Setting Up Kitchen Stations

**What it is**: Define different kitchen stations (e.g., Grill, Cold Prep, Pastry) and assign menu categories to them so the right orders show up on the right screen.

**Who uses it**: Managers.

**Steps**:
1. Go to **Kitchen → Stations**.
2. Click **Add Station** and give it a name (e.g., "Grill Station").
3. Select which **menu categories** should appear on this station (e.g., "Mains", "Burgers").
4. Click **Save**.
5. Set up a tablet or screen at that station and connect it to the station display.

---

## 9.2 — Using the Kitchen Display

**What it is**: The real-time view that kitchen staff use to see incoming orders for their station.

**Who uses it**: Kitchen staff.

**Steps**:
1. Open the KDS view on the kitchen screen.
2. New orders appear automatically in a queue.
3. Click an order to see its full details (items, modifiers, notes).
4. Click **Mark Ready** when the food for that order is prepared.
5. The server is notified that the order is ready for pickup.

---

---

# PART 10 — RESERVATIONS

---

## 10.1 — Creating a Reservation

**What it is**: Book a table for a future date and time for a guest.

**Who uses it**: Front-of-house staff, hosts.

**Steps**:
1. Go to **Reservations**.
2. Click **New Reservation**.
3. Enter the **guest name**, **phone number or email**, and **party size**.
4. Select the **date** and **time**.
5. The system will show available tables — select one.
6. Add any **special notes** (e.g., "Birthday cake", "Wheelchair accessible table needed").
7. Click **Confirm Reservation**.
8. The guest will receive a confirmation.

---

## 10.2 — Managing the Reservation Lifecycle

**What it is**: Track a reservation from booking through to the guest leaving.

**Who uses it**: Hosts and front-of-house staff.

**Steps**:
1. A new reservation starts as **Pending**.
2. Confirm it by clicking **Confirm** (status → Confirmed).
3. When the guest arrives, click **Check In** (status → Checked In).
4. After the visit, click **Complete** (status → Completed).
5. If the guest doesn't show, click **No Show**.
6. To cancel, click **Cancel** and provide a reason.

---

## 10.3 — Walk-In Reservations

**What it is**: Quickly seat a guest who arrived without a prior booking.

**Who uses it**: Hosts.

**Steps**:
1. Go to **Reservations** and click **Walk-In**.
2. Select an **available table** that fits the party size.
3. Enter the guest count (name is optional for walk-ins).
4. Click **Seat Now** — the table is immediately marked occupied.

---

## 10.4 — Checking Availability

**What it is**: See which tables are available for a given date, time, and party size before confirming a booking.

**Who uses it**: Hosts and staff taking phone bookings.

**Steps**:
1. Go to **Reservations → Check Availability**.
2. Enter the **date**, **time**, and **guest count**.
3. The system shows a list of available tables with their capacity.
4. Select one to pre-fill a new reservation form.

---

---

# PART 11 — INVENTORY MANAGEMENT

---

## 11.1 — Adding Inventory Items

**What it is**: Create a record for each ingredient or supply item you want to track (e.g., Tomatoes, Olive Oil, Napkins).

**Who uses it**: Managers and kitchen leads.

**Steps**:
1. Go to **Inventory**.
2. Click **Add Item**.
3. Enter the item **name**, **unit** (kg, liters, pieces, etc.), and **current stock quantity**.
4. Set a **reorder level** — when stock drops below this, you'll get a low-stock alert.
5. Optionally assign it to a **group** (e.g., Produce, Beverages, Dry Goods).
6. Click **Save**.

---

## 11.2 — Adjusting Stock Levels

**What it is**: Record stock changes when deliveries arrive, ingredients are used, or items are wasted.

**Who uses it**: Kitchen staff and managers.

**Steps**:
1. Go to **Inventory** and find the item.
2. Click **Adjust Stock**.
3. Select the movement type: **Add** (delivery received), **Deduct** (manual use), or **Waste** (spoilage).
4. Enter the quantity and a note.
5. Click **Save** — the movement is recorded in the item's history log.

---

## 11.3 — Linking Recipes to Menu Items

**What it is**: Connect a menu item to its ingredients so that every time the item is ordered and completed, the system automatically deducts the right amounts from inventory.

**Who uses it**: Managers and kitchen leads.

**Steps**:
1. Go to **Inventory → Recipes** or open a menu item and click **Recipe**.
2. Click **Add Ingredient**.
3. Select the inventory item and enter the quantity used per serving (e.g., 0.2 kg of tomatoes).
4. Repeat for all ingredients in the dish.
5. Click **Save Recipe**.

**Tips**:
- Once a recipe is set up, completing an order will automatically deduct all linked ingredients from stock.

---

## 11.4 — Viewing Stock Movement History

**What it is**: See a full log of every stock change for any inventory item.

**Who uses it**: Managers.

**Steps**:
1. Go to **Inventory** and click on any item.
2. Scroll to the **Movement History** tab.
3. You'll see every addition, deduction, and waste event with the date, quantity, and who made the change.

---

---

# PART 12 — NOTIFICATIONS

---

## 12.1 — Managing Your Notifications

**What it is**: View and manage your in-app notifications for things like new orders, reservation changes, shift assignments, and low-stock alerts.

**Who uses it**: All users.

**Steps**:
1. Click the **bell icon** in the top navigation bar.
2. A list of your recent notifications appears.
3. Click on any notification to go to the relevant section.
4. Click **Mark as Read** on individual notifications or **Mark All as Read** to clear them all.

---

## 12.2 — Notification Preferences

**What it is**: Control which types of notifications you receive so your feed stays relevant.

**Who uses it**: All users.

**Steps**:
1. Go to **Profile Settings → Notifications**.
2. Toggle each notification type on or off (e.g., Order Updates, Shift Reminders, Low Stock Alerts).
3. Changes save automatically.

---

---

# PART 13 — ANALYTICS

---

## 13.1 — Viewing Your Sales Dashboard

**What it is**: An overview of your business performance — revenue, order counts, top-selling items, and trends over time.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Analytics**.
2. Select your **date range** (e.g., last 7 days, last month, or a custom range).
3. View the key metrics:
   - **Total Sales** for the period
   - **Order count** broken down by type (dine-in, takeaway, delivery)
   - **Top Selling Items** ranked by revenue
   - **Daily Sales Chart** showing trends over the period
4. Use the **Staff Performance** tab to see individual performance metrics.

---

---

# PART 14 — POS STATION

---

## 14.1 — Setting Up a POS Station (Tablet)

**What it is**: Link a tablet or terminal device to your FlairSync account so staff can take orders, process payments, and clock in from it.

**Who uses it**: Managers setting up hardware.

**Steps**:
1. Go to **Settings → POS Stations**.
2. Click **Add Station** and give it a name (e.g., "Bar Terminal", "Table 1 iPad").
3. Click **Generate Pairing Code** — a short code appears.
4. On the tablet, open FlairSync POS and enter the pairing code.
5. The station is now linked. It will use a secure long-lived token for authentication.

---

## 14.2 — Staff Login on the POS Station

**What it is**: Staff use a short PIN instead of a password to quickly log into the POS station at the start of their shift.

**Who uses it**: All floor and kitchen staff.

**Steps**:
1. On the POS station, tap **Staff Login**.
2. Enter your **4-6 digit PIN** (set by your manager in your employment profile).
3. You're now logged in and can take orders, clock in, and more.

**Tips**:
- If you don't have a PIN yet, ask your manager to set one from **Staff → Employees → Set PIN**.

---

---

# PART 15 — GUEST DISCOVERY & BOOKING (Customer-Facing)

---

## 15.1 — Finding a Restaurant (As a Customer)

**What it is**: Browse restaurants on the FlairSync platform, filter by type, location, and preferences, and find somewhere to eat.

**Who uses it**: Customers / end users.

**Steps**:
1. Go to the **Discover** page.
2. Use the **search bar** to search by name or keyword.
3. Filter by **cuisine type**, **price range**, **tags** (e.g., Outdoor, Vegan), or **rating**.
4. Enable **Near Me** to show restaurants close to your current location.
5. Click on any restaurant to view its full profile, menu, and available times.

---

## 15.2 — Making a Reservation (As a Customer)

**What it is**: Book a table at a restaurant directly through the platform.

**Who uses it**: Customers.

**Steps**:
1. Open a restaurant's profile and click **Reserve a Table**.
2. Select the **date**, **time**, and **number of guests**.
3. Available time slots will appear — pick one.
4. Enter your **name**, **phone**, and any **special requests**.
5. If you have an account, log in — otherwise you can book as a guest.
6. Click **Confirm Reservation**.
7. You'll receive a confirmation by email or SMS.

---

## 15.3 — Placing a Takeaway or Delivery Order (As a Customer)

**What it is**: Order food online from a restaurant and choose to pick it up or have it delivered.

**Who uses it**: Customers.

**Steps**:
1. Open a restaurant's profile and click **Order Now**.
2. Select **Takeaway** or **Delivery**.
3. Browse the menu and add items to your cart.
4. Customize items with variants and modifiers as needed.
5. Review your cart and click **Place Order**.
6. You'll receive confirmation and can track the order status.

---

## 15.4 — Writing a Review

**What it is**: Rate and review a restaurant after a visit to share your experience.

**Who uses it**: Customers.

**Steps**:
1. Open the restaurant's profile or find it in **My Orders** history.
2. Click **Write a Review**.
3. Select a star rating (1-5).
4. Write your review in the text box.
5. Click **Submit Review**.

---

---

# PART 16 — SUBSCRIPTIONS & BILLING

---

## 16.1 — Choosing a Subscription Plan

**What it is**: Select the FlairSync plan that fits your business size and unlock the corresponding features and limits.

**Who uses it**: Business owners.

**Steps**:
1. Go to **Settings → Subscription**.
2. View the available plans and their features (staff limits, menu limits, table limits, etc.).
3. Click **Choose Plan** on the one that fits your needs.
4. You'll be redirected to the secure billing page to enter your payment details.
5. After payment, your plan is activated immediately.

---

## 16.2 — Managing Your Billing

**What it is**: View your current plan, download invoices, and update payment details.

**Who uses it**: Business owners.

**Steps**:
1. Go to **Settings → Subscription → Billing**.
2. View your current plan and next billing date.
3. To download an invoice, click **Invoices** and then **Download** next to any invoice.
4. To update payment details or cancel, click **Manage Billing** — this opens a secure billing portal.

---

---

# PART 17 — TASKS

---

## 17.1 — Creating and Assigning Tasks

**What it is**: Create tasks for staff to complete (e.g., "Clean walk-in fridge", "Restock napkin dispensers") and assign them to specific employees.

**Who uses it**: Managers.

**Steps**:
1. Go to **Tasks**.
2. Click **Create Task**.
3. Enter a **task name** and optional description.
4. Set a **due date** if applicable.
5. Assign it to an **employee**.
6. Click **Create** — the assigned employee is notified.

---

## 17.2 — Completing a Task

**What it is**: Staff update task status as they work through their list.

**Who uses it**: Staff.

**Steps**:
1. Go to **Tasks → My Tasks**.
2. Click on a task to open it.
3. Click **Mark In Progress** when you start.
4. Click **Mark Complete** when you're done.
5. The manager is notified.

---

---

# PART 18 — JOBS & RECRUITMENT

---

## 18.1 — Posting a Job Opening

**What it is**: List a position at your restaurant so job seekers can find it and apply through the platform.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Jobs → My Postings**.
2. Click **Post a Job**.
3. Enter the **job title**, **description**, **requirements**, and **type** (Full-time, Part-time, etc.).
4. Click **Publish** — the listing goes live on the public job board.

---

## 18.2 — Reviewing Applications

**What it is**: View applications from candidates and move them through the hiring stages.

**Who uses it**: Managers.

**Steps**:
1. Go to **Jobs → My Postings** and open the relevant job.
2. Click **View Applications**.
3. For each applicant, you can view their profile, resume, and cover note.
4. Move them through stages: **Screening → Interview → Hired** or **Rejected**.
5. The applicant is notified of each status change.

---

## 18.3 — Applying for a Job (As a Job Seeker)

**What it is**: Browse open restaurant positions and submit your application.

**Who uses it**: Job seekers.

**Steps**:
1. Go to the **Job Board** from the public discovery page.
2. Filter by location, role type, or restaurant.
3. Click on a listing to read the full description.
4. Click **Apply Now**.
5. Upload your **resume** (PDF) or enter a link.
6. Add a cover note (optional).
7. Click **Submit Application**.
8. Track the status of your application from **My Applications**.

---

---

# PART 19 — MARKETPLACE

---

## 19.1 — Browsing the Marketplace

**What it is**: A shared space where businesses can list and discover menu items, templates, or resources to exchange with other restaurants on the platform.

**Who uses it**: Business owners and managers.

**Steps**:
1. Go to **Marketplace**.
2. Browse all listings or use the search bar to find something specific.
3. Click on any listing to see its full details.
4. Contact the listing owner or request/claim the item.

---

## 19.2 — Creating a Marketplace Listing

**What it is**: Share something from your business with other restaurants on the platform.

**Who uses it**: Business owners.

**Steps**:
1. Go to **Marketplace** and click **Create Listing**.
2. Enter a **title**, **description**, and any relevant details.
3. Add an image if applicable.
4. Click **Publish**.

---

---

# PART 20 — SUPPORT

---

## 20.1 — Contacting Support

**What it is**: Submit a request to the FlairSync support team if you're experiencing issues or have questions.

**Who uses it**: All users.

**Steps**:
1. Go to **Help → Contact Support** or click the **?** icon.
2. Select a **category** that best describes your issue.
3. Write a description of what you need help with.
4. Click **Send** — you'll receive a confirmation email and hear back from the team.

---

---

# PART 21 — ACCOUNT & PRIVACY

---

## 21.1 — Exporting Your Data

**What it is**: Download a copy of all your personal data held on FlairSync (GDPR right of access).

**Who uses it**: Any user.

**Steps**:
1. Go to **Profile Settings → Privacy**.
2. Click **Export My Data**.
3. A job is queued — you'll receive an email with a download link when it's ready (usually within a few minutes).

---

## 21.2 — Deleting Your Account

**What it is**: Permanently remove your account and all associated data from the platform. There is a 30-day grace period before deletion is finalized.

**Who uses it**: Any user who wishes to leave the platform.

**Steps**:
1. Go to **Profile Settings → Privacy**.
2. Click **Delete My Account**.
3. Read the confirmation warning carefully.
4. Type your password to confirm.
5. Click **Schedule Deletion**.
6. Your account enters a 30-day grace period — you can log back in and click **Cancel Deletion** during this time.
7. After 30 days, your account and all data are permanently removed.

**Tips**:
- If you're a business owner, make sure to hand off ownership before deleting your account.

---

---

*End of FlairSync Feature Guide — v1.0 (2026-06-11)*

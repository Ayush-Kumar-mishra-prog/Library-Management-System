# Library Management 

## Implemented Roles
- Admin
- Member (Library staff)
- Student

## It is create by Ayush kumar mishra.

## Core Features Included
- JWT login for username/email + password
- Student signup
- Admin creates members
- Admin adds books with complete fields
- Member issues/returns books
- Late penalty: Rs 5 per day
- Member sends missing-book request to admin
- Student sees issued books and book info
- Student sends reissue request
- Member approves reissue request

## Backend Setup (XAMPP)
1. Start Apache and MySQL in XAMPP.
2. Create DB and tables:
   - Open phpMyAdmin
   - Import `backend/schema.sql`
3. Update `backend/config.php` if DB credentials differ.
4. API base path used by frontend:
   - `http://localhost/Library%20Management/backend/index.php`

Default admin login:
- username: `ayush`
- password: `ayush123`

## Frontend Setup
1. Open terminal in `frontend`.
2. Install packages:
   - `npm install`
3. Run dev server:
   - `npm run dev`
4. Open Vite URL shown in terminal (usually `http://localhost:5173`).

## Important Note
- `backend/config.php` has a placeholder JWT secret. Replace it with a long random key before production.
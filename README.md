# JobConnect — Full Stack Job Portal Platform

JobConnect is a full-featured, secure, and modern role-based Job Portal application. It allows candidates to search, apply for, and track jobs, recruiters to list vacancies and evaluate applicant details, and administrators to approve new companies, moderate accounts, and review metrics.

---

## 🛠 Technology Stack

### Backend
- **Framework:** Java 17+ (Spring Boot 3.2.5)
- **Security:** Spring Security, JWT (JSON Web Tokens), BCrypt Hashing
- **Data Access:** Spring Data JPA, Hibernate ORM
- **Database:** MySQL
- **API Documentation:** Swagger UI (Springdoc OpenAPI v3)
- **Notification:** JavaMailSender (with console logging fallback)

### Frontend
- **Framework:** React.js 18 (TypeScript, Vite 5)
- **Styling:** Tailwind CSS v3 (Premium aesthetics, custom theme, glassmorphism)
- **Icons:** Lucide React
- **HTTP Client:** Axios (automatic interceptors injecting Bearer tokens)
- **Routing:** React Router DOM v6

---

## 💾 Database Configuration

The application connects to a MySQL database named `jobconnect_db`. 

During first launch, Spring Boot's JPA configuration (`spring.jpa.hibernate.ddl-auto=update`) automatically creates all normalized tables:
- `users` (Account management, status, roles)
- `candidate_profiles` (Skills, experience, education, resume path)
- `employer_profiles` (Company name, description, website, logo path)
- `jobs` (Listing title, category, type, salary, skills, status)
- `applications` (Candidate mapping, status, resume snapshot, recruiter feedback)
- `saved_jobs` (Bookmarks list)
- `notifications` (In-app alert feeds)

---

## 🚀 Getting Started

Ensure you have **Java 17 or higher**, **Apache Maven**, and **Node.js (v20.x or higher)** installed.

### ⚡ Quick Start (PowerShell)

You can run both applications immediately using the helper scripts in the root folder:

* **To start the Backend:**
  Open a PowerShell terminal in the root folder and run:
  ```powershell
  .\run-backend.ps1
  ```
* **To start the Frontend:**
  Open a separate PowerShell terminal in the root folder and run:
  ```powershell
  .\run-frontend.ps1
  ```

---

### 🛠 Manual Startup

If you prefer to navigate and run commands manually, perform these steps:

#### 1. Run the Backend (Spring Boot)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Configure database credentials in `backend/src/main/resources/application.properties` (preconfigured for username `root` and password `1234`):
   ```properties
   spring.datasource.username=root
   spring.datasource.password=1234
   ```
3. Run the compiled JAR file directly (recommended, since your system's default `java` resolves to Java 21):
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   *(Optional)* If you modify backend source code and need to rebuild:
   * Set Java 21 path:
     * **PowerShell:** `$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"`
     * **CMD:** `set JAVA_HOME=C:\Program Files\Java\jdk-21`
   * Recompile and build the JAR:
     ```bash
     mvn clean package -DskipTests
     ```
   The backend will start on **`http://localhost:8080`**. On first start, the database seeder runs automatically and populates sample records.


### 2. Run the Frontend (React Vite)

1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   The frontend will start on **`http://localhost:5173`** (or next available port). Open this URL in your web browser.

---

## 🔐 Seeded Accounts (For Testing)

The database seeder pre-populates the database with default accounts. You can log in directly using the following credentials:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@jobconnect.com` | `admin123` | Moderate users, approve employers, view analytics dashboard. |
| **Employer (Active)** | `alice@techcorp.com` | `emp123` | Posts jobs, views applicants, shortlists/rejects candidates. |
| **Employer (Pending)** | `charlie@finsec.com` | `emp123` | Pending account. Admin must approve from dashboard to log in. |
| **Job Seeker** | `john@gmail.com` | `seeker123` | Has 3 years Java experience, resume preloaded, has Applied to Java position. |
| **Job Seeker** | `emma@gmail.com` | `seeker123` | React frontend expert, status: Shortlisted. |
| **Job Seeker** | `david@gmail.com` | `seeker123` | Data Science seeker. |
| **Job Seeker** | `sophia@gmail.com` | `seeker123` | SEO Specialist, status: Rejected (no AdWords cert). |

---

## 📌 Features Walkthrough

### 🔎 Job Seeker Workflow
1. Register/Login as a **Job Seeker**.
2. Go to **My Profile**, edit skills/experience, and upload a resume (PDF).
3. Browse and search jobs on **Find Jobs**, applying filters (salary, job type, location).
4. Click a job card to view descriptions. Bookmark the job or apply (choosing to use your profile resume or upload a custom PDF file for that application).
5. Monitor responses under **My Applications** and inspect recruiter feedback messages.

### 🏢 Employer Workflow
1. Register as an **Employer** (which marks the account as pending admin approval).
2. Log in as **Admin** and click **Pending Approvals** to approve the employer account.
3. Log in as the approved **Employer**.
4. Go to **Post a Job** to create new vacancy listings.
5. In **Dashboard**, see statistics and list of posts. Click **View Applicants** for a job.
6. Click **Candidate Info** to slide out their profile details, download their resume, and click status buttons to **Shortlist**, **Reject**, or **Hire** them with custom comments (which triggers a notification email log).

### 🛡 Admin Workflow
1. Log in as **Admin**.
2. In **Overview Stats**, view platform metrics.
3. In **Pending Approvals**, approve new companies.
4. In **Manage Accounts**, activate/deactivate job seeker or recruiter accounts.
5. In **Moderate Jobs**, flag or deactivate job postings across the portal.

---

## 📘 API Documentation (Swagger)

While the backend application is running, you can test and inspect REST API endpoints by visiting:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **JSON API Docs:** `http://localhost:8080/v3/api-docs`

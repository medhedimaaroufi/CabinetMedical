# CabinetMedical
CabinetMedical is the front-end component of the CABINEMEDICAL application, a medical management system built with Ionic and Angular. It provides a responsive, mobile-friendly interface for patients, doctors, and admins to interact with the system, including user authentication, medical document uploads, and patient management. The backend is hosted on Render at Backend-CabinetMedical.

## Features
- User Authentication: Secure registration and login for patients, doctors, and admins, integrated with the backend's JWT-based authentication.
- Medical Document Uploads: Allows patients to upload their medical documents (PDF, JPEG, PNG) and doctors/admins to upload for any patient, with role-based access control.
- Role-Based Navigation: Guards ensure users can only access authorized routes (e.g., patients can't access doctor dashboards).
- Patient Management: Doctors and admins can view a list of patients and manage their documents.
- Responsive Design: Built with Ionic for a seamless experience on both mobile and desktop devices.

## Tech Stack
- Framework: Ionic 8 with Angular 19
- Language: TypeScript
- HTTP Client: Angular HttpClient for API calls
- State Management: Local storage for user data (e.g., JWT token, role)
- Styling: SCSS with Ionic components
- Dependencies: ngx-cookie-service for token management, jwt-decode for token parsing

## Prerequisites
Before setting up the project, ensure you have the following installed:
- Node.js 18.x or higher
- npm 9.x or higher
- Ionic CLI: npm install -g @ionic/cli
- Git
- A running backend instance (Backend-CabinetMedical deployed on Render)

- Installation
Follow these steps to set up the frontend locally:
```
Clone the Repository:
git clone https://github.com/your-username/CabinetMedical.git
cd CabinetMedical
```

- Install Dependencies:
```
npm install
```

- Set Up Environment Variables: Create an environment.ts file in src/environments/ (if not already present) and add the backend URL:
```
export const environment = {
production: false,
backendUrl: 'https://backend-cabinetmedical.onrender.com' // Replace with your Render backend URL
};
```

- Run the Application:
```
ionic serve
```
- The app will start at http://localhost:4200.

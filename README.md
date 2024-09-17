# PersonalFinancePro
Personal Finance Pro, or PFPro, is a fullstack personal finance management application uniquely crafted to fulfill the specific features and control I desired in a finance app that I couldn’t find in existing applications. Designed to streamline the management of budgets, expenses, savings, recurring charges, and financial events, PFPro combines these elements into one intuitive platform, giving users the tailored experience I envisioned for personal finance management. This project was developed over the period of a month, serving as a practical learning experience in fullstack development, the javascript language, and the application of newly acquired programming skills and frameworks.

Tech Stack
- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MySQL with Sequelize ORM
- Authentication: JWT (JSON Web Tokens)

Features
- User Authentication: Secure registration and login system with password recovery
- Budget Management: Create and manage budgets with associated expense tracking
- Savings Goals: Set and track progress towards savings targets
- Recurring Charges: Log and monitor repeating financial obligations
- Event Scheduling: Plan and visualize financial events on a calendar
- Interactive Calendar: View all financial events and charges in a unified interface

Architecture
- RESTful API design: Ensures a clear separation of concerns and facilitates easy communication between frontend and backend.
- Modular component structure in React: Promotes code reusability and maintainability.
- MVC pattern in backend: Helps in organizing the codebase efficiently, making it easier to scale and maintain.

Installation
- Clone the repository
- Install dependencies:
  - cd frontend && npm install 
  - cd ../backend && npm install
- Set up your MySQL database and update the configuration in backend/config/config.json
- Run the backend server:
  - cd backend
  - npm start
- Run the frontend development server:
  - cd frontend
  - npm run dev

Notable Implementations
- Complex state management in React
- Secure authentication flow
- Database relations and transactions
- Data visualization (charts, progress bars)
- Date handling and recurring event calculations

Challenges and Solutions
- Cross-origin authentication issues (needs addressing)
- Complex data relationships in database design
- Ensuring data consistency across related entities

Learning Outcomes
- Full software development lifecycle experience
- Integration of frontend and backend systems
- Database design and management
- User experience considerations in financial applications

Potential Improvements
- Implement additional security measures
- Enhance error handling and user feedback
- Optimize database queries for better performance
- Implement comprehensive testing suite
- Consider containerization for easier deployment

Credits
- Background Image: Essow K on Pexels
- Fullstack Development Tutorial: YouTube Series



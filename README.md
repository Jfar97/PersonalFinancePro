# Personal Finance Pro
Personal Finance Pro, or PFPro, is a fullstack personal finance management application uniquely crafted to fulfill the specific features and control I desired in a finance app that I couldn’t find in existing applications. Designed to streamline the management of budgets, expenses, savings, recurring charges, and financial events, PFPro combines these elements into one intuitive platform, giving users the tailored experience I envisioned for personal finance management. This project was developed over the period of a month, serving as a practical learning experience in fullstack development, the javascript language, and the application of newly acquired programming skills and frameworks.

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FJfar97%2FPersonalFinancePro%2Fmain%2FPFPro%2Ffrontend%2Fpackage.json&query=%24.dependencies.react&style=flat&logo=React&logoColor=%233af6fc&label=React&color=%233af6fc)


# App Description
The user creates an account with their username, password, email, and a security question that is used to recover a forgotten password for the account. Upon logging in, they are taken to the home page that displays the recurring charges and events within the next week, the expenses added within the last week, and the users budgets and savings. Any of the charges, events, or expenses can be deleted and a savings or budget can be clicked to navigate to its individual page. There is also a navigation bar at the top with tabs for all the different pages of the app, which persists across all pages and when scrolling. The account tab contains all information related to the account and allows a user to reset their password or delete their account. The savings tab displays all the users savings items and allows them to create new ones. Clicking on a saving item will take the user to the individual page for the saving item, where the current amount saved can be updated and adjusted. Likewise the budget tab will display all the budget items, and clicking on one takes the user to that budget item's page where the budgeted amount and item itself can be updated. All expenses across all budgets can be viewed on the expenses tab. The charges tab is for recurring charges such as bills and subscriptions, and allows users to add items with a type and one of four different frequencies: daily, weekly, monthly, and annually. The events tab is similar and is used for events such as holidays or concerts. It also allows users to add items with a type and one of the four frequencies. The calendar tab displays the next occurrence of all charges and events in a calendar format with options for a monthly view, weekly view, and daily view. 


# Technical Skills Implemented

- **Full CRUD Operations**: Create, Read, Update, and Delete across key entities (Users, Budgets, Expenses, etc.)
- **RESTful API Development**: Node.js + Express routes designed for clear client–server communication
- **Database Management & Relational Modeling**: MySQL with Sequelize ORM for migrations, schema design, and complex relationships
- **Authentication & Authorization**: JWT-based workflow with secure user registration, login, and password recovery
- **Complex State Management**: Multi-layer React state handling with context/hooks (or Redux, if used)
- **Responsive UI Design**: Adaptive layouts that scale across desktop and mobile devices
- **Data Visualization**: Charts and progress bars to present financial metrics at a glance
- **Date & Time Handling**: Accurate scheduling and calculations for recurring events
- **Asynchronous Programming**: Use of Promises and async/await for seamless, non-blocking operations
- **Form & Input Validation**: Both client-side and server-side checks to ensure data integrity
- **Error Handling**: Robust exception handling across backend and frontend layers


# Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)

# Features
- **User Account Creation and Management**: Secure registration and login system with password recovery and account deletion capabilities
- **Budget Management**: Create and manage budgets with associated expense tracking
- **Savings Goals**: Set and track progress towards savings targets
- **Recurring Charges**: Log and monitor repeating financial obligations
- **Event Scheduling**: Plan and visualize financial events on a calendar
- **Interactive Calendar**: View all financial events and charges in a unified interface

# Architecture
- **RESTful API design**: Ensures a clear separation of concerns and facilitates easy communication between frontend and backend.
- **Modular component structure in React**: Designed to promote code reusability and maintainability.
- **MVC pattern in backend**: Helps in organizing the codebase efficiently, making it easier to scale and maintain.

# Installation
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

# Notable Implementations
- Complex state management in React
- Secure authentication flow
- Database relations and transactions
- Data visualization (charts, progress bars)
- Date handling and recurring event calculations

# Challenges and Solutions
- Cross-origin authentication issues (needs addressing)
- Complex data relationships in database design
- Ensuring data consistency across related entities

# Learning Outcomes
- Full software development lifecycle experience
- Integration of frontend and backend systems
- Database design and management
- User experience considerations in financial applications

# Potential Improvements
- Implement additional security measures
- Enhance error handling and user feedback
- Optimize database queries for better performance
- Implement comprehensive testing suite
- Consider containerization for easier deployment

# Credits
- Background Image: Essow K on Pexels
- Fullstack Development Tutorial: YouTube Series



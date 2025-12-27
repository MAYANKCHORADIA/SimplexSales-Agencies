# Product Requirements Document (PRD)

## Project Camp Backend

### 1. Product Overview

**Product Name:** SIMPLEX SALES AND AGENCIES WEBSITE BACKEND  
**Version:** 1.0.0  
**Product Type:** Backend API for E-commerce platform


### 2. Core Features

#### 3.1 User Authentication & Authorization

- **User Registration:** Account creation with email verification
- **User Login:** Secure authentication with JWT tokens
- **Password Management:** Change password, forgot/reset password functionality
- **Email Verification:** Account verification via email tokens
- **Token Management:** Access token refresh mechanism
- **Role-Based Access Control:** Three-tier permission system (Admin, Project Admin, Member)

#### 3.2 Cart Management

- **Add to cart:** Create new projects with name and description
- **Delete from cart:** View all projects user has access to with member count

#### 3.3 Payment gateway


#### 3.5 Subtask Management

- **Subtask Creation:** Add subtasks to existing tasks
- **Subtask Updates:** Modify subtask details and completion status
- **Subtask Deletion:** Remove subtasks (Admin/Project Admin only)
- **Member Completion:** Allow members to mark subtasks as complete

#### 3.6 Project Notes

- **Note Creation:** Add notes to projects (Admin only)
- **Note Listing:** View all project notes
- **Note Details:** Access individual note content
- **Note Updates:** Modify existing notes (Admin only)
- **Note Deletion:** Remove notes (Admin only)

#### 3.7 System Health

- **Health Check:** API endpoint for system status monitoring


### 4. Security Features

- JWT-based authentication with refresh tokens
- Role-based authorization middleware
- Input validation on all endpoints
- Email verification for account security
- Secure password reset functionality
- File upload security with Multer middleware
- CORS configuration for cross-origin requests

### 5. File Management

- Support for multiple file attachments on tasks
- Files stored in public/images directory
- File metadata tracking (URL, MIME type, size)
- Secure file upload handling



# Hostel Management System - Backend 🏨

A robust and secure REST API for a comprehensive Hostel Management System, built with Node.js, Express, and MySQL. This backend provides all the necessary functionalities for both administrators and students to manage hostel operations efficiently.

## ✨ Features

-   **Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) operations for managing students, rooms, fees, and complaints.
-   **Secure Authentication**: JWT-based authentication for both admins and students with hashed passwords using bcrypt.
-   **Student Portal**: Secure endpoints for students to view their profile, check fee history, and manage complaints.
-   **Automated Room Management**: Smart logic to automatically update room occupancy when students are added, moved, or removed.
-   **Role-Based Access Control**: Clear separation between admin and student privileges.

---

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MySQL
-   **Authentication**: JSON Web Tokens (JWT), bcrypt
-   **Libraries**: `mysql2`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `cookie-parser`

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### **Prerequisites**

-   Node.js (v14 or higher)
-   MySQL Server

### **Installation & Setup**

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Vermadeepakd1/hostel-management-system-backend.git](https://github.com/Vermadeepakd1/hostel-management-system-backend.git)
    cd hostel-management-system-backend
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables. Replace the values with your local database credentials.

    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=hostel_system
    DB_PORT=3306
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Set up the database:**
    -   Create a new MySQL database named `hostel_system`.
    -   Run the SQL queries found in the `database_schema.sql` file (or run them one by one) to create the necessary tables (`admins`, `students`, `rooms`, `fees`, `complaints`).

5.  **Start the server:**
    ```sh
    npm start
    ```
    The server will start running at `http://localhost:5000`.

---

## 🔑 API Endpoint Documentation

The base URL for all endpoints is `/`.

### **Admin Routes** 👨‍💼
*(Requires admin authentication token)*

| Method | Endpoint                    | Description                          |
| :----- | :-------------------------- | :----------------------------------- |
| `POST` | `/admin/login`              | Logs in an administrator.            |
| `POST` | `/students/add`             | Adds a new student.                  |
| `GET`  | `/students`                 | Gets a list of all students.         |
| `PUT`  | `/students/update/:id`      | Updates a specific student.          |
| `DELETE`| `/students/delete/:id`      | Deletes a specific student.          |
| `POST` | `/rooms/add`                | Adds a new room.                     |
| `GET`  | `/rooms`                    | Gets a list of all rooms.            |
| `POST` | `/fees/add`                 | Records a fee payment for a student. |
| `GET`  | `/fees/student/:id`         | Gets fee history for a student.      |
| `GET`  | `/complaints`               | Gets all complaints.                 |
| `PUT`  | `/complaints/update/:id`    | Updates a complaint's status.        |

### **Student Routes** 🧑‍🎓
*(Requires student authentication token)*

| Method | Endpoint                         | Description                                |
| :----- | :------------------------------- | :----------------------------------------- |
| `POST` | `/auth/student/login`            | Logs in a student.                         |
| `POST` | `/auth/student/change-password`  | Allows a student to change their password. |
| `GET`  | `/student/profile`               | Gets the logged-in student's profile.      |
| `GET`  | `/student/fees`                  | Gets the logged-in student's fee history.  |
| `POST` | `/student/complaint`             | Submits a new complaint.                   |
| `GET`  | `/student/complaint`             | Gets the logged-in student's complaints.   |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/your-username/your-repo-name/issues) if you want to contribute.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

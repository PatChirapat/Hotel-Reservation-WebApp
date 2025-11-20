# Hotel Reservation WebApp  
This project helps customers book rooms easily while reducing hotel staff’s manual work through an online system that manages reservations and customer data automatically. The goal is to improve efficiency, accuracy, and user convenience allowing both guests and staff to handle bookings faster and more effectively.


# Features

### User
- Register / Login
- View room types and availability
- Make booking 
- Cancel booking
- Pay for booking (QR, cash, card)
- View booking history

### Admin
- Manage users (view, add, edit, delete)
- Manage rooms (view, add, edit, delete)
- Manage payment status
- Manage roles

### Developer
- View logs (system activity)

# Tech Stacks 
- React + Vite
- PHP + MySQL
- MAMP


# Installation & Usage
### Backend Setup
1.Use any local PHP development environment(e.g. MAMP) and place the backend folder in web server directory(htdocs/ if using MAMP).

2.Import database hotel_db.sql on phpMyAdmin
```sql
backend/database/hotel_db.sql
```

3.Create database user & Permissions on phpMyAdmin
```sql
CREATE USER 'hotel_user'@'localhost' 
IDENTIFIED BY 'UserPass123!';

CREATE USER 'hotel_admin'@'localhost' 
IDENTIFIED BY 'AdminPass123!';

CREATE USER 'hotel_dev'@'localhost' 
IDENTIFIED BY 'DevPass123!';


GRANT USAGE ON *.* TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE TEMPORARY TABLES, EXECUTE ON `hotel_db`.* TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT ON `hotel_db`.`activity_log` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`booking_night` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`booking` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`member` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`payment` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`review` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`room_type` TO `hotel_admin`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE ON `hotel_db`.`room` TO `hotel_admin`@`localhost`;


GRANT USAGE ON *.* TO `hotel_dev`@`localhost`;

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, EXECUTE, EVENT, TRIGGER ON `hotel_db`.* TO `hotel_dev`@`localhost`;


GRANT USAGE ON *.* TO `hotel_user`@`localhost`;

GRANT SELECT, INSERT, UPDATE, EXECUTE ON `hotel_db`.* TO `hotel_user`@`localhost`;

GRANT SELECT ON `hotel_db`.`booking_night` TO `hotel_user`@`localhost`;

GRANT SELECT, INSERT, UPDATE ON `hotel_db`.`booking` TO `hotel_user`@`localhost`;

GRANT SELECT, INSERT, UPDATE ON `hotel_db`.`member` TO `hotel_user`@`localhost`;

GRANT SELECT, INSERT, UPDATE ON `hotel_db`.`payment` TO `hotel_user`@`localhost`;

GRANT SELECT, INSERT ON `hotel_db`.`review` TO `hotel_user`@`localhost`;

GRANT SELECT ON `hotel_db`.`room_type` TO `hotel_user`@`localhost`;

GRANT SELECT ON `hotel_db`.`room` TO `hotel_user`@`localhost`;

```


### Frontend Setup
1.Navigate to frontend directory:

``` bash
cd frontend/
```

2.Install dependencies:

```bash
npm install
```

3.Start development server:

``` bash
npm run dev
```

# Demo Accounts

| **Role**     | **Username** | **Password** |
| ------------ | ------------ | ------------ |
| Developer | `dev1`       | `123456`     |
| Admin     | `admin`      | `123456`     |
| User      | `demouser`   | `123456`     |

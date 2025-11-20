-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Nov 20, 2025 at 11:01 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `FindAvailableRoomTypes` (IN `in_checkin` DATE, IN `in_checkout` DATE, IN `in_guests` INT)   BEGIN
    /*
      in_checkin  = วันที่เริ่มพัก (เช่น 2025-11-15)
      in_checkout = วันที่เช็คเอาท์ (exclusive, คือคืนสุดท้ายคือ in_checkout - 1)
      in_guests   = จำนวนผู้เข้าพัก
    */

    SELECT
        rt.room_type_id,
        rt.name              AS room_type_name,
        rt.capacity,
        rt.base_price,
        COUNT(r.room_id)     AS total_rooms,
        SUM(
            CASE 
                WHEN NOT EXISTS (
                    SELECT 1
                    FROM booking_night bn
                    JOIN booking b 
                      ON b.booking_id = bn.booking_id
                     AND b.booking_status IN ('Pending', 'Confirmed')
                    WHERE bn.room_id = r.room_id
                      AND bn.stay_date >= in_checkin
                      AND bn.stay_date <  in_checkout
                ) 
                THEN 1 ELSE 0 
            END
        ) AS available_rooms
    FROM room_type rt
    JOIN room r 
      ON r.room_type_id = rt.room_type_id
     AND r.status = 'Available'   -- ห้องที่ถูกปิดขายยาวก็จะไม่ถูกนับ
    GROUP BY
        rt.room_type_id,
        rt.name,
        rt.capacity,
        rt.base_price
    HAVING 
        available_rooms > 0      -- ต้องมีห้องว่างอย่างน้อย 1 ห้อง
        AND rt.capacity >= in_guests
    ORDER BY
        rt.base_price ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GenerateBookingNightsForBooking` (IN `in_booking_id` BIGINT, IN `in_room_id` BIGINT)   BEGIN
    DECLARE v_checkin   DATE;
    DECLARE v_checkout  DATE;
    DECLARE v_total_amt DECIMAL(10,2);
    DECLARE v_nights    INT;
    DECLARE v_price     DECIMAL(10,2);
    DECLARE v_curr_date DATE;

    -- 1) ดึงข้อมูลจาก booking
    SELECT 
        checkin_date,
        checkout_date,
        total_amount
    INTO 
        v_checkin,
        v_checkout,
        v_total_amt
    FROM booking
    WHERE booking_id = in_booking_id;

    -- 2) คำนวณจำนวนคืน (อย่างน้อย 1 คืน)
    SET v_nights = DATEDIFF(v_checkout, v_checkin);
    IF v_nights <= 0 THEN
        SET v_nights = 1;
    END IF;

    -- 3) ราคา/คืน
    SET v_price = IFNULL(v_total_amt, 0) / v_nights;

    -- 4) ลบ booking_night เดิมของ booking นี้ (กันซ้ำ)
    DELETE FROM booking_night
    WHERE booking_id = in_booking_id;

    -- 5) วนสร้างทีละคืน
    SET v_curr_date = v_checkin;

    WHILE v_curr_date < v_checkout DO
        INSERT INTO booking_night (booking_id, stay_date, room_id, price_per_night)
        VALUES (in_booking_id, v_curr_date, in_room_id, v_price);

        SET v_curr_date = DATE_ADD(v_curr_date, INTERVAL 1 DAY);
    END WHILE;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMemberBookingHistory` (IN `in_member_id` BIGINT)   BEGIN
    SELECT 
        b.booking_id,
        b.member_id,
        b.room_type_id,
        rt.name AS room_type_name,
        b.phone_entered,
        b.checkin_date,
        b.checkout_date,
        b.guest_count,
        b.booking_status,
        b.subtotal_amount,
        b.discount_amount,
        b.total_amount,
        b.created_at,
        p.payment_status,
        p.method      AS payment_method,
        p.paid_at     AS payment_paid_at
    FROM booking b
    JOIN room_type rt 
        ON rt.room_type_id = b.room_type_id
    LEFT JOIN (
        SELECT 
            booking_id,
            CASE
                WHEN MAX(payment_status = 'Success') = 1 THEN 'Success'
                WHEN MAX(payment_status = 'Pending') = 1 THEN 'Pending'
                WHEN MAX(payment_status = 'Failed')  = 1 THEN 'Failed'
                ELSE NULL
            END AS payment_status,
            MAX(method)  AS method,
            MAX(paid_at) AS paid_at
        FROM payment
        GROUP BY booking_id
    ) p 
      ON p.booking_id = b.booking_id
    WHERE b.member_id = in_member_id
    ORDER BY b.checkin_date DESC;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `GetMemberTotalSpent` (`in_member_id` BIGINT) RETURNS DECIMAL(10,2) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE v_total DECIMAL(10,2);

    SELECT IFNULL(SUM(p.amount), 0)
    INTO v_total
    FROM payment p
    JOIN booking b ON b.booking_id = p.booking_id
    WHERE b.member_id = in_member_id
      AND p.payment_status = 'Success';

    RETURN v_total;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `log_id` int NOT NULL,
  `actor_id` int NOT NULL,
  `action_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`log_id`, `actor_id`, `action_type`, `details`, `created_at`) VALUES
(27, 50, 'ADMIN_ADD_USER', 'Admin50: Added user 51', '2025-11-18 04:21:55'),
(28, 51, 'USER_ADD_BOOKING', 'User51: created booking 264', '2025-11-18 04:25:06'),
(29, 51, 'USER_CANCEL_BOOKING', 'User51: cancelled booking 264', '2025-11-18 04:25:31'),
(30, 50, 'ADMIN_DELETE_BOOKING', 'Admin 50: deleted booking 264', '2025-11-18 04:32:30'),
(31, 50, 'ADMIN_ADD_USER', 'Admin50: Added user 52', '2025-11-18 04:32:50'),
(32, 50, 'ADMIN_DELETE_USER', 'Admin50: Deleted user 52', '2025-11-18 04:32:52'),
(33, 50, 'ADMIN_DELETE_USER', 'Admin50: Deleted user 53', '2025-11-18 04:50:46'),
(34, 51, 'USER_ADD_BOOKING', 'User51: created booking 265', '2025-11-18 04:55:12'),
(35, 51, 'USER_ADD_BOOKING', 'User51: created booking 266', '2025-11-18 04:55:12'),
(36, 51, 'USER_CANCEL_BOOKING', 'User51: cancelled booking 265', '2025-11-18 04:55:40');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `booking_id` bigint NOT NULL,
  `member_id` bigint DEFAULT NULL,
  `room_type_id` bigint NOT NULL,
  `phone_entered` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `guest_count` int NOT NULL,
  `booking_status` enum('Pending','Confirmed','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `subtotal_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`booking_id`, `member_id`, `room_type_id`, `phone_entered`, `checkin_date`, `checkout_date`, `guest_count`, `booking_status`, `subtotal_amount`, `discount_amount`, `total_amount`, `created_at`) VALUES
(265, 51, 1, '0978463775', '2025-11-18', '2025-11-20', 1, 'Cancelled', 6400.00, 0.00, 6400.00, '2025-11-18 11:55:12'),
(266, 51, 3, '0978463775', '2025-11-18', '2025-11-20', 1, 'Pending', 11200.00, 0.00, 11200.00, '2025-11-18 11:55:12');

--
-- Triggers `booking`
--
DELIMITER $$
CREATE TRIGGER `trg_booking_cancel_cleanup` AFTER UPDATE ON `booking` FOR EACH ROW BEGIN
  -- ถ้าจากสถานะเดิมไม่ใช่ Cancelled แล้วถูกเปลี่ยนเป็น Cancelled
  IF OLD.booking_status <> 'Cancelled' AND NEW.booking_status = 'Cancelled' THEN
    DELETE FROM booking_night
    WHERE booking_id = NEW.booking_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_payment_pending_after_booking` AFTER INSERT ON `booking` FOR EACH ROW BEGIN
  -- ป้องกันซ้ำ (เผื่อมีการเพิ่มจาก endpoint อื่น)
  IF NOT EXISTS (
    SELECT 1 FROM payment
    WHERE booking_id = NEW.booking_id
      AND payment_status IN ('Pending','Success')
  ) THEN
    INSERT INTO payment (
      booking_id, amount, method, provider_txn_ref, payment_status, paid_at
    ) VALUES (
      NEW.booking_id, NEW.total_amount, NULL, NULL, 'Pending', NULL
    );
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `booking_night`
--

CREATE TABLE `booking_night` (
  `booking_id` bigint NOT NULL,
  `stay_date` date NOT NULL,
  `room_id` bigint NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `member_id` bigint NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tier` enum('SILVER','GOLD','PLATINUM') DEFAULT 'SILVER',
  `join_date` date DEFAULT (curdate()),
  `role` enum('admin','developer','user') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`member_id`, `first_name`, `last_name`, `phone`, `username`, `password_hash`, `email`, `tier`, `join_date`, `role`) VALUES
(49, 'fdev1', 'ldev1', '0123456789', 'dev1', '$2y$10$dg6KYPuD89pk4t2jCQjh2uRqBSrWIa.NOfeo6ZhkzFBfHIGqLN0zC', 'dev1@gmail.com', 'SILVER', '2025-11-18', 'developer'),
(50, 'fadmin', 'ladmin', '0987654321', 'admin', '$2y$10$J4YEY1qWOfmbeepZozqjfex.nSObCs2Aa40LKEo2rMeyVRItb85uO', 'admin@gmail.com', 'SILVER', '2025-11-18', 'admin'),
(51, 'fdemo', 'ldemo', '0978463775', 'demouser', '$2y$10$4Po2bikQMrqb.X6W2J10Yu5OXc1jkcfB0Cr0QThs2Zo5hc2jTGW3y', 'demou@gmail.com', 'SILVER', '2025-11-18', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` bigint NOT NULL,
  `booking_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('Credit','Debit','Cash','QR') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provider_txn_ref` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_status` enum('Success','Pending','Failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pending',
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `booking_id`, `amount`, `method`, `provider_txn_ref`, `payment_status`, `paid_at`) VALUES
(108, 265, 6400.00, NULL, NULL, 'Pending', NULL),
(109, 266, 11200.00, NULL, NULL, 'Pending', NULL);

--
-- Triggers `payment`
--
DELIMITER $$
CREATE TRIGGER `trg_member_tier_after_payment_update` AFTER UPDATE ON `payment` FOR EACH ROW BEGIN
    DECLARE v_member_id BIGINT;
    DECLARE v_total     DECIMAL(10,2);
    DECLARE v_new_tier  VARCHAR(20);

    -- ทำงานเฉพาะตอนที่เปลี่ยนจาก ไม่ใช่ Success -> กลายเป็น Success
    IF NEW.payment_status = 'Success'
       AND OLD.payment_status <> 'Success' THEN

        -- หา member_id จาก booking
        SELECT b.member_id
          INTO v_member_id
        FROM booking b
        WHERE b.booking_id = NEW.booking_id
        LIMIT 1;

        IF v_member_id IS NOT NULL THEN
            -- คำนวณยอดรวมที่จ่ายสำเร็จทั้งหมด
            SET v_total = GetMemberTotalSpent(v_member_id);

            -- ตัดสิน tier ตามยอดรวม (ปรับเลขได้)
            IF v_total >= 30000 THEN
                SET v_new_tier = 'PLATINUM';
            ELSEIF v_total >= 10000 THEN
                SET v_new_tier = 'GOLD';
            ELSE
                SET v_new_tier = 'SILVER';
            END IF;

            -- อัปเดต tier ใน member
            UPDATE member
            SET tier = v_new_tier
            WHERE member_id = v_member_id;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `review_id` bigint NOT NULL,
  `member_id` bigint NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `room_type_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`review_id`, `member_id`, `booking_id`, `room_type_id`, `rating`, `text`, `created_at`) VALUES
(556, 51, NULL, 1, 5, 'First review', '2025-11-18 11:25:21');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `room_id` bigint NOT NULL,
  `room_type_id` bigint NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `floor` int NOT NULL,
  `status` enum('Available','Occupied','Cleaning','Maintenance') DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`room_id`, `room_type_id`, `room_number`, `floor`, `status`) VALUES
(1, 1, 'C101', 1, 'Available'),
(2, 1, 'C102', 1, 'Available'),
(3, 1, 'C103', 1, 'Available'),
(4, 1, 'C104', 1, 'Available'),
(5, 1, 'C105', 1, 'Available'),
(6, 1, 'C106', 1, 'Available'),
(7, 1, 'C107', 1, 'Available'),
(8, 1, 'C108', 1, 'Available'),
(9, 1, 'C109', 1, 'Available'),
(10, 1, 'C110', 1, 'Available'),
(11, 1, 'C111', 1, 'Available'),
(12, 1, 'C112', 1, 'Available'),
(13, 1, 'C113', 1, 'Available'),
(14, 1, 'C114', 1, 'Available'),
(15, 1, 'C115', 1, 'Available'),
(16, 1, 'C116', 1, 'Available'),
(17, 1, 'C117', 1, 'Available'),
(18, 1, 'C118', 1, 'Available'),
(19, 1, 'C119', 1, 'Available'),
(20, 1, 'C120', 1, 'Available'),
(21, 1, 'C121', 1, 'Available'),
(22, 1, 'C122', 1, 'Available'),
(23, 1, 'C123', 1, 'Available'),
(24, 1, 'C124', 1, 'Available'),
(25, 1, 'C125', 1, 'Available'),
(26, 1, 'C126', 1, 'Available'),
(27, 1, 'C127', 1, 'Available'),
(28, 1, 'C128', 1, 'Available'),
(29, 1, 'C129', 1, 'Available'),
(30, 1, 'C130', 1, 'Available'),
(31, 1, 'C131', 1, 'Available'),
(32, 1, 'C132', 1, 'Available'),
(33, 2, 'P201', 2, 'Available'),
(34, 2, 'P202', 2, 'Available'),
(35, 2, 'P203', 2, 'Available'),
(36, 2, 'P204', 2, 'Available'),
(37, 2, 'P205', 2, 'Available'),
(38, 2, 'P206', 2, 'Available'),
(39, 2, 'P207', 2, 'Available'),
(40, 2, 'P208', 2, 'Available'),
(41, 2, 'P209', 2, 'Available'),
(42, 2, 'P210', 2, 'Available'),
(43, 2, 'P211', 2, 'Available'),
(44, 2, 'P212', 2, 'Available'),
(45, 2, 'P213', 2, 'Available'),
(46, 2, 'P214', 2, 'Available'),
(47, 2, 'P215', 2, 'Available'),
(48, 2, 'P216', 2, 'Available'),
(49, 2, 'P217', 2, 'Available'),
(50, 2, 'P218', 2, 'Available'),
(51, 2, 'P219', 2, 'Available'),
(52, 2, 'P220', 2, 'Available'),
(53, 2, 'P221', 2, 'Available'),
(54, 2, 'P222', 2, 'Available'),
(55, 2, 'P223', 2, 'Available'),
(56, 2, 'P224', 2, 'Available'),
(57, 2, 'P225', 2, 'Available'),
(58, 2, 'P226', 2, 'Available'),
(59, 3, 'E301', 3, 'Available'),
(60, 3, 'E302', 3, 'Available'),
(61, 3, 'E303', 3, 'Available'),
(62, 3, 'E304', 3, 'Available'),
(63, 3, 'E305', 3, 'Available'),
(64, 3, 'E306', 3, 'Available'),
(65, 3, 'E307', 3, 'Available'),
(66, 3, 'E308', 3, 'Available'),
(67, 3, 'E309', 3, 'Available'),
(68, 3, 'E310', 3, 'Available'),
(69, 3, 'E311', 3, 'Available'),
(70, 3, 'E312', 3, 'Available'),
(71, 3, 'E313', 3, 'Available'),
(72, 3, 'E314', 3, 'Available'),
(73, 3, 'E315', 3, 'Available'),
(74, 3, 'E316', 3, 'Available'),
(75, 3, 'E317', 3, 'Available'),
(76, 3, 'E318', 3, 'Available'),
(77, 3, 'E319', 3, 'Available'),
(78, 3, 'E320', 3, 'Available'),
(79, 3, 'E321', 3, 'Available'),
(80, 4, 'D401', 4, 'Available'),
(81, 4, 'D402', 4, 'Available'),
(82, 4, 'D403', 4, 'Available'),
(83, 4, 'D404', 4, 'Available'),
(84, 4, 'D405', 4, 'Available'),
(85, 4, 'D406', 4, 'Available'),
(86, 4, 'D407', 4, 'Available'),
(87, 4, 'D408', 4, 'Available'),
(88, 4, 'D409', 4, 'Available'),
(89, 4, 'D410', 4, 'Available'),
(90, 4, 'D411', 4, 'Available'),
(91, 4, 'D412', 4, 'Available'),
(92, 4, 'D413', 4, 'Available'),
(93, 4, 'D414', 4, 'Available'),
(94, 4, 'D415', 4, 'Available'),
(95, 4, 'D416', 4, 'Available'),
(96, 5, 'R501', 5, 'Available'),
(97, 5, 'R502', 5, 'Available'),
(98, 5, 'R503', 5, 'Available'),
(99, 5, 'R504', 5, 'Available'),
(100, 5, 'R505', 5, 'Available'),
(101, 5, 'R506', 5, 'Available'),
(102, 5, 'R507', 5, 'Available'),
(103, 5, 'R508', 5, 'Available'),
(104, 5, 'R509', 5, 'Available'),
(105, 5, 'R510', 5, 'Available');

-- --------------------------------------------------------

--
-- Table structure for table `room_type`
--

CREATE TABLE `room_type` (
  `room_type_id` bigint NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_type`
--

INSERT INTO `room_type` (`room_type_id`, `name`, `capacity`, `base_price`, `description`) VALUES
(1, 'Classic', 2, 3200.00, 'A cozy retreat featuring a plush queen bed, modern decor, and warm lighting.'),
(2, 'Premier', 3, 4200.00, 'Spacious and elegant with a king-sized bed and city view.'),
(3, 'Executive', 3, 5600.00, 'Private bedroom with a large tub and rain shower, plus lounge access.'),
(4, 'Diplomatic', 3, 7800.00, '10-place dining room, pantry, and exclusive lounge access.'),
(5, 'Royal', 3, 9900.00, 'Ultimate luxury with dining area, private bar, and marble bathroom.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `idx_date_range` (`checkin_date`,`checkout_date`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `booking_night`
--
ALTER TABLE `booking_night`
  ADD PRIMARY KEY (`booking_id`,`stay_date`),
  ADD UNIQUE KEY `uq_room_date` (`room_id`,`stay_date`),
  ADD KEY `idx_room_date` (`room_id`,`stay_date`);

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `uq_member_username` (`username`),
  ADD UNIQUE KEY `uq_member_phone` (`phone`),
  ADD UNIQUE KEY `uq_member_email` (`email`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `uq_payment_booking` (`booking_id`),
  ADD UNIQUE KEY `provider_txn_ref` (`provider_txn_ref`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_payment_booking` (`booking_id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `fk_review_member` (`member_id`),
  ADD KEY `fk_review_booking` (`booking_id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_type`
--
ALTER TABLE `room_type`
  ADD PRIMARY KEY (`room_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=267;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `member_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `review_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=557;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `room_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12345679;

--
-- AUTO_INCREMENT for table `room_type`
--
ALTER TABLE `room_type`
  MODIFY `room_type_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`);

--
-- Constraints for table `booking_night`
--
ALTER TABLE `booking_night`
  ADD CONSTRAINT `booking_night_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  ADD CONSTRAINT `booking_night_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_review_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`) ON DELETE CASCADE;

--
-- Constraints for table `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `room_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

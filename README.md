# Hotel-Reservation-WebApp
# 🏨 Hotel Reservation System – SQL Query List

**Database:** `hotel_db`  
**Last Update:** 5 November 2025  
**Course:** CSS326 – Database Lab  

---

## 👤 Member Management

### 1️⃣ แสดงรายชื่อสมาชิกทั้งหมด (READ) (yes)
```sql
SELECT member_id, first_name, last_name, phone, email, tier, join_date
FROM member
ORDER BY member_id;
```

### 2️⃣ เพิ่มสมาชิกใหม่ (INSERT) (yes)
```sql
INSERT INTO member (first_name, last_name, phone, email, tier)
VALUES ('[First]', '[Last]', '[08xxxxxxxx]', '[email@example.com]', 'SILVER');
```

### 3️⃣ ลบสมาชิก (DELETE) (yes)
```sql
DELETE FROM member
WHERE member_id = [member_id];
```

### 4️⃣ แก้ไขข้อมูลสมาชิก (UPDATE) (yes)
```sql
UPDATE member
SET first_name = '[First]', last_name = '[Last]', phone = '[08xxxxxxxx]', email = '[email@example.com]', tier = 'GOLD'
WHERE member_id = [member_id];
```

### 5️⃣ ค้นหาสมาชิกตามชื่อ (SEARCH) (yes maybe)
```sql
SELECT member_id, first_name, last_name, phone, email, tier, join_date
FROM member
WHERE first_name LIKE '%[keyword]%' OR last_name LIKE '%[keyword]%';
```

### 🔠 ตัวอย่าง Pattern ในการใช้ LIKE และ %

| ตัวอย่าง pattern | ความหมาย |
|------------------|-----------|
| `'A%'` | ขึ้นต้นด้วย A |
| `'%A'` | ลงท้ายด้วย A |
| `'%A%'` | มี A อยู่ตรงไหนก็ได้ |
| `'A_%'` | ขึ้นต้นด้วย A และตามด้วยอักขระอย่างน้อย 1 ตัว |

### 6️⃣ แสดงสมาชิกตามระดับ (FILTER) (yes)
```sql
SELECT member_id, first_name, last_name, phone, email, tier, join_date
FROM member
WHERE tier = '[SILVER|GOLD|PLATINUM]'
ORDER BY member_id;
```
[SILVER|GOLD|PLATINUM] เลือกอย่างใดอย่างนึง

---

## 📅 Booking & Payment Management

### 7️⃣ แสดงรายการจองทั้งหมด (READ) (yes)
```sql
SELECT booking_id,
       member_id,
       phone_entered,
       checkin_date,
       checkout_date,
       guest_count,
       booking_status,
       subtotal_amount,
       discount_amount,
       total_amount,
       created_at
FROM booking
ORDER BY created_at DESC;
```

### 8️⃣ เพิ่มการจองใหม่ (INSERT) (น่าจะยังไม่ถูก)
```sql
INSERT INTO booking (
  member_id,
  phone_entered,
  checkin_date,
  checkout_date,
  guest_count,
  booking_status,
  subtotal_amount,
  discount_amount,
  total_amount
)
VALUES (
  [member_id],
  '[08xxxxxxxx]',
  '2025-12-24',
  '2025-12-26',
  2,
  'Confirmed',
  5000.00,
  0.00,
  5000.00
);
```

### 9️⃣ ยกเลิกการจอง (UPDATE) (yes)
```sql
UPDATE booking
SET booking_status = 'CANCELLED'
WHERE booking_id = [booking_id];
```

### 🔟 ลบการจอง (DELETE) (yes)
```sql
DELETE FROM booking
WHERE booking_id = [booking_id];
```

### 1️⃣1️⃣ แสดงการชำระเงินทั้งหมด (READ) (no)
```sql
SELECT payment_id, booking_id, amount, payment_date, payment_method
FROM payment
ORDER BY payment_id;
```

### 1️⃣2️⃣ เพิ่มข้อมูลการชำระเงิน (INSERT) (no)
```sql
INSERT INTO payment (booking_id, amount, payment_date, payment_method)
VALUES ([booking_id], [amount], '[YYYY-MM-DD]', '[CASH|CREDIT|DEBIT]');
```

### 1️⃣3️⃣ แก้ไขข้อมูลการชำระเงิน (UPDATE) (yes)
```sql
UPDATE payment
SET 
    amount = [new_amount],
    method = '[Credit|Debit|Cash|QR]',
    provider_txn_ref = '[new_reference]',
    payment_status = '[Success|Pending|Failed]'
WHERE payment_id = [payment_id];
```


### 1️⃣4️⃣ ลบข้อมูลการชำระเงิน (DELETE) (yes)
```sql
DELETE FROM payment
WHERE payment_id = [payment_id];
```

---

## 🛏️ Room & Room Type Management

### 1️⃣5️⃣ แสดงข้อมูลห้องพักทั้งหมด (READ) (yes)
```sql
SELECT *
FROM room
ORDER BY room_id;
```

### 1️⃣6️⃣ แสดงข้อมูลประเภทห้องพักทั้งหมด (READ) (yes)
```sql
SELECT room_type_id, name, capacity, description
FROM room_type
ORDER BY room_type_id;
```
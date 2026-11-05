-- ============================================================
-- EGhselha Car Wash - Database Seed Script
-- Run this in SSMS against WebCarWashDb
-- Uses IF NOT EXISTS checks to be safely re-runnable
-- ============================================================

USE WebCarWashDb;
GO

-- ============================================================
-- 1. ServiceZones
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM ServiceZones WHERE Id = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA')
BEGIN
    INSERT INTO ServiceZones (Id, ZoneName, PolygonBoundary, Status, BaseDistanceSurcharge, PeakSurgeMultiplier, MaxTechnicians, AdminId)
    VALUES (
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
        'East Cairo - Nasr City',
        '[]',
        'ACTIVE',
        20.0,
        1.0,
        10,
        NULL
    );
END
GO

-- ============================================================
-- 2. ServicePackages
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM ServicePackages WHERE Id = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0001')
BEGIN
    INSERT INTO ServicePackages (Id, Name, BasePrice, DurationMinutes, RequiresElectricity, RequiresWater, RequiresPrivateParking, RequiresCustomerReturn, IncludedServices)
    VALUES (
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0001',
        'Premium Wash',
        350.0,
        60,
        1,
        1,
        0,
        0,
        '["Exterior wash","Wheel cleaning","Window cleaning","Drying"]'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM ServicePackages WHERE Id = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0002')
BEGIN
    INSERT INTO ServicePackages (Id, Name, BasePrice, DurationMinutes, RequiresElectricity, RequiresWater, RequiresPrivateParking, RequiresCustomerReturn, IncludedServices)
    VALUES (
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0002',
        'Deep Clean',
        500.0,
        90,
        1,
        1,
        0,
        0,
        '["Full interior vacuum","Exterior wash","Dashboard wipe","Carpet shampoo"]'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM ServicePackages WHERE Id = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0003')
BEGIN
    INSERT INTO ServicePackages (Id, Name, BasePrice, DurationMinutes, RequiresElectricity, RequiresWater, RequiresPrivateParking, RequiresCustomerReturn, IncludedServices)
    VALUES (
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0003',
        'Basic Wash',
        200.0,
        30,
        0,
        1,
        0,
        0,
        '["Exterior rinse","Quick wipe-down","Window cleaning"]'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM ServicePackages WHERE Id = 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0004')
BEGIN
    INSERT INTO ServicePackages (Id, Name, BasePrice, DurationMinutes, RequiresElectricity, RequiresWater, RequiresPrivateParking, RequiresCustomerReturn, IncludedServices)
    VALUES (
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0004',
        'Ultimate Detail',
        700.0,
        120,
        1,
        1,
        1,
        0,
        '["Full interior detail","Paint correction","Ceramic coating prep","Engine bay cleaning"]'
    );
END
GO

-- ============================================================
-- 3. Users (base table - TPT pattern)
--    Note: Role column stores string values based on EF mapping
-- ============================================================

-- Technician user
IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = '11111111-1111-1111-1111-111111111111')
BEGIN
    INSERT INTO Users (Id, FullName, Phone, Email, PasswordHash, Role, IsPhoneVerified, CreatedAt)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Mostafa Ali',
        '+20 100 123 4567',
        'mostafa.ali@email.com',
        'hashed_demo_password',
        'TECHNICIAN',
        1,
        GETUTCDATE()
    );
END
GO

-- Customer users
IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001')
BEGIN
    INSERT INTO Users (Id, FullName, Phone, Email, PasswordHash, Role, IsPhoneVerified, CreatedAt)
    VALUES
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001', 'Ahmed Khaled',  '+20 100 999 1111', 'ahmed.khaled@example.com',  'hash1', 'CUSTOMER', 0, GETUTCDATE()),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0002', 'Sara Mahmoud',  '+20 101 222 3333', 'sara.mahmoud@example.com',  'hash2', 'CUSTOMER', 0, GETUTCDATE()),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0003', 'Omar Hassan',   '+20 102 333 4444', 'omar.hassan@example.com',   'hash3', 'CUSTOMER', 0, GETUTCDATE()),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0004', 'Mariam Adel',   '+20 103 444 5555', 'mariam.adel@example.com',   'hash4', 'CUSTOMER', 0, GETUTCDATE());
END
GO

-- ============================================================
-- 4. Technicians (child table - TPT)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Technicians WHERE Id = '11111111-1111-1111-1111-111111111111')
BEGIN
    INSERT INTO Technicians (
        Id,
        NationalId,
        IsOnline,
        CurrentLatitude,
        CurrentLongitude,
        Rating,
        AcceptanceRate,
        TodayEarnings,
        TotalBalance,
        VanLevel,
        VerifiedEquipment,
        ServiceArea,
        ShortBio,
        WorkingDays,
        WorkingHours,
        PushNotificationsEnabled,
        SmsNotificationsEnabled,
        EmailNotificationsEnabled,
        AvatarUrl,
        ServiceZoneId
    )
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        '29501011234567',
        1,
        30.0561,
        31.3414,
        4.9,
        98.0,
        850.0,
        8450.0,
        '',
        '[]',
        'Nasr City, Cairo',
        'Professional car care technician with 3+ years of experience.',
        'Sunday – Thursday',
        '09:00 AM – 06:00 PM',
        1,
        0,
        1,
        NULL,
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
    );
END
GO

-- ============================================================
-- 5. Customers (child table - TPT)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Customers WHERE Id = 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001')
BEGIN
    INSERT INTO Customers (Id, WalletBalance, LoyaltyPoints, SavedAddresses)
    VALUES
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001', 0.0, 0, '[]'),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0002', 0.0, 0, '[]'),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0003', 0.0, 0, '[]'),
    ('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0004', 0.0, 0, '[]');
END
GO

-- ============================================================
-- 6. Vehicles
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE Id = 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0001')
BEGIN
    INSERT INTO Vehicles (Id, CustomerId, Make, Model, Year, Color, LicensePlate, SizeType, SizeMultiplier, PhotoUrl)
    VALUES
    ('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0001', 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001', 'Hyundai', 'Elantra',  2022, 'Silver', 'ABC 123', 'SEDAN', 1.0, NULL),
    ('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0002', 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0002', 'Kia',     'Sportage', 2023, 'Black',  'XYZ 456', 'SUV',   1.2, NULL),
    ('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0003', 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0003', 'Nissan',  'Sunny',    2021, 'White',  'DEF 789', 'SEDAN', 1.0, NULL),
    ('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0004', 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0004', 'BMW',     'X5',       2024, 'Blue',   'GHI 101', 'SUV',   1.2, NULL);
END
GO

-- ============================================================
-- 7. Bookings
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Bookings WHERE BookingNumber = '#BK-0024')
BEGIN
    INSERT INTO Bookings (
        Id, BookingNumber, Status, BookingType, ScheduledAt,
        ParkingLatitude, ParkingLongitude, Address, DistanceText, ParkingType,
        HasElectricity, HasWaterAccess,
        BasePackagePrice, VehicleMultiplier, AddOnsSubtotal, DistanceSurcharge,
        PeakSurgeMultiplier, UpsellTotal, TotalPrice,
        DepositAmount, RemainingBalance,
        CustomerId, TechnicianId, VehicleId, ServicePackageId, ServiceZoneId
    )
    VALUES (
        'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEE0001',
        '#BK-0024',
        'WASHING',
        'FAST_TRACK',
        DATEADD(hour, 10, CAST(CAST(GETUTCDATE() AS date) AS datetime2)),
        30.0561, 31.3414,
        'Cairo, Nasr City',
        '3.2 km',
        'STREET',
        0, 0,
        350.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 350.0,
        200.0, 150.0,
        'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0001',
        '11111111-1111-1111-1111-111111111111',
        'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0001',
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0001',
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM Bookings WHERE BookingNumber = '#BK-0025')
BEGIN
    INSERT INTO Bookings (
        Id, BookingNumber, Status, BookingType, ScheduledAt,
        ParkingLatitude, ParkingLongitude, Address, DistanceText, ParkingType,
        HasElectricity, HasWaterAccess,
        BasePackagePrice, VehicleMultiplier, AddOnsSubtotal, DistanceSurcharge,
        PeakSurgeMultiplier, UpsellTotal, TotalPrice,
        DepositAmount, RemainingBalance,
        CustomerId, TechnicianId, VehicleId, ServicePackageId, ServiceZoneId
    )
    VALUES (
        'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEE0002',
        '#BK-0025',
        'DISPATCHED',
        'SCHEDULED',
        DATEADD(minute, 30, DATEADD(hour, 12, CAST(CAST(GETUTCDATE() AS date) AS datetime2))),
        30.0889, 31.3285,
        'Cairo, Heliopolis',
        '5.1 km',
        'DRIVEWAY',
        0, 0,
        500.0, 1.2, 0.0, 0.0,
        1.0, 0.0, 500.0,
        200.0, 300.0,
        'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0002',
        '11111111-1111-1111-1111-111111111111',
        'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0002',
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0002',
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM Bookings WHERE BookingNumber = '#BK-0026')
BEGIN
    INSERT INTO Bookings (
        Id, BookingNumber, Status, BookingType, ScheduledAt,
        ParkingLatitude, ParkingLongitude, Address, DistanceText, ParkingType,
        HasElectricity, HasWaterAccess,
        BasePackagePrice, VehicleMultiplier, AddOnsSubtotal, DistanceSurcharge,
        PeakSurgeMultiplier, UpsellTotal, TotalPrice,
        DepositAmount, RemainingBalance,
        CustomerId, TechnicianId, VehicleId, ServicePackageId, ServiceZoneId
    )
    VALUES (
        'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEE0003',
        '#BK-0026',
        'DISPATCHED',
        'SCHEDULED',
        DATEADD(hour, 15, CAST(CAST(GETUTCDATE() AS date) AS datetime2)),
        29.9602, 31.2569,
        'Cairo, Maadi',
        '7.4 km',
        'STREET',
        0, 0,
        200.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 200.0,
        200.0, 0.0,
        'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0003',
        '11111111-1111-1111-1111-111111111111',
        'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0003',
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0003',
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM Bookings WHERE BookingNumber = '#BK-0021')
BEGIN
    INSERT INTO Bookings (
        Id, BookingNumber, Status, BookingType, ScheduledAt,
        ParkingLatitude, ParkingLongitude, Address, DistanceText, ParkingType,
        HasElectricity, HasWaterAccess,
        BasePackagePrice, VehicleMultiplier, AddOnsSubtotal, DistanceSurcharge,
        PeakSurgeMultiplier, UpsellTotal, TotalPrice,
        DepositAmount, RemainingBalance,
        CustomerId, TechnicianId, VehicleId, ServicePackageId, ServiceZoneId
    )
    VALUES (
        'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEE0004',
        '#BK-0021',
        'COMPLETED',
        'SCHEDULED',
        DATEADD(hour, 13, DATEADD(day, -1, CAST(CAST(GETUTCDATE() AS date) AS datetime2))),
        30.0278, 31.4913,
        'Cairo, New Cairo',
        '10.2 km',
        'PRIVATE_GARAGE',
        0, 0,
        700.0, 1.2, 0.0, 0.0,
        1.0, 0.0, 700.0,
        200.0, 500.0,
        'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCC0004',
        '11111111-1111-1111-1111-111111111111',
        'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDD0004',
        'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBB0004',
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
    );
END
GO

-- ============================================================
-- 8. Notifications
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Notifications WHERE Id = 'F0000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO Notifications (Id, UserId, Title, Description, CreatedAt, Type, IsRead)
    VALUES
    (
        'F0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'Booking assigned',
        'You have received a new booking #BK-0026.',
        DATEADD(minute, -5, GETUTCDATE()),
        'BriefcaseBusiness',
        0
    ),
    (
        'F0000000-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'Customer update',
        'Ahmed Khaled confirmed the service details.',
        DATEADD(minute, -35, GETUTCDATE()),
        'UserRound',
        1
    ),
    (
        'F0000000-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111111',
        'Payout processed',
        'Your payout of EGP 1,200 has been processed.',
        DATEADD(day, -1, GETUTCDATE()),
        'Wallet',
        1
    ),
    (
        'F0000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111',
        'Great feedback!',
        'You received a 5-star review from Mariam.',
        DATEADD(day, -1, GETUTCDATE()),
        'Star',
        1
    );
END
GO

-- ============================================================
-- Done. Verify with:
-- SELECT * FROM ServiceZones;
-- SELECT * FROM ServicePackages;
-- SELECT u.FullName, u.Role FROM Users u;
-- SELECT t.Id, t.Rating, t.TotalBalance FROM Technicians t;
-- SELECT c.Id FROM Customers c;
-- SELECT v.Make, v.Model, v.LicensePlate FROM Vehicles v;
-- SELECT b.BookingNumber, b.Status, b.TotalPrice FROM Bookings b ORDER BY b.ScheduledAt;
-- SELECT n.Title, n.IsRead FROM Notifications n;
-- ============================================================

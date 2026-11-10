using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Security;

namespace WebCarWash.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(CarWashDbContext context)
        {
            // Ensure Database is created / migrated
            await context.Database.EnsureCreatedAsync();

            // Ensure AcceptedAt and GateNotes columns exist on existing SQL Server databases
            await context.Database.ExecuteSqlRawAsync(@"
                IF COL_LENGTH('Bookings', 'AcceptedAt') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [AcceptedAt] datetime2 NULL;
                END
                IF COL_LENGTH('Bookings', 'OnTheWayAt') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [OnTheWayAt] datetime2 NULL;
                END
                IF COL_LENGTH('Bookings', 'ArrivedAt') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [ArrivedAt] datetime2 NULL;
                END
                IF COL_LENGTH('Bookings', 'WashingStartedAt') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [WashingStartedAt] datetime2 NULL;
                END
                IF COL_LENGTH('Bookings', 'CompletedAt') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [CompletedAt] datetime2 NULL;
                END
                IF COL_LENGTH('Bookings', 'CancelledBy') IS NULL
                BEGIN
                    ALTER TABLE [Bookings] ADD [CancelledBy] nvarchar(30) NULL;
                END
                IF COL_LENGTH('Customers', 'GateNotes') IS NULL
                BEGIN
                    ALTER TABLE [Customers] ADD [GateNotes] nvarchar(500) NULL;
                END
                IF COL_LENGTH('Technicians', 'DateOfBirth') IS NULL
                BEGIN
                    ALTER TABLE [Technicians] ADD [DateOfBirth] datetime2 NULL;
                END
                IF COL_LENGTH('Technicians', 'VehicleType') IS NULL
                BEGIN
                    ALTER TABLE [Technicians] ADD [VehicleType] nvarchar(100) NULL;
                END
                IF COL_LENGTH('Technicians', 'VehicleName') IS NULL
                BEGIN
                    ALTER TABLE [Technicians] ADD [VehicleName] nvarchar(150) NULL;
                END
                IF COL_LENGTH('Technicians', 'VehiclePlate') IS NULL
                BEGIN
                    ALTER TABLE [Technicians] ADD [VehiclePlate] nvarchar(50) NULL;
                END");

            await context.Database.ExecuteSqlRawAsync(@"
                UPDATE [Technicians]
                SET [DateOfBirth] = COALESCE([DateOfBirth], '1995-01-01'),
                    [VehicleType] = COALESCE(NULLIF([VehicleType], ''), 'Service Van'),
                    [VehicleName] = COALESCE(NULLIF([VehicleName], ''), 'Suzuki Carry 2022'),
                    [VehiclePlate] = COALESCE(NULLIF([VehiclePlate], ''), N'س ص ع 4821')
                WHERE [Id] = '11111111-1111-1111-1111-111111111111';");

            var demoTech = await context.Technicians.FirstOrDefaultAsync(t => t.Id == Guid.Parse("11111111-1111-1111-1111-111111111111"));
            if (demoTech != null && (demoTech.VerifiedEquipment == null || demoTech.VerifiedEquipment.Count == 0))
            {
                demoTech.VerifiedEquipment = new List<string>
                {
                    "Pressure Washer 2200 PSI",
                    "Wet & Dry Vacuum Extractor",
                    "120L Water Tank & Generator",
                    "Microfiber Detailing Kit"
                };
                context.Entry(demoTech).Property(t => t.VerifiedEquipment).IsModified = true;
                await context.SaveChangesAsync();
            }

            // Backfill trip timestamps for legacy completed bookings that predate milestone tracking
            var legacyCompleted = await context.Bookings
                .Include(b => b.ServicePackage)
                .Where(b => b.Status == BookingStatus.COMPLETED && b.CompletedAt == null)
                .ToListAsync();
            if (legacyCompleted.Any())
            {
                foreach (var b in legacyCompleted)
                {
                    var workMins = Math.Max(30, b.ServicePackage?.DurationMinutes ?? 45);
                    b.AcceptedAt ??= b.ScheduledAt.AddMinutes(-35);
                    b.OnTheWayAt ??= b.ScheduledAt.AddMinutes(-20);
                    b.ArrivedAt ??= b.ScheduledAt.AddMinutes(-5);
                    b.WashingStartedAt ??= b.ScheduledAt;
                    b.CompletedAt ??= b.ScheduledAt.AddMinutes(workMins);
                }
                await context.SaveChangesAsync();
            }

            // Always ensure catalog tables (Zone, ServicePackages, AddOns) are seeded
            var zone = await context.ServiceZones.FirstOrDefaultAsync();
            if (zone == null)
            {
                zone = new ServiceZone
                {
                    Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    ZoneName = "East Cairo - Nasr City",
                    Status = ZoneStatus.ACTIVE,
                    BaseDistanceSurcharge = 20f,
                    PeakSurgeMultiplier = 1.0f,
                    MaxTechnicians = 10,
                    PolygonBoundary = new List<Point>
                    {
                        new(30.05f, 31.34f),
                        new(30.08f, 31.32f),
                        new(30.02f, 31.49f)
                    }
                };
                context.ServiceZones.Add(zone);
            }

            ServicePackage pkgPremium;
            ServicePackage pkgDeep;
            ServicePackage pkgBasic;
            ServicePackage pkgUltimate;

            if (!await context.ServicePackages.AnyAsync())
            {
                pkgPremium = new ServicePackage
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001"),
                    Name = "Premium Wash",
                    BasePrice = 350f,
                    DurationMinutes = 60,
                    RequiresWater = true,
                    RequiresElectricity = true
                };
                pkgDeep = new ServicePackage
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002"),
                    Name = "Deep Clean",
                    BasePrice = 500f,
                    DurationMinutes = 90,
                    RequiresWater = true,
                    RequiresElectricity = true
                };
                pkgBasic = new ServicePackage
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003"),
                    Name = "Basic Wash",
                    BasePrice = 200f,
                    DurationMinutes = 30,
                    RequiresWater = true
                };
                pkgUltimate = new ServicePackage
                {
                    Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004"),
                    Name = "Ultimate Detail",
                    BasePrice = 700f,
                    DurationMinutes = 140,
                    RequiresWater = true,
                    RequiresElectricity = true,
                    RequiresPrivateParking = true
                };
                context.ServicePackages.AddRange(pkgPremium, pkgDeep, pkgBasic, pkgUltimate);
            }
            else
            {
                pkgPremium = await context.ServicePackages.FirstAsync(p => p.Id == Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001"));
                pkgDeep = await context.ServicePackages.FirstAsync(p => p.Id == Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002"));
                pkgBasic = await context.ServicePackages.FirstAsync(p => p.Id == Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003"));
                pkgUltimate = await context.ServicePackages.FirstAsync(p => p.Id == Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004"));
            }

            if (!await context.AddOns.AnyAsync())
            {
                context.AddOns.AddRange(
                    new AddOn { Id = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaa0001"), Name = "Engine Bay Steam Cleaning", Price = 150f, Description = "Degrease and steam-clean engine compartment safely", IsActive = true },
                    new AddOn { Id = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaa0002"), Name = "Ozone Odor & Bacteria Elimination", Price = 120f, Description = "Medical-grade ozone treatment to destroy stubborn odors", IsActive = true },
                    new AddOn { Id = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaa0003"), Name = "Leather Deep Feed & UV Shield", Price = 100f, Description = "Protective hydrophobic barrier against cracking and fading", IsActive = true },
                    new AddOn { Id = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaa0004"), Name = "Rain-X Hydrophobic Glass Coat", Price = 80f, Description = "Repels rainwater and dirt for superior night driving clarity", IsActive = true }
                );
            }

            if (!await context.Admins.AnyAsync())
            {
                context.Admins.Add(new Admin
                {
                    Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddd0001"),
                    FullName = "Admin Operations",
                    Email = "admin@eghselha.com",
                    Phone = "+20 100 000 0001",
                    PasswordHash = PasswordHasher.Hash("admin123"),
                    Permissions = "FULL_ACCESS",
                    LastLogin = DateTime.UtcNow
                });
            }

            if (!await context.TechnicianApplications.AnyAsync())
            {
                var existingTech = await context.Technicians.FirstOrDefaultAsync();
                if (existingTech != null)
                {
                    context.TechnicianApplications.Add(new TechnicianApplication
                    {
                        TechnicianId = existingTech.Id,
                        Status = "Approved",
                        HasPressureWasher = true,
                        HasVacuumExtractor = true,
                        HasWaterTankGenerator = true,
                        HasVehicle = true,
                        SubmittedAt = DateTime.UtcNow.AddDays(-7)
                    });
                }
            }

            await context.SaveChangesAsync();

            await UpgradeLegacyDemoPasswordsAsync(context);

            if (await context.Technicians.AnyAsync())
            {
                return; // DB users/bookings already seeded
            }

            // 3. Technician (Mostafa Ali)
            var techId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var technician = new Technician
            {
                Id = techId,
                FullName = "Mostafa Ali",
                Email = "mostafa.ali@email.com",
                Phone = "+20 100 123 4567",
                PasswordHash = PasswordHasher.Hash("demo123"),
                NationalId = "29501011234567",
                DateOfBirth = new DateTime(1995, 1, 1),
                VehicleType = "Service Van",
                VehicleName = "Suzuki Carry 2022",
                VehiclePlate = "س ص ع 4821",
                VerifiedEquipment = new List<string>
                {
                    "Pressure Washer 2200 PSI",
                    "Wet & Dry Vacuum Extractor",
                    "120L Water Tank & Generator",
                    "Microfiber Detailing Kit"
                },
                Rating = 4.9f,
                AcceptanceRate = 98f,
                TodayEarnings = 245f,
                TotalBalance = 735f,
                ServiceArea = "Nasr City, Cairo",
                ShortBio = "Professional car care technician with 3+ years of experience.",
                WorkingDays = "Sunday – Thursday",
                WorkingHours = "09:00 AM – 06:00 PM",
                IsOnline = true,
                PushNotificationsEnabled = true,
                SmsNotificationsEnabled = false,
                EmailNotificationsEnabled = true,
                ServiceZoneId = zone.Id
            };
            context.Technicians.Add(technician);

            // 4. Customers
            var custAhmed = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001"),
                FullName = "Ahmed Khaled",
                Phone = "+20 100 999 1111",
                Email = "ahmed.khaled@example.com",
                PasswordHash = PasswordHasher.Hash("demo123"),
                GateNotes = "Gate 3, Villa 22. Please call upon arrival."
            };
            var custSara = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0002"),
                FullName = "Sara Mahmoud",
                Phone = "+20 101 222 3333",
                Email = "sara.mahmoud@example.com",
                PasswordHash = PasswordHasher.Hash("demo123")
            };
            var custOmar = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0003"),
                FullName = "Omar Hassan",
                Phone = "+20 102 333 4444",
                Email = "omar.hassan@example.com",
                PasswordHash = PasswordHasher.Hash("demo123")
            };
            var custMariam = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0004"),
                FullName = "Mariam Adel",
                Phone = "+20 103 444 5555",
                Email = "mariam.adel@example.com",
                PasswordHash = PasswordHasher.Hash("demo123")
            };
            context.Customers.AddRange(custAhmed, custSara, custOmar, custMariam);

            // 5. Vehicles
            var vElantra = new Vehicle { Id = Guid.NewGuid(), CustomerId = custAhmed.Id, Make = "Hyundai", Model = "Elantra", Year = 2022, Color = "Silver", LicensePlate = "ABC 123", SizeType = VehicleSize.SEDAN };
            var vSportage = new Vehicle { Id = Guid.NewGuid(), CustomerId = custSara.Id, Make = "Kia", Model = "Sportage", Year = 2023, Color = "Black", LicensePlate = "XYZ 456", SizeType = VehicleSize.SUV };
            var vSunny = new Vehicle { Id = Guid.NewGuid(), CustomerId = custOmar.Id, Make = "Nissan", Model = "Sunny", Year = 2021, Color = "White", LicensePlate = "DEF 789", SizeType = VehicleSize.SEDAN };
            var vX5 = new Vehicle { Id = Guid.NewGuid(), CustomerId = custMariam.Id, Make = "BMW", Model = "X5", Year = 2024, Color = "Blue", LicensePlate = "GHI 101", SizeType = VehicleSize.SUV };
            context.Vehicles.AddRange(vElantra, vSportage, vSunny, vX5);

            // 6. Bookings
            var now = DateTime.UtcNow;
            var b1 = new Booking
            {
                Id = Guid.NewGuid(),
                BookingNumber = "#BK-0024",
                CustomerId = custAhmed.Id,
                TechnicianId = technician.Id,
                VehicleId = vElantra.Id,
                ServicePackageId = pkgPremium.Id,
                ServiceZoneId = zone.Id,
                Status = BookingStatus.WASHING, // In Progress
                BookingType = BookingType.FAST_TRACK,
                ScheduledAt = DateTime.Today.AddHours(10),
                TotalPrice = 350f,
                Address = "Cairo, Nasr City",
                DistanceText = "3.2 km",
                ParkingLatitude = 30.0561f,
                ParkingLongitude = 31.3414f,
                ParkingType = ParkingType.STREET
            };

            var b2 = new Booking
            {
                Id = Guid.NewGuid(),
                BookingNumber = "#BK-0025",
                CustomerId = custSara.Id,
                TechnicianId = technician.Id,
                VehicleId = vSportage.Id,
                ServicePackageId = pkgDeep.Id,
                ServiceZoneId = zone.Id,
                Status = BookingStatus.DISPATCHED, // Upcoming
                BookingType = BookingType.SCHEDULED,
                ScheduledAt = DateTime.Today.AddHours(12).AddMinutes(30),
                TotalPrice = 500f,
                Address = "Cairo, Heliopolis",
                DistanceText = "5.1 km",
                ParkingLatitude = 30.0889f,
                ParkingLongitude = 31.3285f,
                ParkingType = ParkingType.DRIVEWAY
            };

            var b3 = new Booking
            {
                Id = Guid.NewGuid(),
                BookingNumber = "#BK-0026",
                CustomerId = custOmar.Id,
                TechnicianId = technician.Id,
                VehicleId = vSunny.Id,
                ServicePackageId = pkgBasic.Id,
                ServiceZoneId = zone.Id,
                Status = BookingStatus.DISPATCHED, // Upcoming
                BookingType = BookingType.SCHEDULED,
                ScheduledAt = DateTime.Today.AddHours(15),
                TotalPrice = 200f,
                Address = "Cairo, Maadi",
                DistanceText = "7.4 km",
                ParkingLatitude = 29.9602f,
                ParkingLongitude = 31.2569f,
                ParkingType = ParkingType.STREET
            };

            var b4 = new Booking
            {
                Id = Guid.NewGuid(),
                BookingNumber = "#BK-0021",
                CustomerId = custMariam.Id,
                TechnicianId = technician.Id,
                VehicleId = vX5.Id,
                ServicePackageId = pkgUltimate.Id,
                ServiceZoneId = zone.Id,
                Status = BookingStatus.COMPLETED,
                BookingType = BookingType.SCHEDULED,
                ScheduledAt = DateTime.Today.AddDays(-1).AddHours(13),
                TotalPrice = 700f,
                Address = "Cairo, New Cairo",
                DistanceText = "10.2 km",
                ParkingLatitude = 30.0278f,
                ParkingLongitude = 31.4913f,
                ParkingType = ParkingType.PRIVATE_GARAGE
            };
            context.Bookings.AddRange(b1, b2, b3, b4);

            // 7. Notifications
            context.Notifications.AddRange(
                new Notification { UserId = techId, Title = "Booking assigned", Description = "You have received a new booking #BK-0026.", CreatedAt = now.AddMinutes(-5), Type = "BriefcaseBusiness", IsRead = false },
                new Notification { UserId = techId, Title = "Customer update", Description = "Ahmed Khaled confirmed the service details.", CreatedAt = now.AddMinutes(-35), Type = "UserRound", IsRead = true },
                new Notification { UserId = techId, Title = "Payout processed", Description = "Your payout of EGP 1,200 has been processed.", CreatedAt = now.AddDays(-1), Type = "Wallet", IsRead = true },
                new Notification { UserId = techId, Title = "Great feedback!", Description = "You received a 5-star review from Mariam.", CreatedAt = now.AddDays(-1), Type = "Star", IsRead = true }
            );

            await context.SaveChangesAsync();
        }

        private static async Task UpgradeLegacyDemoPasswordsAsync(CarWashDbContext context)
        {
            var demoPasswords = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["admin@eghselha.com"] = "admin123",
                ["mostafa.ali@email.com"] = "demo123",
                ["ahmed.khaled@example.com"] = "demo123",
                ["sara.mahmoud@example.com"] = "demo123",
                ["omar.hassan@example.com"] = "demo123",
                ["mariam.adel@example.com"] = "demo123"
            };

            var users = await context.Users.ToListAsync();
            var changed = false;
            foreach (var user in users)
            {
                if (!PasswordHasher.IsHashed(user.PasswordHash))
                {
                    var rawPassword = demoPasswords.TryGetValue(user.Email, out var pwd) ? pwd : "demo123";
                    user.PasswordHash = PasswordHasher.Hash(rawPassword);
                    changed = true;
                }
            }

            if (changed)
            {
                await context.SaveChangesAsync();
            }
        }
    }
}

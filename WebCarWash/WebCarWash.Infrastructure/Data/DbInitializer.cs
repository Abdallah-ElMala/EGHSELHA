using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(CarWashDbContext context)
        {
            // Ensure Database is created / migrated
            await context.Database.EnsureCreatedAsync();

            if (await context.Technicians.AnyAsync())
            {
                return; // DB has been seeded
            }

            // 1. Service Zone
            var zone = new ServiceZone
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

            // 2. Service Packages
            var pkgPremium = new ServicePackage
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001"),
                Name = "Premium Wash",
                BasePrice = 350f,
                DurationMinutes = 60,
                RequiresWater = true,
                RequiresElectricity = true
            };
            var pkgDeep = new ServicePackage
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002"),
                Name = "Deep Clean",
                BasePrice = 500f,
                DurationMinutes = 90,
                RequiresWater = true,
                RequiresElectricity = true
            };
            var pkgBasic = new ServicePackage
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003"),
                Name = "Basic Wash",
                BasePrice = 200f,
                DurationMinutes = 30,
                RequiresWater = true
            };
            var pkgUltimate = new ServicePackage
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004"),
                Name = "Ultimate Detail",
                BasePrice = 700f,
                DurationMinutes = 120,
                RequiresWater = true,
                RequiresElectricity = true,
                RequiresPrivateParking = true
            };
            context.ServicePackages.AddRange(pkgPremium, pkgDeep, pkgBasic, pkgUltimate);

            // 3. Technician (Mostafa Ali)
            var techId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var technician = new Technician
            {
                Id = techId,
                FullName = "Mostafa Ali",
                Email = "mostafa.ali@email.com",
                Phone = "+20 100 123 4567",
                PasswordHash = "hashed_demo_password",
                NationalId = "29501011234567",
                Rating = 4.9f,
                AcceptanceRate = 98f,
                TodayEarnings = 850f,
                TotalBalance = 8450f,
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
                PasswordHash = "hash1"
            };
            var custSara = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0002"),
                FullName = "Sara Mahmoud",
                Phone = "+20 101 222 3333",
                Email = "sara.mahmoud@example.com",
                PasswordHash = "hash2"
            };
            var custOmar = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0003"),
                FullName = "Omar Hassan",
                Phone = "+20 102 333 4444",
                Email = "omar.hassan@example.com",
                PasswordHash = "hash3"
            };
            var custMariam = new Customer
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0004"),
                FullName = "Mariam Adel",
                Phone = "+20 103 444 5555",
                Email = "mariam.adel@example.com",
                PasswordHash = "hash4"
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
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebCarWash.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AddOns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<float>(type: "real", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddOns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServicePackages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BasePrice = table.Column<float>(type: "real", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    RequiresElectricity = table.Column<bool>(type: "bit", nullable: false),
                    RequiresWater = table.Column<bool>(type: "bit", nullable: false),
                    RequiresPrivateParking = table.Column<bool>(type: "bit", nullable: false),
                    RequiresCustomerReturn = table.Column<bool>(type: "bit", nullable: false),
                    IncludedServices = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicePackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    IsPhoneVerified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Permissions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Admins_Users_Id",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalletBalance = table.Column<float>(type: "real", nullable: false),
                    LoyaltyPoints = table.Column<int>(type: "int", nullable: false),
                    SavedAddresses = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customers_Users_Id",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceZones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ZoneName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    PolygonBoundary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BaseDistanceSurcharge = table.Column<float>(type: "real", nullable: false),
                    PeakSurgeMultiplier = table.Column<float>(type: "real", nullable: false),
                    MaxTechnicians = table.Column<int>(type: "int", nullable: false),
                    AdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceZones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceZones_Admins_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Make = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LicensePlate = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SizeType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SizeMultiplier = table.Column<float>(type: "real", nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Technicians",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NationalId = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    IsOnline = table.Column<bool>(type: "bit", nullable: false),
                    CurrentLatitude = table.Column<float>(type: "real", nullable: false),
                    CurrentLongitude = table.Column<float>(type: "real", nullable: false),
                    Rating = table.Column<float>(type: "real", nullable: false),
                    AcceptanceRate = table.Column<float>(type: "real", nullable: false),
                    TodayEarnings = table.Column<float>(type: "real", nullable: false),
                    TotalBalance = table.Column<float>(type: "real", nullable: false),
                    VanLevel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VerifiedEquipment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShortBio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkingDays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkingHours = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PushNotificationsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SmsNotificationsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    EmailNotificationsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceZoneId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Technicians", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Technicians_ServiceZones_ServiceZoneId",
                        column: x => x.ServiceZoneId,
                        principalTable: "ServiceZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Technicians_Users_Id",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BookingType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ParkingLatitude = table.Column<float>(type: "real", nullable: false),
                    ParkingLongitude = table.Column<float>(type: "real", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DistanceText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParkingType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    HasElectricity = table.Column<bool>(type: "bit", nullable: false),
                    HasWaterAccess = table.Column<bool>(type: "bit", nullable: false),
                    BasePackagePrice = table.Column<float>(type: "real", nullable: false),
                    VehicleMultiplier = table.Column<float>(type: "real", nullable: false),
                    AddOnsSubtotal = table.Column<float>(type: "real", nullable: false),
                    DistanceSurcharge = table.Column<float>(type: "real", nullable: false),
                    PeakSurgeMultiplier = table.Column<float>(type: "real", nullable: false),
                    UpsellTotal = table.Column<float>(type: "real", nullable: false),
                    TotalPrice = table.Column<float>(type: "real", nullable: false),
                    DepositAmount = table.Column<float>(type: "real", nullable: false, defaultValue: 200f),
                    RemainingBalance = table.Column<float>(type: "real", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicePackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceZoneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_ServicePackages_ServicePackageId",
                        column: x => x.ServicePackageId,
                        principalTable: "ServicePackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_ServiceZones_ServiceZoneId",
                        column: x => x.ServiceZoneId,
                        principalTable: "ServiceZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Technicians_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Technicians",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payouts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<float>(type: "real", nullable: false),
                    PayoutMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountDetails = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payouts_Technicians_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Technicians",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TechnicianApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HasPressureWasher = table.Column<bool>(type: "bit", nullable: false),
                    HasVacuumExtractor = table.Column<bool>(type: "bit", nullable: false),
                    HasWaterTankGenerator = table.Column<bool>(type: "bit", nullable: false),
                    HasVehicle = table.Column<bool>(type: "bit", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicianApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicianApplications_Admins_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TechnicianApplications_Technicians_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Technicians",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookingAddOns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddOnId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PriceAtBooking = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingAddOns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookingAddOns_AddOns_AddOnId",
                        column: x => x.AddOnId,
                        principalTable: "AddOns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingAddOns_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Disputes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EvidenceUrls = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FiledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Disputes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Disputes_Admins_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Disputes_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Disputes_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InspectionUpsells",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicianNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    EvidencePhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AdditionalPrice = table.Column<float>(type: "real", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionUpsells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InspectionUpsells_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Subtotal = table.Column<float>(type: "real", nullable: false),
                    AddOnsTotal = table.Column<float>(type: "real", nullable: false),
                    DistanceFee = table.Column<float>(type: "real", nullable: false),
                    DepositPaid = table.Column<float>(type: "real", nullable: false),
                    FinalPaid = table.Column<float>(type: "real", nullable: false),
                    TotalAmount = table.Column<float>(type: "real", nullable: false),
                    VatAmount = table.Column<float>(type: "real", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PayoutAmount = table.Column<float>(type: "real", nullable: false),
                    OfferedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobOffers_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobOffers_Technicians_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Technicians",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<float>(type: "real", nullable: false),
                    PaymentType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TransactionRef = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhotoQAs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PhotoType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GpsLatitude = table.Column<float>(type: "real", nullable: false),
                    GpsLongitude = table.Column<float>(type: "real", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotoQAs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhotoQAs_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PunctualityRating = table.Column<int>(type: "int", nullable: false),
                    CleanlinessRating = table.Column<int>(type: "int", nullable: false),
                    ProfessionalismRating = table.Column<int>(type: "int", nullable: false),
                    AverageRating = table.Column<float>(type: "real", nullable: false),
                    SelectedTags = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipAmount = table.Column<float>(type: "real", nullable: false),
                    CommentText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TechnicianDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicianDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicianDocuments_TechnicianApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "TechnicianApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingAddOns_AddOnId",
                table: "BookingAddOns",
                column: "AddOnId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingAddOns_BookingId",
                table: "BookingAddOns",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingNumber",
                table: "Bookings",
                column: "BookingNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CustomerId",
                table: "Bookings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ServicePackageId",
                table: "Bookings",
                column: "ServicePackageId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ServiceZoneId",
                table: "Bookings",
                column: "ServiceZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TechnicianId",
                table: "Bookings",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_VehicleId",
                table: "Bookings",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_AdminId",
                table: "Disputes",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_BookingId",
                table: "Disputes",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_CustomerId",
                table: "Disputes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionUpsells_BookingId",
                table: "InspectionUpsells",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_BookingId",
                table: "Invoices",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_BookingId",
                table: "JobOffers",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TechnicianId",
                table: "JobOffers",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingId",
                table: "Payments",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Payouts_TechnicianId",
                table: "Payouts",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_PhotoQAs_BookingId",
                table: "PhotoQAs",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_BookingId",
                table: "Reviews",
                column: "BookingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerId",
                table: "Reviews",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceZones_AdminId",
                table: "ServiceZones",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_TechnicianApplications_AdminId",
                table: "TechnicianApplications",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_TechnicianApplications_TechnicianId",
                table: "TechnicianApplications",
                column: "TechnicianId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TechnicianDocuments_ApplicationId",
                table: "TechnicianDocuments",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Technicians_NationalId",
                table: "Technicians",
                column: "NationalId",
                unique: true,
                filter: "[NationalId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Technicians_ServiceZoneId",
                table: "Technicians",
                column: "ServiceZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CustomerId",
                table: "Vehicles",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingAddOns");

            migrationBuilder.DropTable(
                name: "Disputes");

            migrationBuilder.DropTable(
                name: "InspectionUpsells");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "JobOffers");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Payouts");

            migrationBuilder.DropTable(
                name: "PhotoQAs");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "TechnicianDocuments");

            migrationBuilder.DropTable(
                name: "AddOns");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "TechnicianApplications");

            migrationBuilder.DropTable(
                name: "ServicePackages");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Technicians");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "ServiceZones");

            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

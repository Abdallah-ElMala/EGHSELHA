using System.Reflection;
using EGHSELHA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace EGHSELHA.Infrastructure.DBContext
{

    public class EGHSELHADbContext : DbContext
    {
        public EGHSELHADbContext()
        {
        }

        public EGHSELHADbContext(DbContextOptions<EGHSELHADbContext> options)
            : base(options)
        {
        }

        // جميع الجداول (20 كلاس) مرتبة أبجدياً (A-Z)
        public DbSet<AddOn> AddOns => Set<AddOn>();
        public DbSet<Admin> Admins => Set<Admin>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<BookingAddOn> BookingAddOns => Set<BookingAddOn>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Dispute> Disputes => Set<Dispute>();
        public DbSet<InspectionUpsell> InspectionUpsells => Set<InspectionUpsell>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<JobOffer> JobOffers => Set<JobOffer>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Payout> Payouts => Set<Payout>();
        public DbSet<PhotoQA> PhotoQAs => Set<PhotoQA>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ServicePackage> ServicePackages => Set<ServicePackage>();
        public DbSet<ServiceZone> ServiceZones => Set<ServiceZone>();
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<TechnicianApplication> TechnicianApplications => Set<TechnicianApplication>();
        public DbSet<TechnicianDocument> TechnicianDocuments => Set<TechnicianDocument>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(
                    "Server=.;Database=EGHSELHA;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // تجاهل كلاس Point كجدول مستقل لأنه يُخزن كـ JSON داخل جدول ServiceZones
            modelBuilder.Ignore<Point>();

            // قراءة وتطبيق جميع ملفات الـ Configuration الـ 20 تلقائياً
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
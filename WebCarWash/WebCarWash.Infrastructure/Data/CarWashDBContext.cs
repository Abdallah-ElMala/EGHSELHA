using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Domain.Entities;

namespace WebCarWash.Infrastructure.Data
{
    public class CarWashDbContext : DbContext
    {
        public CarWashDbContext(
            DbContextOptions<CarWashDbContext> options)
            : base(options)
        {
        }

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
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ServicePackage> ServicePackages => Set<ServicePackage>();
        public DbSet<ServiceZone> ServiceZones => Set<ServiceZone>();
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<TechnicianApplication> TechnicianApplications => Set<TechnicianApplication>();
        public DbSet<TechnicianDocument> TechnicianDocuments => Set<TechnicianDocument>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(
                Assembly.GetExecutingAssembly());
        }
    }
}

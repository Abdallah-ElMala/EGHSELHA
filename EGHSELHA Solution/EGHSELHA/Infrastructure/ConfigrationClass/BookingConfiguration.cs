using EGHSELHA.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Infrastructure.ConfigrationClass
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings");
            builder.HasKey(b => b.Id);
            builder.Property(b => b.BookingNumber).IsRequired().HasMaxLength(50);
            builder.HasIndex(b => b.BookingNumber).IsUnique();
            builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(b => b.BookingType).HasConversion<string>().HasMaxLength(40).IsRequired();
            builder.Property(b => b.ParkingType).HasConversion<string>().HasMaxLength(40).IsRequired();
            builder.Property(b => b.DepositAmount).HasDefaultValue(200f);

            builder.HasOne(b => b.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Technician)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TechnicianId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Vehicle)
                .WithMany(v => v.Bookings)
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.ServicePackage)
                .WithMany(sp => sp.Bookings)
                .HasForeignKey(b => b.ServicePackageId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.ServiceZone)
                .WithMany(sz => sz.Bookings)
                .HasForeignKey(b => b.ServiceZoneId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

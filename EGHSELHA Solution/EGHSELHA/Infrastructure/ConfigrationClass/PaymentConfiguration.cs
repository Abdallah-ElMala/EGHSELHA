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
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.PaymentType).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(p => p.PaymentMethod).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(p => p.TransactionRef).HasMaxLength(150);

            builder.HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

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
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.ToTable("Invoices");
            builder.HasKey(i => i.Id);
            builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
            builder.HasIndex(i => i.InvoiceNumber).IsUnique();

            builder.HasOne(i => i.Booking)
                .WithOne(b => b.Invoice)
                .HasForeignKey<Invoice>(i => i.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

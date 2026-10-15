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
    public class DisputeConfiguration : IEntityTypeConfiguration<Dispute>
    {
        public void Configure(EntityTypeBuilder<Dispute> builder)
        {
            builder.ToTable("Disputes");
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Reason).IsRequired().HasMaxLength(1000);
            builder.Property(d => d.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(d => d.AdminNotes).HasMaxLength(1000);
            builder.Property(d => d.EvidenceUrls).HasConversion(JsonValueConverter.Create<string>());

            builder.HasOne(d => d.Booking)
                .WithOne(b => b.Dispute)
                .HasForeignKey<Dispute>(d => d.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(d => d.Customer)
                .WithMany(c => c.Disputes)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(d => d.Admin)
                .WithMany(a => a.Disputes)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

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
    public class InspectionUpsellConfiguration : IEntityTypeConfiguration<InspectionUpsell>
    {
        public void Configure(EntityTypeBuilder<InspectionUpsell> builder)
        {
            builder.ToTable("InspectionUpsells");
            builder.HasKey(iu => iu.Id);
            builder.Property(iu => iu.TechnicianNote).IsRequired().HasMaxLength(1000);
            builder.Property(iu => iu.EvidencePhotoUrl).IsRequired().HasMaxLength(500);
            builder.Property(iu => iu.Status).HasConversion<string>().HasMaxLength(30).IsRequired();

            builder.HasOne(iu => iu.Booking)
                .WithOne(b => b.InspectionUpsell)
                .HasForeignKey<InspectionUpsell>(iu => iu.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

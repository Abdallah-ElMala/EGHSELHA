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
    public class JobOfferConfiguration : IEntityTypeConfiguration<JobOffer>
    {
        public void Configure(EntityTypeBuilder<JobOffer> builder)
        {
            builder.ToTable("JobOffers");
            builder.HasKey(jo => jo.Id);
            builder.Property(jo => jo.Status).HasConversion<string>().HasMaxLength(30).IsRequired();

            builder.HasOne(jo => jo.Booking)
                .WithMany(b => b.JobOffers)
                .HasForeignKey(jo => jo.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(jo => jo.Technician)
                .WithMany(t => t.JobOffers)
                .HasForeignKey(jo => jo.TechnicianId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

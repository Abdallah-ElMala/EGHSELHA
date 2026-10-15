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
    public class TechnicianApplicationConfiguration : IEntityTypeConfiguration<TechnicianApplication>
    {
        public void Configure(EntityTypeBuilder<TechnicianApplication> builder)
        {
            builder.ToTable("TechnicianApplications");
            builder.HasKey(ta => ta.Id);
            builder.Property(ta => ta.Status).IsRequired().HasMaxLength(50);

            builder.HasOne(ta => ta.Technician)
                .WithOne(t => t.TechnicianApplication)
                .HasForeignKey<TechnicianApplication>(ta => ta.TechnicianId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ta => ta.Admin)
                .WithMany(a => a.TechnicianApplications)
                .HasForeignKey(ta => ta.AdminId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

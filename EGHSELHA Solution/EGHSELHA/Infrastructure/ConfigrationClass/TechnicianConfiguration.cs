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
    public class TechnicianConfiguration : IEntityTypeConfiguration<Technician>
    {
        public void Configure(EntityTypeBuilder<Technician> builder)
        {
            builder.ToTable("Technicians");
            builder.Property(t => t.NationalId).IsRequired().HasMaxLength(14);
            builder.HasIndex(t => t.NationalId).IsUnique();
            builder.Property(t => t.VanLevel).HasMaxLength(100);
            builder.Property(t => t.VerifiedEquipment).HasConversion(JsonValueConverter.Create<string>());

            builder.HasOne(t => t.ServiceZone)
                .WithMany(z => z.Technicians)
                .HasForeignKey(t => t.ServiceZoneId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }

}

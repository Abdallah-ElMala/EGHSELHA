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
    public class ServiceZoneConfiguration : IEntityTypeConfiguration<ServiceZone>
    {
        public void Configure(EntityTypeBuilder<ServiceZone> builder)
        {
            builder.ToTable("ServiceZones");
            builder.HasKey(sz => sz.Id);
            builder.Property(sz => sz.ZoneName).IsRequired().HasMaxLength(120);
            builder.Property(sz => sz.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(sz => sz.PolygonBoundary).HasConversion(JsonValueConverter.Create<Point>());

            builder.HasOne(sz => sz.Admin)
                .WithMany(a => a.ServiceZones)
                .HasForeignKey(sz => sz.AdminId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

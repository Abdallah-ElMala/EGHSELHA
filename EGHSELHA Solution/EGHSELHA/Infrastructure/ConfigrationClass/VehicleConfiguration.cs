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
    public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
    {
        public void Configure(EntityTypeBuilder<Vehicle> builder)
        {
            builder.ToTable("Vehicles");
            builder.HasKey(v => v.Id);
            builder.Property(v => v.Make).IsRequired().HasMaxLength(80);
            builder.Property(v => v.Model).IsRequired().HasMaxLength(80);
            builder.Property(v => v.Color).IsRequired().HasMaxLength(50);
            builder.Property(v => v.LicensePlate).IsRequired().HasMaxLength(30);
            builder.Property(v => v.SizeType).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(v => v.PhotoUrl).HasMaxLength(500);
        }
    }
}

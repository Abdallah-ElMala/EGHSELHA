using WebCarWash.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace WebCarWash.Infrastructure.ConfigrationClass
{
    public class ServiceZoneConfiguration
        : IEntityTypeConfiguration<ServiceZone>
    {
        public void Configure(EntityTypeBuilder<ServiceZone> builder)
        {
            builder.ToTable("ServiceZones");

            builder.HasKey(sz => sz.Id);

            builder.Property(sz => sz.ZoneName)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(sz => sz.Status)
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();

            // Store the polygon coordinates as JSON in SQL Server.
            builder.Property(sz => sz.PolygonBoundary)
                .HasConversion(JsonValueConverter.Create<Point>())
                .HasColumnType("nvarchar(max)");

            builder.HasOne(sz => sz.Admin)
                .WithMany(a => a.ServiceZones)
                .HasForeignKey(sz => sz.AdminId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
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
    public class ServicePackageConfiguration : IEntityTypeConfiguration<ServicePackage>
    {
        public void Configure(EntityTypeBuilder<ServicePackage> builder)
        {
            builder.ToTable("ServicePackages");
            builder.HasKey(sp => sp.Id);
            builder.Property(sp => sp.Name).IsRequired().HasMaxLength(100);
            builder.Property(sp => sp.IncludedServices).HasConversion(JsonValueConverter.Create<string>());
        }
    }
}

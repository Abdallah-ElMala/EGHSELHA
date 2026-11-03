using WebCarWash.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace WebCarWash.Infrastructure.ConfigrationClass
{
    public class AddOnConfiguration : IEntityTypeConfiguration<AddOn>
    {
        public void Configure(EntityTypeBuilder<AddOn> builder)
        {
            builder.ToTable("AddOns");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
            builder.Property(a => a.Description).HasMaxLength(500);
        }
    }
}

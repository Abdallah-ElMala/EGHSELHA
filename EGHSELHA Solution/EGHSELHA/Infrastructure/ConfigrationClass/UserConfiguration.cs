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
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            builder.Property(u => u.Phone).IsRequired().HasMaxLength(20);
            builder.HasIndex(u => u.Phone).IsUnique();
            builder.Property(u => u.Email).IsRequired().HasMaxLength(150);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
            builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(30).IsRequired();
        }
    }
}

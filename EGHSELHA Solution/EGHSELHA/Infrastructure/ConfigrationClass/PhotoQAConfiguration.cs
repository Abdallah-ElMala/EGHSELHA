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
    public class PhotoQAConfiguration : IEntityTypeConfiguration<PhotoQA>
    {
        public void Configure(EntityTypeBuilder<PhotoQA> builder)
        {
            builder.ToTable("PhotoQAs");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.PhotoType).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(p => p.Category).HasConversion<string>().HasMaxLength(30).IsRequired();
            builder.Property(p => p.ImageUrl).IsRequired().HasMaxLength(500);

            builder.HasOne(p => p.Booking)
                .WithMany(b => b.PhotoQAs)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

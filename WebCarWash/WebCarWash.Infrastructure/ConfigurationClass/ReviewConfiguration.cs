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
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.ToTable("Reviews");
            builder.HasKey(r => r.Id);
            builder.Property(r => r.CommentText).HasMaxLength(1000);
            builder.Property(r => r.SelectedTags)
                .HasConversion(JsonValueConverter.Create<string>())
                .Metadata.SetValueComparer(JsonValueConverter.CreateComparer<string>());

            builder.HasOne(r => r.Booking)
                .WithOne(b => b.Review)
                .HasForeignKey<Review>(r => r.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Customer)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

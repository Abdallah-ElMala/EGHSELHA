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
    public class BookingAddOnConfiguration : IEntityTypeConfiguration<BookingAddOn>
    {
        public void Configure(EntityTypeBuilder<BookingAddOn> builder)
        {
            builder.ToTable("BookingAddOns");
            builder.HasKey(ba => ba.Id);

            builder.HasOne(ba => ba.Booking)
                .WithMany(b => b.BookingAddOns)
                .HasForeignKey(ba => ba.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ba => ba.AddOn)
                .WithMany(a => a.BookingAddOns)
                .HasForeignKey(ba => ba.AddOnId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

}

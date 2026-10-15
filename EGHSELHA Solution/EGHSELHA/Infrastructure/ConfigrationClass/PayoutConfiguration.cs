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
    public class PayoutConfiguration : IEntityTypeConfiguration<Payout>
    {
        public void Configure(EntityTypeBuilder<Payout> builder)
        {
            builder.ToTable("Payouts");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.PayoutMethod).IsRequired().HasMaxLength(50);
            builder.Property(p => p.AccountDetails).IsRequired().HasMaxLength(250);
            builder.Property(p => p.Status).IsRequired().HasMaxLength(30);

            builder.HasOne(p => p.Technician)
                .WithMany(t => t.Payouts)
                .HasForeignKey(p => p.TechnicianId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

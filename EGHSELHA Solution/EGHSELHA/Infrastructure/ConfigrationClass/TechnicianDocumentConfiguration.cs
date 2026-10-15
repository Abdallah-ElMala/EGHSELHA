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
    public class TechnicianDocumentConfiguration : IEntityTypeConfiguration<TechnicianDocument>
    {
        public void Configure(EntityTypeBuilder<TechnicianDocument> builder)
        {
            builder.ToTable("TechnicianDocuments");
            builder.HasKey(td => td.Id);
            builder.Property(td => td.DocumentType).IsRequired().HasMaxLength(80);
            builder.Property(td => td.FileUrl).IsRequired().HasMaxLength(500);

            builder.HasOne(td => td.Application)
                .WithMany(ta => ta.Documents)
                .HasForeignKey(td => td.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

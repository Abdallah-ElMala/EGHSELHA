using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class TechnicianDocument
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public bool IsVerified { get; set; }

        public TechnicianApplication Application { get; set; } = null!;

        public void VerifyDocument() => IsVerified = true;
        public void RejectDocument(string reason) => IsVerified = false;
    }
}

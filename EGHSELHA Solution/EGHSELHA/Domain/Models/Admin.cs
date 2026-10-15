using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Admin : User
    {
        public string Permissions { get; set; } = string.Empty;
        public DateTime? LastLogin { get; set; }

        public ICollection<ServiceZone> ServiceZones { get; set; } = new List<ServiceZone>();
        public ICollection<TechnicianApplication> TechnicianApplications { get; set; } = new List<TechnicianApplication>();
        public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

        public Admin() => Role = UserRole.ADMIN;

        public ServiceZone ConfigureZone(ServiceZone zoneData) => zoneData;
        public bool ManageServicePackage(Guid pkgId, ServicePackage data) => pkgId != Guid.Empty && data != null;
        public void ResolveDispute(Guid disputeId, string action) { }
        public void VerifyTechnician(Guid appId, string status) { }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class TechnicianApplication
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TechnicianId { get; set; }
        public Guid? AdminId { get; set; }
        public string Status { get; set; } = "Pending Review";
        public bool HasPressureWasher { get; set; }
        public bool HasVacuumExtractor { get; set; }
        public bool HasWaterTankGenerator { get; set; }
        public bool HasVehicle { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public Technician Technician { get; set; } = null!;
        public Admin? Admin { get; set; }
        public ICollection<TechnicianDocument> Documents { get; set; } = new List<TechnicianDocument>();

        public void SubmitApplication() { Status = "Pending Review"; SubmittedAt = DateTime.UtcNow; }
        public void ReviewApplication(string decision) => Status = decision;
    }
}

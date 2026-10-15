using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class ServiceZone
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ZoneName { get; set; } = string.Empty;
        public List<Point> PolygonBoundary { get; set; } = new();
        public ZoneStatus Status { get; set; } = ZoneStatus.ACTIVE;
        public float BaseDistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; } = 1.0f;
        public int MaxTechnicians { get; set; }

        public Guid? AdminId { get; set; }
        public Admin? Admin { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Technician> Technicians { get; set; } = new List<Technician>();

        public bool IsPointInside(float lat, float lng) => PolygonBoundary.Count >= 3;
        public float CalculateZoneSurcharge() => BaseDistanceSurcharge * PeakSurgeMultiplier;
    }
}

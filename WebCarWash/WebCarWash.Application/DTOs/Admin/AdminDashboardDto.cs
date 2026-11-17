using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public float TotalRevenue { get; set; }
        public float PlatformCommission { get; set; }
        public float TechnicianPayoutsTotal { get; set; }
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalTechnicians { get; set; }
        public int OnlineTechnicians { get; set; }
        public int OpenDisputes { get; set; }
        public int PendingPayoutsCount { get; set; }
        public float PendingPayoutsAmount { get; set; }
        public int PendingApplicationsCount { get; set; }
        public List<StatusCountDto> StatusBreakdown { get; set; } = new();
        public List<PackageRevenueDto> RevenueByPackage { get; set; } = new();
        public List<AdminBookingDto> RecentBookings { get; set; } = new();
    }
}

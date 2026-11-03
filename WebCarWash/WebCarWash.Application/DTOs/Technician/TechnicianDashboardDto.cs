using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianDashboardDto
    {
        public int JobsToday { get; set; }
        public string JobsTodayChange { get; set; } = "+1 from yesterday";
        public float TodayEarnings { get; set; }
        public string TodayEarningsChange { get; set; } = "+12.5% this week";
        public float Rating { get; set; }
        public int ReviewCount { get; set; }
        public float HoursWorked { get; set; } = 5.5f;

        public List<TechnicianJobSummaryDto> TodayJobs { get; set; } = new();
        public NextCustomerDto? NextCustomer { get; set; }
        public List<WeeklyPerformancePointDto> WeeklyPerformance { get; set; } = new();
        public List<ChecklistItemDto> Checklist { get; set; } = new();
    }

    public class TechnicianJobSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Distance { get; set; } = string.Empty;
    }

    public class NextCustomerDto
    {
        public string Customer { get; set; } = string.Empty;
        public string Car { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Eta { get; set; } = "12 min";
        public string Distance { get; set; } = "3.2 km";
        public string Address { get; set; } = string.Empty;
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }

    public class WeeklyPerformancePointDto
    {
        public string Day { get; set; } = string.Empty;
        public int CompletedJobs { get; set; }
    }

    public class ChecklistItemDto
    {
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "Done"; // "Done" or "Pending"
    }
}

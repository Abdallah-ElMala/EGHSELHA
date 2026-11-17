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
}

using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianEarningsDto
    {
        public float TotalEarnings { get; set; }
        public string TotalEarningsChange { get; set; } = "+18.2% this month";
        public float ThisMonth { get; set; }
        public string ThisMonthChange { get; set; } = "12 completed jobs";
        public float PendingPayout { get; set; }
        public string NextPayoutInfo { get; set; } = "Next payout Nov 05";
        public float AveragePerJob { get; set; }
        public string AverageChange { get; set; } = "Across 24 jobs";

        public List<DailyBarStatDto> Weekly { get; set; } = new();
        public List<TransactionRowDto> Transactions { get; set; } = new();
    }

    public class DailyBarStatDto
    {
        public string Day { get; set; } = string.Empty;
        public int Percentage { get; set; }
    }

    public class TransactionRowDto
    {
        public string Date { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public float Amount { get; set; }
        public string Status { get; set; } = "Paid";
    }
}

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

        public float AvailableBalance { get; set; }
        public string ChartRange { get; set; } = string.Empty;
        public float ChartTotal { get; set; }

        public List<DailyBarStatDto> Weekly { get; set; } = new();
        public List<TransactionRowDto> Transactions { get; set; } = new();
        public List<PayoutDto> Payouts { get; set; } = new();
    }
}

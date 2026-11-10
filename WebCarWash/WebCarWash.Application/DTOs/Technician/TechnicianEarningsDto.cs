using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianEarningsDto
    {
        public float TotalEarnings { get; set; }
        public float AvailableBalance { get; set; }
        public string TotalEarningsChange { get; set; } = string.Empty;
        public float ThisMonth { get; set; }
        public string ThisMonthChange { get; set; } = string.Empty;
        public float PendingPayout { get; set; }
        public string NextPayoutInfo { get; set; } = string.Empty;
        public float AveragePerJob { get; set; }
        public string AverageChange { get; set; } = string.Empty;
        public string ChartRange { get; set; } = "7d";
        public float ChartTotal { get; set; }

        public List<DailyBarStatDto> Weekly { get; set; } = new();
        public List<TransactionRowDto> Transactions { get; set; } = new();
        public List<PayoutDto> Payouts { get; set; } = new();
    }

    public class DailyBarStatDto
    {
        public string Day { get; set; } = string.Empty;
        public string DateLabel { get; set; } = string.Empty;
        public int Percentage { get; set; }
        public float Amount { get; set; }
    }

    public class TransactionRowDto
    {
        public string Date { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public float Amount { get; set; }
        public float BookingTotal { get; set; }
        public string Status { get; set; } = "Paid";
    }
}

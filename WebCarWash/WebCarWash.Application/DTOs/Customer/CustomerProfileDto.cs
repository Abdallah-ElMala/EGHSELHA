using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public string? GateNotes { get; set; }
        public List<string> SavedAddresses { get; set; } = new();
    }
}

using System;
using System.Threading.Tasks;
using WebCarWash.Domain.Entities;

namespace WebCarWash.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<User> Users { get; }
        IGenericRepository<Customer> Customers { get; }
        IGenericRepository<Technician> Technicians { get; }
        IGenericRepository<Admin> Admins { get; }
        IGenericRepository<Booking> Bookings { get; }
        IGenericRepository<Vehicle> Vehicles { get; }
        IGenericRepository<ServicePackage> ServicePackages { get; }
        IGenericRepository<AddOn> AddOns { get; }
        IGenericRepository<ServiceZone> ServiceZones { get; }
        IGenericRepository<Notification> Notifications { get; }
        IGenericRepository<Payment> Payments { get; }
        IGenericRepository<Payout> Payouts { get; }
        IGenericRepository<Review> Reviews { get; }
        IGenericRepository<Dispute> Disputes { get; }
        IGenericRepository<JobOffer> JobOffers { get; }
        IGenericRepository<InspectionUpsell> InspectionUpsells { get; }
        IGenericRepository<PhotoQA> PhotoQAs { get; }
        IGenericRepository<TechnicianApplication> TechnicianApplications { get; }
        IGenericRepository<TechnicianDocument> TechnicianDocuments { get; }
        IGenericRepository<BookingAddOn> BookingAddOns { get; }
        IGenericRepository<Invoice> Invoices { get; }

        Task<int> CompleteAsync();
    }
}

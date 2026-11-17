using System.Threading.Tasks;
using WebCarWash.Application.Interfaces.Repositories;
using WebCarWash.Domain.Entities;
using WebCarWash.Infrastructure.Data;

namespace WebCarWash.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly CarWashDbContext _context;

        public IGenericRepository<User> Users { get; }
        public IGenericRepository<Customer> Customers { get; }
        public IGenericRepository<Technician> Technicians { get; }
        public IGenericRepository<Admin> Admins { get; }
        public IGenericRepository<Booking> Bookings { get; }
        public IGenericRepository<Vehicle> Vehicles { get; }
        public IGenericRepository<ServicePackage> ServicePackages { get; }
        public IGenericRepository<AddOn> AddOns { get; }
        public IGenericRepository<ServiceZone> ServiceZones { get; }
        public IGenericRepository<Notification> Notifications { get; }
        public IGenericRepository<Payment> Payments { get; }
        public IGenericRepository<Payout> Payouts { get; }
        public IGenericRepository<Review> Reviews { get; }
        public IGenericRepository<Dispute> Disputes { get; }
        public IGenericRepository<JobOffer> JobOffers { get; }
        public IGenericRepository<InspectionUpsell> InspectionUpsells { get; }
        public IGenericRepository<PhotoQA> PhotoQAs { get; }
        public IGenericRepository<TechnicianApplication> TechnicianApplications { get; }
        public IGenericRepository<TechnicianDocument> TechnicianDocuments { get; }
        public IGenericRepository<BookingAddOn> BookingAddOns { get; }
        public IGenericRepository<Invoice> Invoices { get; }

        public UnitOfWork(CarWashDbContext context)
        {
            _context = context;

            Users = new GenericRepository<User>(_context);
            Customers = new GenericRepository<Customer>(_context);
            Technicians = new GenericRepository<Technician>(_context);
            Admins = new GenericRepository<Admin>(_context);
            Bookings = new GenericRepository<Booking>(_context);
            Vehicles = new GenericRepository<Vehicle>(_context);
            ServicePackages = new GenericRepository<ServicePackage>(_context);
            AddOns = new GenericRepository<AddOn>(_context);
            ServiceZones = new GenericRepository<ServiceZone>(_context);
            Notifications = new GenericRepository<Notification>(_context);
            Payments = new GenericRepository<Payment>(_context);
            Payouts = new GenericRepository<Payout>(_context);
            Reviews = new GenericRepository<Review>(_context);
            Disputes = new GenericRepository<Dispute>(_context);
            JobOffers = new GenericRepository<JobOffer>(_context);
            InspectionUpsells = new GenericRepository<InspectionUpsell>(_context);
            PhotoQAs = new GenericRepository<PhotoQA>(_context);
            TechnicianApplications = new GenericRepository<TechnicianApplication>(_context);
            TechnicianDocuments = new GenericRepository<TechnicianDocument>(_context);
            BookingAddOns = new GenericRepository<BookingAddOn>(_context);
            Invoices = new GenericRepository<Invoice>(_context);
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

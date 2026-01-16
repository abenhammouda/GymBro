using Microsoft.EntityFrameworkCore;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;

namespace CoachingApp.Infrastructure.Repositories;

public class CoachRepository : Repository<Coach>, ICoachRepository
{
    public CoachRepository(CoachingDbContext context) : base(context)
    {
    }

    public async Task<Coach?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<Coach?> GetByPhoneAsync(string phone)
    {
        return await _dbSet.FirstOrDefaultAsync(c => c.PhoneNumber == phone);
    }

    public async Task<Coach?> GetByEmailOrPhoneAsync(string emailOrPhone)
    {
        return await _dbSet.FirstOrDefaultAsync(c => 
            c.Email == emailOrPhone || c.PhoneNumber == emailOrPhone);
    }
}

public class AdherentRepository : Repository<Adherent>, IAdherentRepository
{
    public AdherentRepository(CoachingDbContext context) : base(context)
    {
    }

    public async Task<Adherent?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Email == email);
    }
}

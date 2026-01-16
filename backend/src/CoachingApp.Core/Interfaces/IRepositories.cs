using System.Linq.Expressions;

namespace CoachingApp.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
}

public interface ICoachRepository : IRepository<CoachingApp.Core.Entities.Coach>
{
    Task<CoachingApp.Core.Entities.Coach?> GetByEmailAsync(string email);
    Task<CoachingApp.Core.Entities.Coach?> GetByPhoneAsync(string phone);
    Task<CoachingApp.Core.Entities.Coach?> GetByEmailOrPhoneAsync(string emailOrPhone);
}

public interface IAdherentRepository : IRepository<CoachingApp.Core.Entities.Adherent>
{
    Task<CoachingApp.Core.Entities.Adherent?> GetByEmailAsync(string email);
}

using Microsoft.EntityFrameworkCore;
using UniServiceAPI.Models;

public class UniServiceContext : DbContext
{
    public UniServiceContext(DbContextOptions<UniServiceContext> options) : base(options) { }

    public DbSet<Servicio> Servicios { get; set; }

}
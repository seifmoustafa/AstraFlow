using System.Linq.Expressions;
using AstraFlow.Mapper.EntityFrameworkCore;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Mapper.EntityFrameworkCore.Tests;

public sealed class EfCoreProjectionValidationTests
{
    [Fact]
    public void ValidateProjectionTranslation_WithSqliteProjection_ReturnsSql()
    {
        using var connection = CreateConnection();
        using var dbContext = CreateDbContext(connection);
        var projection = new OrderListProjection();

        var sql = dbContext.ValidateProjectionTranslation(projection);

        sql.Should().Contain("SELECT");
        sql.Should().Contain("Orders");
    }

    [Fact]
    public void ValidateProjectionTranslations_WithRegistry_ReturnsNoFindingsForSafeProjection()
    {
        using var connection = CreateConnection();
        using var dbContext = CreateDbContext(connection);
        using var provider = CreateServices(typeof(OrderListProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var report = dbContext.ValidateProjectionTranslations(registry);

        report.Findings.Should().BeEmpty();
    }

    [Fact]
    public void ValidateProjectionTranslations_WithUnmappedSource_ReturnsFinding()
    {
        using var connection = CreateConnection();
        using var dbContext = CreateDbContext(connection);
        using var provider = CreateServices(typeof(UnmappedProjection)).BuildServiceProvider();
        var registry = provider.GetRequiredService<IProjectionRegistry>();

        var report = dbContext.ValidateProjectionTranslations(registry);

        report.Findings.Should().Contain(finding => finding.Code == "AFPEF001");
    }

    private static SqliteConnection CreateConnection()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        return connection;
    }

    private static OrdersDbContext CreateDbContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<OrdersDbContext>()
            .UseSqlite(connection)
            .Options;

        var dbContext = new OrdersDbContext(options);
        dbContext.Database.EnsureCreated();
        return dbContext;
    }

    private static ServiceCollection CreateServices(params Type[] projectionTypes)
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper(Array.Empty<Type>());
        foreach (var projectionType in projectionTypes)
        {
            foreach (var serviceType in projectionType.GetInterfaces()
                         .Where(type => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IProjection<,>)))
            {
                var arguments = serviceType.GetGenericArguments();
                services.AddScoped(projectionType);
                services.AddScoped(serviceType, provider => provider.GetRequiredService(projectionType));
                services.AddSingleton(new ProjectionDescriptor(
                    arguments[0],
                    arguments[1],
                    serviceType,
                    projectionType,
                    ServiceLifetime.Scoped));
            }
        }

        return services;
    }

    private sealed class OrdersDbContext : DbContext
    {
        public OrdersDbContext(DbContextOptions<OrdersDbContext> options)
            : base(options)
        {
        }

        public DbSet<Order> Orders => Set<Order>();
    }

    private sealed class Order
    {
        public int Id { get; set; }

        public string Number { get; set; } = "";
    }

    private sealed record OrderListItem(int Id, string Number);

    private sealed class OrderListProjection : IProjection<Order, OrderListItem>
    {
        public Expression<Func<Order, OrderListItem>> Expression =>
            order => new OrderListItem(order.Id, order.Number);
    }

    private sealed class UnmappedOrder
    {
        public int Id { get; set; }

        public string Number { get; set; } = "";
    }

    private sealed class UnmappedProjection : IProjection<UnmappedOrder, OrderListItem>
    {
        public Expression<Func<UnmappedOrder, OrderListItem>> Expression =>
            order => new OrderListItem(order.Id, order.Number);
    }
}

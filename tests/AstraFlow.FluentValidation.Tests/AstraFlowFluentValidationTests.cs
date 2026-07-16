using AstraFlow.FluentValidation;
using AstraFlow.Mediator;
using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace AstraFlow.FluentValidation.Tests;

public sealed class AstraFlowFluentValidationTests
{
    [Fact]
    public async Task ValidationBehavior_WithValidRequest_CallsNext()
    {
        var behavior = new AstraFlowValidationBehavior<CreateOrder, OrderCreated>(
            [new CreateOrderValidator()],
            Options.Create(new AstraFlowValidationOptions()));

        var result = await behavior.Handle(
            new CreateOrder("A-100", 1),
            () => Task.FromResult(new OrderCreated(Guid.Parse("11111111-1111-1111-1111-111111111111"))),
            CancellationToken.None);

        result.Id.Should().Be(Guid.Parse("11111111-1111-1111-1111-111111111111"));
    }

    [Fact]
    public async Task ValidationBehavior_AggregatesErrorsFromAllValidators()
    {
        var behavior = new AstraFlowValidationBehavior<CreateOrder, OrderCreated>(
            [new CreateOrderValidator(), new SecondCreateOrderValidator()],
            Options.Create(new AstraFlowValidationOptions()));

        var act = () => behavior.Handle(
            new CreateOrder("ABCD", 0),
            () => Task.FromResult(new OrderCreated(Guid.NewGuid())),
            CancellationToken.None);

        var exception = await act.Should().ThrowAsync<AstraFlowValidationException>();
        exception.Which.Errors.Should().HaveCount(2);
        exception.Which.ToProblemDetailsErrors().Should().ContainKey("Number");
        exception.Which.ToProblemDetailsErrors().Should().ContainKey("Quantity");
    }

    [Fact]
    public async Task ValidationBehavior_FailFastStopsAfterFirstFailingValidator()
    {
        var behavior = new AstraFlowValidationBehavior<CreateOrder, OrderCreated>(
            [new CreateOrderValidator(), new SecondCreateOrderValidator()],
            Options.Create(new AstraFlowValidationOptions
            {
                FailFast = true
            }));

        var act = () => behavior.Handle(
            new CreateOrder("ABCD", 0),
            () => Task.FromResult(new OrderCreated(Guid.NewGuid())),
            CancellationToken.None);

        var exception = await act.Should().ThrowAsync<AstraFlowValidationException>();
        exception.Which.Errors.Should().ContainSingle()
            .Which
            .PropertyName
            .Should()
            .Be("Quantity");
    }

    [Fact]
    public async Task ValidationBehavior_LocalizationHookReplacesMessage()
    {
        var behavior = new AstraFlowValidationBehavior<CreateOrder, OrderCreated>(
            [new CreateOrderValidator()],
            Options.Create(new AstraFlowValidationOptions
            {
                LocalizeMessage = failure => $"localized:{failure.PropertyName}"
            }));

        var act = () => behavior.Handle(
            new CreateOrder("", 1),
            () => Task.FromResult(new OrderCreated(Guid.NewGuid())),
            CancellationToken.None);

        var exception = await act.Should().ThrowAsync<AstraFlowValidationException>();
        exception.Which.Errors.Should().ContainSingle()
            .Which
            .Message
            .Should()
            .Be("localized:Number");
    }

    [Fact]
    public async Task VoidValidationBehavior_ThrowsBeforeNext()
    {
        var called = false;
        var behavior = new AstraFlowVoidValidationBehavior<VoidCreateOrder>(
            [new VoidCreateOrderValidator()],
            Options.Create(new AstraFlowValidationOptions()));

        var act = () => behavior.Handle(
            new VoidCreateOrder(""),
            () =>
            {
                called = true;
                return Task.CompletedTask;
            },
            CancellationToken.None);

        await act.Should().ThrowAsync<AstraFlowValidationException>();
        called.Should().BeFalse();
    }

    [Fact]
    public void AddAstraFlowFluentValidation_RegistersOpenBehaviors()
    {
        var services = new ServiceCollection();

        services.AddAstraFlowFluentValidation(options => options.FailFast = true);

        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(IPipelineBehavior<,>));
        services.Should().Contain(descriptor => descriptor.ServiceType == typeof(IRequestPipelineBehavior<>));
        using var provider = services.BuildServiceProvider();
        provider.GetRequiredService<IOptions<AstraFlowValidationOptions>>()
            .Value
            .FailFast
            .Should()
            .BeTrue();
    }

    [Fact]
    public void ValidationDiagnostics_CreateReport_GroupsByProperty()
    {
        var report = AstraFlowValidationDiagnostics.CreateReport(
            [
                new AstraFlowValidationError("Number", "Required", "NotEmptyValidator", "Error"),
                new AstraFlowValidationError("Number", "Too long", "MaximumLengthValidator", "Error"),
                new AstraFlowValidationError("Quantity", "Too small", "GreaterThanValidator", "Error")
            ]);

        report.ErrorCount.Should().Be(3);
        report.Properties.Should().Contain(property => property.PropertyName == "Number" && property.ErrorCount == 2);
    }

    private sealed record CreateOrder(string Number, int Quantity) : IRequest<OrderCreated>;

    private sealed record OrderCreated(Guid Id);

    private sealed record VoidCreateOrder(string Number) : IRequest;

    private sealed class CreateOrderValidator : AbstractValidator<CreateOrder>
    {
        public CreateOrderValidator()
        {
            RuleFor(request => request.Number).NotEmpty();
            RuleFor(request => request.Quantity).GreaterThan(0);
        }
    }

    private sealed class SecondCreateOrderValidator : AbstractValidator<CreateOrder>
    {
        public SecondCreateOrderValidator()
        {
            RuleFor(request => request.Number).MaximumLength(3);
        }
    }

    private sealed class VoidCreateOrderValidator : AbstractValidator<VoidCreateOrder>
    {
        public VoidCreateOrderValidator()
        {
            RuleFor(request => request.Number).NotEmpty();
        }
    }
}

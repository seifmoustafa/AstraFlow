# Standalone Fluent Assertions

`AstraFlow.Assertions` provides clean, framework-neutral `.Should()` assertions for values, strings, GUIDs, collections, dictionaries, and sync or async exceptions with zero dependencies on any test runner or AstraFlow runtime package.

## Installation & Quick Start

Install `AstraFlow.Assertions` in any unit or integration test project (xUnit, NUnit, MSTest, or TUnit):

```bash
dotnet add package AstraFlow.Assertions
```

Call `.Should()` on return values, strings, collections, dictionaries, or delegates directly:

```csharp
using AstraFlow.Assertions;

var items = new[] { "contracts", "mediator", "mapper" };
items.Should().HaveCount(3).And.ContainInOrder("contracts", "mediator");

var orderId = Guid.NewGuid();
orderId.Should().NotBeEmpty();

"AstraFlow".Should().StartWith("Astra").Contain("Flow");
```

## Zero-Dependency Design & Safe Output

- **Runner-agnostic:** Works cleanly across xUnit, NUnit, MSTest, TUnit, and console harnesses—throwing `AstraFlowAssertionException` on failure.
- **Standalone assembly:** Targets `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` with no references to `AstraFlow.Mediator`, `AstraFlow.Mapper`, or external assertion libraries.
- **Privacy-aware messages:** String comparisons report lengths rather than echoing full secrets, and object failure messages describe values safely without leaking sensitive raw text.

## Core Value, String, Collection, and Dictionary Assertions

| Target Type | Common Assertions |
| --- | --- |
| **Values & Objects** | `Be(expected, because)`, `NotBe`, `BeNull`, `NotBeNull`, `BeSameAs`, `NotBeSameAs`, `BeOfType<T>()`, `BeAssignableTo<T>()`, `BeInRange(min, max)`, `BeGreaterThan`, `BeLessThan`, `BeDefined()`, `HaveFlag` |
| **Booleans & GUIDs** | `BeTrue()`, `BeFalse()`, `BeEmpty()`, `NotBeEmpty()`, `Be(expectedGuid)` |
| **Strings (Ordinal)** | `Be`, `BeEmpty`, `BeNull`, `BeNullOrEmpty`, `NotBeNullOrEmpty`, `BeNullOrWhiteSpace`, `NotBeNullOrWhiteSpace`, `Contain`, `NotContain`, `StartWith`, `EndWith` |
| **Collections** | `BeEmpty`, `NotBeEmpty`, `HaveCount`, `Contain`, `NotContain`, `Equal`, `ContainSingle`, `ContainInOrder`, `OnlyContain`, `ContainKey` |
| **Dictionaries** | `ContainKey`, `NotContainKey`, `Contain(key, value)`, `ContainValue`, `HaveCount`, `BeSameAs`, `NotBeSameAs` |

Chain multiple checks seamlessly with `.And` and inspect captured single elements via `.ContainSingle().Which`:

```csharp
var settings = new Dictionary<string, string> { ["Mode"] = "Strict" };
settings.Should().Contain("Mode", "Strict");

var single = new[] { "only-one" };
var item = single.Should().ContainSingle().Which;
item.Should().Be("only-one");
```

## Sync & Async Exception and Function Assertions

Verify expected exceptions and wildcard message patterns (`*` and `?` with ordinal semantics) across synchronous and `Task`-returning actions or functions:

```csharp
Func<Task> act = async () => await service.ExecuteAsync(invalidRequest);

await act.Should()
    .ThrowAsync<InvalidOperationException>()
    .WithMessage("*missing handler*");

Action safeCall = () => validator.Validate(validOptions);
safeCall.Should().NotThrow();

Func<Task<int>> compute = () => service.CountAsync();
var verified = await compute.Should().NotThrowAsync();
verified.Subject.Should().BeGreaterThan(0);
```

## Related Guides

- Combine with fake mediators and handler harnesses in [Testing Harnesses](/docs/testing).
- Validate projection translation cleanly in [Entity Framework Core Projections](/docs/entity-framework-core).

# Migrating from AwesomeAssertions

`AstraFlow.Assertions` is not a drop-in replacement for every AwesomeAssertions API. Use the patterns below for common migration calls covered by the AstraFlow 2.4.2 compatibility patch. The examples are compile-tested in `AwesomeAssertionsMigrationCompatibilityTests`.

Install the package in the test project:

```powershell
dotnet add package AstraFlow.Assertions
```

## Common call patterns

| Existing pattern | AstraFlow pattern |
| --- | --- |
| `result.IsFailure.Should().BeTrue("Expected Failure but got Success")` | `result.IsFailure.Should().BeTrue("Expected Failure but got Success")` |
| `actual.Should().Be(expected, "context {0}", detail)` | `actual.Should().Be(expected, "context {0}", detail)` |
| `items.Should().BeEquivalentTo([first, second])` | `items.Should().BeEquivalentTo([first, second])` |
| `items.Should().BeEquivalentTo(first, second)` | `items.Should().BeEquivalentTo(first, second)` |
| `items.Should().BeEquivalentTo(expected, options => options.WithStrictOrdering())` | `items.Should().BeEquivalentTo(expected, options => options.WithStrictOrdering())` |
| `items.Should().NotEqual(first, second)` | `items.Should().NotEqual(first, second)` |
| `items.Should().NotBeOfType<ExpectedCollection>()` | `items.Should().NotBeOfType<ExpectedCollection>()` |
| `items.Should().NotBeAssignableTo<ExpectedCollection>()` | `items.Should().NotBeAssignableTo<ExpectedCollection>()` |
| `dictionary.Should().ContainKey(key).WhoseValue` | `dictionary.Should().ContainKey(key).WhoseValue` |
| `id.Should().NotBe(Guid.Empty)` | `id.Should().NotBe(Guid.Empty)` |
| `status.Should().BeOneOf(first, second)` | `status.Should().BeOneOf(first, second)` |
| `stream.Should().BeNull()` / `.NotBeNull()` | `stream.Should().BeNull()` / `.NotBeNull()` |
| `await action.Should().NotThrowAsync("context {0}", detail)` | `await action.Should().NotThrowAsync("context {0}", detail)` |

Reason strings are appended only when an assertion fails. Composite format placeholders use invariant formatting. Use `BeEmpty(reason, args)` and `NotBeEmpty(reason, args)` for string, sequence, and dictionary checks.

## Additional 2.4.x compatibility coverage

The next 2.4.x patch also supports boolean equality with formatted context, formatted null/presence checks, formatted non-whitespace checks, formatted negative containment, and formatted dictionary-key checks. These additions preserve the existing failure descriptions and append the supplied reason only when an assertion fails.

## Typed values after type checks

`BeOfType<T>()` keeps its existing AstraFlow contract and returns the typed value directly. When migrated code needs an assertion result with `.Subject` or `.Which`, use the additive typed-result method:

```csharp
var result = actionResult.Should().BeOfTypeAndWhich<OkObjectResult>().Subject;
var value = actionResult.Should().BeAssignableToAndWhich<ObjectResult>().Which;
```

The original `BeOfType<T>().Subject` chain cannot be added without changing the established return type of `BeOfType<T>()`; update those call sites to `BeOfTypeAndWhich<T>()`.

## Regex timeout

`MatchRegex` requires an explicit finite timeout. Keep that protection during migration:

```csharp
value.Should().MatchRegex(pattern, TimeSpan.FromSeconds(1));
```

Choose a timeout that fits the test input and pattern; do not use `Regex.InfiniteMatchTimeout`.

## Exception type name collision

`AstraFlow.Assertions` and `AstraFlow.Testing` each expose an `AstraFlowAssertionException`. When a test imports both namespaces, qualify or alias the intended type:

```csharp
using AssertionFailure = global::AstraFlow.Assertions.AstraFlowAssertionException;
using TestingFailure = global::AstraFlow.Testing.AstraFlowAssertionException;

Assert.Throws<AssertionFailure>(() => value.Should().Be(expected));
```

Keep framework-neutral assertion failures and AstraFlow-specific test-helper failures distinct in tests that need both.

## Coverage limits

The compatibility tests cover the call patterns listed here; they do not claim full AwesomeAssertions API or behavior parity. Review other compiler diagnostics against AstraFlow's assertion reference before changing test semantics.

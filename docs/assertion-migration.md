# Migrating from AwesomeAssertions

`AstraFlow.Assertions` is not a drop-in replacement for every AwesomeAssertions API. Use the patterns below for common migration calls covered by the AstraFlow 2.4.2, 2.4.3, 2.4.4, and 2.4.5 compatibility patches; the upcoming 2.4.6 patch adds the remaining confirmed call shapes. The examples are compile-tested in `AwesomeAssertionsMigrationCompatibilityTests`.

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

The 2.4.3 patch also supports boolean equality with formatted context, formatted null/presence checks, formatted non-whitespace checks, formatted negative string/sequence containment, and formatted positive dictionary-key checks. These additions preserve the existing failure descriptions and append the supplied reason only when an assertion fails.

The 2.4.4 release completes additional migration call shapes with formatted reasons:

```csharp
typeof(IHandler).Should().Be(typeof(CreateHandler), "the {0} type is registered", "handler");
count.Should().BeGreaterThan(0, "the {0} must be positive", "retry count");
items.Should().HaveCount(2, "expected {0} results", "two");
items.Should().Contain(expected, "the {0} result is present", "selected");
items.Should().ContainSingle(value => value.IsValid, "expected one {0}", "valid result");
items.Should().StartWith(expectedPrefix, "the {0} prefix is required", "protocol");
dictionary.Should().NotContainKey(secretKey, "the {0} key must be absent", "private");
actual.Should().Match(value => value.IsReady, "the {0} must be ready", "service");
await action.Should().ThrowAsync<HttpRequestException>("the {0} request must fail", "outbound");
text.Should().NotContainEquivalentOf("private-marker", "the {0} must be omitted", "secret");
```

These APIs are available in AstraFlow.Assertions 2.4.4. The negative string containment assertion compares ordinally while ignoring case, and failure messages omit the compared values.

For an `IEnumerable<string>`, `Contain(expected, because, args)` overlaps with the existing multiple-item `Contain(params T[])` overload. Cast string formatting arguments to `object` so overload resolution selects the context overload. To assert several expected strings, pass them as one array with `Contain(new[] { first, second })`.

## 2.4.5 migration coverage

The 2.4.5 release adds formatted reasons to these remaining reported call shapes while keeping regex evaluation bounded and nullable equality predictable:

```csharp
name.Should().StartWith("api-", "the {0} prefix is required", "route");
value.Should().MatchRegex("^api-", TimeSpan.FromSeconds(1), "the {0} pattern must match", "route");

decimal? actualNullable = null;
decimal? expectedNullable = null;
actualNullable.Should().Be(expectedNullable, "the {0} nullable values must match", "amount");
decimal? comparableNullable = 3m;
comparableNullable.Should().BeGreaterThanOrEqualTo(2m, "the {0} minimum applies", "value");

service.Should().BeSameAs(expectedService, "the {0} instance is reused", "registered");
id.Should().NotBe(unexpectedGuid, "the {0} GUID must differ", "current");
```

`Be(T?)` compares nullable values with `EqualityComparer<T?>.Default`, so two null values match. `BeGreaterThanOrEqualTo` still fails for a null subject. `MatchRegex` requires a positive finite timeout even when a formatted reason is supplied.

## 2.4.6 migration coverage

The published 2.4.5 package does not include these non-nullable and dictionary null-check call shapes. The upcoming 2.4.6 patch adds formatted context for non-nullable `BeGreaterThanOrEqualTo` and chainable null/presence checks on dictionary assertions:

```csharp
int actual = 3;
actual.Should().BeGreaterThanOrEqualTo(2, "the {0} minimum applies", "value");

Dictionary<string, int>? missing = null;
missing.Should().BeNull();
new Dictionary<string, int>().Should().NotBeNull();
```

`BeGreaterThanOrEqualTo` uses `Comparer<T>.Default`. Dictionary null checks inspect only the subject reference and do not enumerate or expose entries.

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

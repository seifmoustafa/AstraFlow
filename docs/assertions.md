# AstraFlow Assertions

`AstraFlow.Assertions` is the general-purpose assertion library for tests of any .NET application. It checks values returned by the code under test and observable effects such as emitted items or thrown exceptions. It is independent of AstraFlow's mediator/mapper runtime and of test runners.

> The package is implemented in the v2.4.0 source and has not been published yet.

## Install when released

```powershell
dotnet add package AstraFlow.Assertions --version 2.4.0
```

The shipping project has no `PackageReference` dependencies. Test-runner packages stay in the consumer's test project.

## Common checks

```csharp
using AstraFlow.Assertions;

response.StatusCode.Should().Be(201);
response.Body.Should().Contain("created");
items.Should().HaveCount(2);
items.Should().Equal(first, second);
((Action)service.DeleteMissingRecord).Should().Throw<KeyNotFoundException>();
await ((Func<Task>)(() => service.SaveAsync())).Should().NotThrowAsync();
```

Supported initial checks include:

- Value equality and inequality, nullability, reference identity and runtime types.
- Inclusive generic comparisons and ranges for comparable types; true/false; enum-defined and flag checks; GUID empty checks.
- Ordinal string equality, substring, prefix/suffix, empty and whitespace checks.
- Enumerable emptiness, count, value/predicate/multiple-item membership, ordered equality and subsequence checks, exact sequence runtime type, one-item checks, predicate constraints, and key checks for key-value-pair sequences.
- Dictionary key, key/value, value and entry-count checks.
- Synchronous and asynchronous action/function expected-exception or no-throw checks, plus exception message patterns (`*` for any run of characters and `?` for one character).

Sequence equality is order-sensitive and uses `EqualityComparer<T>.Default`. Generic range checks use `Comparer<T>.Default`; the type must provide meaningful comparison semantics. Predicate-based sequence checks enumerate the sequence once per assertion. Dictionary key behavior follows the dictionary's own comparer.

Exception message matching is ordinal and case-sensitive. A failed message assertion does not include either the expected pattern or actual message in its output. Expected exceptions and single-item sequence checks expose `Which` and `Subject`; selected assertion objects expose `And` to continue related checks.

## Failure behavior and safe messages

An unsuccessful assertion throws `AstraFlowAssertionException`. Any normal .NET test runner reports an unhandled assertion exception as a failed test.

Failure messages do not call arbitrary object `ToString()` and do not print string contents or GUID values by default. This reduces accidental secret disclosure in CI logs. Messages still identify the expected condition, actual type, string length, sequence index/count, or exception type where useful.

## Package boundaries

Use `AstraFlow.Assertions` for assertions over any application's behavior. Use `AstraFlow.Testing` when a test needs AstraFlow-specific fake senders/publishers/mediators, handler or pipeline harnesses, mapper/projection checks, diagnostics checks or secure-ID helpers. Installing one does not install the other.

## Current limits

The first implementation does not include structural object-graph equivalency, fluent assertion scopes, expression-name capture, rich string diffs, async-enumerable assertions, XML/HTTP/file/event helpers, snapshot testing or mocking. These are separate capabilities that need their own semantics, compatibility tests and release gates. The phase plan records the expansion path in [v2.4 Assertions](plans/v2.4-assertions.md).

## Compatibility expectations

The fluent `Should()` entry point is familiar, but this is an original AstraFlow API and does not promise drop-in source or behavior compatibility with other assertion frameworks. Migration should be done against the documented methods and checked by compiling the consumer test suite.

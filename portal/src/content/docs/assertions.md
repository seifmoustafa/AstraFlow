# AstraFlow Assertions

`AstraFlow.Assertions` is a general-purpose assertion library for tests of any .NET application. It checks returned values, strings, collections, dictionaries, and exceptions without coupling assertions to a test runner or to AstraFlow's mediator and mapper packages.

## Availability

`AstraFlow.Assertions` is planned for AstraFlow 2.4.0. The package targets `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`; `DateOnly` and `TimeOnly` assertions are available on `net8.0`, `net9.0`, and `net10.0` only.

The package has no runtime dependencies. Add it to a test project when it becomes available:

```shell
dotnet add package AstraFlow.Assertions --version 2.4.0
```

## Start with `Should()`

Call `.Should()` on the value or delegate being checked. A failed assertion throws `AstraFlowAssertionException`, which standard .NET test runners report as a failed test.

```csharp
using AstraFlow.Assertions;

response.StatusCode.Should().Be(201);
response.Body.Should().Contain("created");
items.Should().HaveCount(2);
items.Should().Equal(first, second);

Func<Task> act = () => service.SaveAsync();
await act.Should().NotThrowAsync();
```

Related assertions can be chained through `.And`. A single-item collection assertion exposes the matched item through `.Which` or `.Subject`:

```csharp
var item = items.Should().ContainSingle().Which;
item.Id.Should().NotBeEmpty();
```

Async action and function assertions also provide `CompleteWithinAsync` and `NotCompleteWithinAsync`. They observe the returned `Task` without canceling the operation. For `Func<Task<TResult>>`, the completion check returns `TResult`, while the non-completion check returns the original assertion wrapper. Zero is a valid timeout; negative, infinite, or unsupported timeouts are rejected before invoking the delegate. A pre-canceled token also prevents invocation. Cancellation stops only the assertion wait, and later operation faults remain observed. Completion propagates the operation exception; early completion or fault makes `NotCompleteWithinAsync` fail. These checks cannot preempt synchronous blocking inside a delegate.

Stream checks use `Stream.Should()` on all targets. Capability and metadata checks include `BeReadable`, `NotBeReadable`, `BeWritable`, `NotBeWritable`, `BeSeekable`, `NotBeSeekable`, `HaveLength(long)`, `HavePosition(long)`, `BeAtBeginning`, and `BeAtEnd`. These checks inspect capabilities and metadata only: they never read, seek, change stream state, or dispose the stream. Null, disposed, and unsupported metadata produce assertion failures; unexpected I/O exceptions propagate, and negative length or position throws `ArgumentOutOfRangeException`.

`HaveContent(byte[])` and `NotHaveContent(byte[])` compare the exact bytes remaining from the stream's current position, including the absence of trailing bytes. They use a fixed 4 KiB buffer. Seekable streams return to their starting position after a match, mismatch, or read failure. Non-seekable streams are consumed, so use these assertions only when consuming the stream is acceptable. Failure messages report the expected byte count without printing byte values; unexpected I/O exceptions propagate after restoring a seekable stream's position.

Nullable `T?` assertions are available on all package targets and include null/presence checks (`BeNull`, `HaveValue`), equality (`Be`, `NotBe`), comparisons, ranges, and membership (`BeOneOf`, `NotBeOneOf`). Nullable enums add `BeDefined`, `NotBeDefined`, `HaveFlag`, and `NotHaveFlag`; nullable numbers add `BeApproximately`, `NotBeApproximately`, `BeNaN`, `NotBeNaN`, `BeFinite`, `BePositive`, and `BeNegative`. Nullable `DateTime?`, `DateTimeOffset?`, and `TimeSpan?` checks include `BeBefore`, `BeAfter`, `BeCloseTo`, `HaveKind`, `HaveOffset`, and duration sign checks. `Guid?` supports `BeEmpty` and `NotBeEmpty`. Nullable `DateOnly?` and `TimeOnly?` add `BeBefore`, `BeAfter`, and `BeCloseTo` on `net8.0`, `net9.0`, and `net10.0` only. These value checks fail for null.

Captured exceptions support exact and assignable type checks (`BeOfType`, `BeAssignableTo`), immediate inner exception checks (`WithInnerException`, `WithInnerExceptionExactly`, `HaveInnerException`, `NotHaveInnerException`), wildcard `WithInnerExceptionMessage` matching, and `Where` / `NotWhere` predicates that each invoke the supplied predicate exactly once. Generic and runtime `Type` overloads are available for inner exception type checks; successful checks return chainable exception assertions.

XML assertions use `XDocument.Should()` and `XElement.Should()` for document roots, direct child elements, attribute presence and values, exact ordinal element text checks, and XML tree equivalence. Methods include `HaveRoot`, `NotHaveRoot`, `HaveElement`, `NotHaveElement`, `HaveAttribute`, `NotHaveAttribute`, `HaveAttributeWithValue`, `HaveValue`, `BeEquivalentTo`, and `NotBeEquivalentTo`; namespace-aware overloads accept `XName`. Failure messages omit compared XML values. Equivalence compares LINQ to XML trees rather than raw serialized XML.

HTTP response checks use `HttpResponseMessage.Should()` for status codes and response/content headers. These metadata checks do not read or serialize the body, mutate or dispose the response or its content, or expose header values or request URIs in failure messages. `HaveContentAsync`, `NotHaveContentAsync`, `ContainContentAsync`, and `NotContainContentAsync` read and buffer the body as text with ordinal comparison; missing content is treated as empty text. Body assertions do not dispose the response or content, and their failures omit expected and actual body text.

## Values, booleans, enums, and GUIDs

Object assertions include equality and inequality (`Be`, `NotBe`), null checks (`BeNull`, `NotBeNull`), reference identity (`BeSameAs`, `NotBeSameAs`), runtime type checks (`BeOfType<T>`, `BeAssignableTo<T>`), ranges and comparisons, and predicate checks (`Match`, `NotMatch`).

Booleans provide `BeTrue` and `BeFalse`. Enum assertions include `BeDefined`, `NotBeDefined`, `HaveFlag`, and `NotHaveFlag`. `Guid` assertions provide `Be`, `BeEmpty`, and `NotBeEmpty`.

`NotBeDefined` succeeds only when the enum value is not a declared member. For flags enums, a bit combination with no explicitly declared enum member is undefined, even when its bits are composed of declared flags.

### Nullable value checks

`Should()` on any nullable value type (`T?`) returns `NullableValueAssertions<T>` on all package targets: `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. `Which` returns the underlying value and fails when the subject is null. Presence checks are `BeNull`, `NotBeNull`, `HaveValue`, and `NotHaveValue`; equality checks are `Be(T)` and `NotBe(T)`. Comparison checks include `BeGreaterThan`, `BeGreaterThanOrEqualTo`, `BeLessThan`, and `BeLessThanOrEqualTo`. These comparisons and `BeInRange` use `Comparer<T>.Default` and require a default ordering. `BeInRange` uses inclusive bounds, and `BeOneOf` / `NotBeOneOf` use `EqualityComparer<T>.Default`.

`BeNull` and `NotHaveValue` pass for null. `NotBeNull`, `HaveValue`, `Which`, and operations that need to inspect a value—including `Be(T)`, comparisons, ranges, `BeOneOf`, and numeric checks—fail for null. `NotBe(T)` and `NotBeOneOf(...)` pass for null because it cannot equal a supplied value.

Nullable enum values also support `BeDefined`, `NotBeDefined`, `HaveFlag`, and `NotHaveFlag`. Each checks the underlying enum value and fails when the nullable subject is null.

Nullable `float`, `double`, and `decimal` values support `BeApproximately` and `NotBeApproximately`. Nullable `float` and `double` values also support `BeNaN`, `NotBeNaN`, and `BeFinite`. Nullable standard integer types (`sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, and `ulong`), `float`, `double`, and `decimal` support `BePositive` and `BeNegative`. Unsigned values cannot be negative. `NaN` is neither positive nor negative and does not pass `BeFinite`.

`DateTime?` and `DateTimeOffset?` support `BeBefore`, `BeAfter`, and `BeCloseTo`; `DateTime?` also supports `HaveKind`, and `DateTimeOffset?` supports `HaveOffset`. `TimeSpan?` supports `BeCloseTo`, `BePositive`, and `BeNegative`. These types are supported on all package targets. `Guid?` supports `BeEmpty` and `NotBeEmpty` on all targets. Each check requires a value and fails for null.

Nullable `DateOnly?` and `TimeOnly?` support `BeBefore`, `BeAfter`, and `BeCloseTo` on `net8.0`, `net9.0`, and `net10.0`. Date-only precision is an integer number of days; time-only comparisons are linear and do not wrap across midnight. Their nullable forms are unavailable on `netstandard2.0`.

`DateTime?` uses tick comparisons without converting its kind; `HaveKind` checks that kind separately. `DateTimeOffset?` compares UTC instants, while `HaveOffset` checks the stored offset. Temporal precision follows the same inclusive rules as the corresponding non-nullable assertions. Duration sign checks are strict, so zero is neither positive nor negative.

```csharp
int? retries = 3;
retries.Should().HaveValue().Be(3).BeInRange(1, 5).BeOneOf(2, 3, 4);

int? missingRetries = null;
missingRetries.Should().BeNull().NotHaveValue().NotBeOneOf(0, 1);

double? ratio = 1.01;
ratio.Should().BeApproximately(1d, 0.02).BePositive().BeFinite();

DateTime? completedAt = response.CompletedAt;
completedAt.Should().BeAfter(startedAt).HaveKind(DateTimeKind.Utc);

DateTimeOffset? receivedAt = response.ReceivedAt;
receivedAt.Should().BeCloseTo(expectedInstant, TimeSpan.FromMilliseconds(2)).HaveOffset(TimeSpan.Zero);

TimeSpan? elapsed = response.Elapsed;
elapsed.Should().BePositive();

Guid? requestId = response.RequestId;
requestId.Should().NotBeEmpty();
```

### Stream checks

`Stream.Should()` returns `StreamAssertions` on all package targets: `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. Capability checks are `BeReadable` / `NotBeReadable`, `BeWritable` / `NotBeWritable`, and `BeSeekable` / `NotBeSeekable`; metadata checks are `HaveLength(long)`, `HavePosition(long)`, `BeAtBeginning`, and `BeAtEnd`.

Length and position checks require a seekable stream with supported metadata. Null, disposed streams, and unsupported metadata produce assertion failures; unexpected I/O exceptions propagate. Negative expected length or position throws `ArgumentOutOfRangeException`. These checks inspect capabilities and metadata only: they never read, seek, change stream state, or dispose the stream.

```csharp
stream.Should()
    .BeReadable()
    .BeSeekable()
    .HaveLength(expectedLength)
    .HavePosition(0)
    .BeAtBeginning();

stream.Should().HavePosition(expectedLength).BeAtEnd();
```

### Structural object-graph checks

Object, collection, and dictionary assertions provide `BeEquivalentTo(expected)` and `NotBeEquivalentTo(unexpected)` for structural checks. The object types may differ. At each object level, the expected object's public readable, non-indexed instance properties define the shape to compare. The subject must provide matching property names, compared with exact casing; additional subject properties are ignored. Each selected property's value is checked recursively.

Sequences are compared in order by default. Add `IgnoringCollectionOrder()` to compare sequence items without regard to order; duplicate items still have to occur the same number of times. Dictionaries are matched by key using the subject dictionary's comparer. Cycles terminate through reference-pair tracking. When `BeEquivalentTo` fails, its message reports the first mismatch path, such as `$.Details.Count` or `$[1]`. `NotBeEquivalentTo` reports when the graphs match. Neither assertion prints compared values.

Use `Excluding("ApiKey")` to skip a property by name at any depth, or `ExcludingPath("Billing.ApiKey")` to skip only that nested property path. Both forms match names case-insensitively. Paths use dot-separated property names; omit collection indexes so a path such as `Orders.ApiKey` applies to that property on every item in `Orders`.

Register a per-call `IEqualityComparer<T>` with `Using<T>(comparer)` to customize equality for matching values throughout the graph. To scope a comparer to one property, use `Using<T>("Billing.ApiKey", comparer)`. Path names are matched case-insensitively, and collection indexes are omitted, so `Orders.Code` applies to `Code` on every item in `Orders`. When both comparers can handle a value at that path, the path-specific comparer takes precedence; the type-wide comparer still applies elsewhere. Among applicable comparers of the same scope, the most recently registered one is used. The default maximum graph depth is 32. `WithMaximumDepth` accepts values from 1 through 128 to configure a different limit for one assertion; reaching beyond it fails at the first path that exceeds the limit.

```csharp
actual.Should().BeEquivalentTo(expected, options => options
    .Using<string>(StringComparer.Ordinal)
    .Using<string>("Billing.ApiKey", StringComparer.OrdinalIgnoreCase)
    .ExcludingPath("Shipping.ApiKey")
    .IgnoringCollectionOrder()
    .WithMaximumDepth(64));
```

Only public readable properties participate; public fields are ignored. Use focused assertions when the expected shape depends on public fields.

For sequences, `ContainEquivalentOf(expected, configure)` returns the matching item through `.Which` or `.Subject`; `NotContainEquivalentOf` checks that no item has the expected structure; `AllBeEquivalentTo` checks every item against it. Each call accepts its own equivalency options, so the same graph rules are applied to every candidate. The subject is enumerated once, and nested one-shot sequences are snapshotted at most once across candidate comparisons.

All three checks fail for a null subject. `AllBeEquivalentTo` and `NotContainEquivalentOf` pass for an empty sequence; `ContainEquivalentOf` fails when there is no candidate. A mismatch reports the item index and property path, while a containment miss reports the number of candidates checked. Failure messages do not print compared values.

```csharp
var found = actual.Should().ContainEquivalentOf(
    expected,
    options => options.Using<string>(StringComparer.OrdinalIgnoreCase))
    .Which;

actual.Should().AllBeEquivalentTo(expected, options => options.ExcludingPath("Audit.Secret"));
actual.Should().NotContainEquivalentOf(unexpected);
```

## Numeric checks

`float`, `double`, and `decimal` values support `BeApproximately` and `NotBeApproximately` with an absolute tolerance. Floating-point values also support `BeNaN`, `NotBeNaN`, and `BeFinite`.

```csharp
latencyMs.Should().BeApproximately(120.0, 0.5);
ratio.Should().BeFinite();
```

Precision comparisons are inclusive and require a finite, nonnegative tolerance. NaN operands are outside the tolerance; equal signed infinities are within it. Decimal subtraction overflow is treated as outside the tolerance. Failure messages omit operands and tolerance.

`BePositive` and `BeNegative` are available for `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, and `ulong`. They use strict comparisons with zero, so zero passes neither assertion. Unsigned values cannot pass `BeNegative`. Failures do not print the integer value.

The same sign assertions are available for `float`, `double`, and `decimal`. They use strict comparisons with zero, so zero passes neither assertion. For `float` and `double`, `NaN` fails both assertions, while positive and negative infinity pass only the assertion matching their sign. Decimal minimum and maximum values are supported. Failures do not print the value.

## Dates and durations

`DateTime` and `DateTimeOffset` support `BeBefore`, `BeAfter`, and `BeCloseTo`. `DateTime` comparisons use ticks and do not convert between kinds; use `HaveKind` to check its `DateTimeKind` separately. `DateTimeOffset` comparisons use UTC instants; use `HaveOffset` to check the stored offset. Valid offsets are whole minutes within fourteen hours of UTC.

`TimeSpan` supports `BeCloseTo`, `BePositive`, and `BeNegative`. Closeness uses an inclusive, nonnegative precision and is safe across the full value range. Zero is neither positive nor negative.

```csharp
createdAt.Should().BeAfter(minimumTime).HaveKind(DateTimeKind.Utc);
receivedAt.Should().BeCloseTo(expectedInstant, TimeSpan.FromMilliseconds(2));
elapsed.Should().BePositive();
```

On `net8.0`, `net9.0`, and `net10.0`, `DateOnly` and `TimeOnly` also support `BeBefore`, `BeAfter`, and `BeCloseTo`. `DateOnly` precision is an integer number of days. `TimeOnly` precision is a `TimeSpan`; comparisons are linear and do not wrap across midnight. These types are unavailable on `netstandard2.0`.

Temporal failures omit compared values and precision.

## String checks

String comparisons are ordinal by default. Use `BeEquivalentTo(expected, comparison)` when a specific `StringComparison` is needed; the comparison mode must be supplied explicitly.

The available checks include `Be`, `NotBe`, `BeNull`, `NotBeNull`, `BeEmpty`, `NotBeEmpty`, `BeNullOrEmpty`, `NotBeNullOrEmpty`, `BeNullOrWhiteSpace`, `NotBeNullOrWhiteSpace`, `HaveLength`, `Contain`, `NotContain`, `StartWith`, `NotStartWith`, `EndWith`, and `NotEndWith`.

`NotBeEmpty` fails for both `null` and an empty string. `HaveLength` accepts zero and throws `ArgumentOutOfRangeException` for a negative expected length. Negative prefix and suffix checks reject a `null` search value with `ArgumentNullException`.

`Match(pattern)` uses ordinal wildcard matching across the entire string: `*` matches any number of characters and `?` matches one character. Both wildcards can match line breaks. Empty patterns are rejected with `ArgumentException`.

`MatchRegex(pattern, timeout)` uses .NET regular-expression search behavior, so it can match a substring unless the expression is anchored. It requires a positive finite timeout and a nonempty pattern. Invalid patterns are rejected without including the pattern in the error. When matching exceeds its timeout, the assertion fails safely without printing the pattern or subject.

String failure messages report lengths or the failed condition instead of string contents.

## Collections and dictionaries

Enumerable assertions include `BeEmpty`, `NotBeEmpty`, `HaveCount`, value or predicate membership (`Contain`, `NotContain`), ordered equality (`Equal`), single-item checks (`ContainSingle`), indexed checks, ordered subsequence checks, key-order checks, and predicate constraints (`OnlyContain`). `ContainSingle` can return the matched item through `.Which`.

Sequence equality is order-sensitive and uses `EqualityComparer<T>.Default`. Generic range checks use `Comparer<T>.Default`; the type must provide meaningful comparison semantics. Predicate-based sequence checks enumerate the sequence once per assertion.

`HaveElementAt(index, expected)` checks the value at a zero-based index using the default equality comparer for `T` (`EqualityComparer<T>.Default`) and returns the verified item through `.Which` or `.Subject`; `.And` keeps the single-item assertion chain. The sequence is enumerated once and its enumerator is disposed. It stops after reaching the requested index, so the source does not need to be fully consumed. A negative index throws `ArgumentOutOfRangeException`; a null sequence, missing index, or unequal value fails the assertion. Failure messages do not include compared string contents.

```csharp
var matched = results.Should().HaveElementAt(1, expected).Which;
matched.Id.Should().Be(expected.Id);
```

`HaveElementPreceding(successor, expectedPredecessor)` and `HaveElementSucceeding(predecessor, expectedSuccessor)` check an immediate neighbor of the first matching pivot with `EqualityComparer<T>.Default`. Each reads the subject once and stops after the pivot and its neighbor are known. A null or empty subject, missing pivot, pivot at the relevant boundary, or unequal neighbor fails without printing compared values; enumerator and comparer exceptions propagate unchanged.

```csharp
results.Should().HaveElementPreceding("completed", "active");
results.Should().HaveElementSucceeding("active", "completed");
```

### Ordered sequence membership

`ContainInOrder` checks that expected items occur in order while allowing other items between them. `ContainInConsecutiveOrder` requires the expected items to be adjacent; `ContainConsecutive` is an alias. `NotContainInOrder` and `NotContainInConsecutiveOrder` assert that the corresponding ordered pattern is absent. Each method accepts either `params` values or an `IEnumerable<T>` expectation, including iterator-backed sequences.

All four methods use `EqualityComparer<T>.Default`, so null items are compared like other values. Repeated expected values must match distinct subject positions. Expected sequences must be finite; subject and expected sequences are each enumerated at most once, and their enumerators are disposed. The negative and consecutive checks read the subject to its end; the gap-allowing positive check can stop when it finds the full match. An empty expectation succeeds for the positive checks even when the subject is null. The negative checks succeed for an empty expectation when the subject exists, but a null subject fails because absence cannot be verified. A null expected sequence throws `ArgumentNullException`. Failure messages describe the match or index without printing the compared values.

```csharp
IEnumerable<int> expectedPath = LoadExpectedPath();

results.Should().ContainInOrder(expectedPath); // Other results may appear between expected items.
results.Should().ContainInConsecutiveOrder(200, 204); // These values must be adjacent.
results.Should().NotContainInOrder(304, 200);
```

`StartWith` and `EndWith` compare an ordered prefix or suffix against a finite expected sequence. Both accept `params` values or an `IEnumerable<T>`, with an optional equality comparer. The expected input is read at most once; the subject is read at most once and its enumerator is disposed. Prefix checks stop after the expected items; suffix checks read the complete subject. A null expected sequence throws `ArgumentNullException`. A null subject fails even for an empty expectation, while an empty expectation succeeds for a non-null subject without enumerating it. Failure messages report only the mismatch index or item counts, not compared values.

```csharp
results.Should().StartWith(200, 204);
results.Should().EndWith(new[] { 304, 200 }, EqualityComparer<int>.Default);
```

### Ordering by a selected key

`BeInAscendingOrderBy(keySelector, comparer)` and `BeInDescendingOrderBy(keySelector, comparer)` check the order of selected keys while leaving the original sequence items intact. The comparer is optional and defaults to `Comparer<TKey>.Default`. The selector runs once per item; the sequence is enumerated once and its enumerator is disposed. Equal adjacent keys are allowed. An empty sequence passes, while a null sequence fails. A null selector throws `ArgumentNullException`, and exceptions from the selector propagate unchanged. If the order fails, the assertion reports only the first failing index, not the selected values.

```csharp
orders.Should().BeInAscendingOrderBy(order => order.CreatedAt);
names.Should().BeInDescendingOrderBy(name => name, StringComparer.OrdinalIgnoreCase);
```

Use `AllBeAssignableTo<TExpected>()` when every item may be an instance of the requested type or a derived type. Use `AllBeOfType<TExpected>()` when every item must have that exact runtime type. The generic overloads return a typed collection assertion so you can continue checking the matched items; their `Type` overloads accept a type selected at runtime and keep the existing collection assertion type. When the sequence contains `Type` values, checks compare the types those values represent.

Both `AllBe...` checks succeed for an empty sequence and fail for a null sequence or any null item. Each enumerates the source once. `ContainItemsAssignableTo<TExpected>()` checks that at least one non-null item is assignable to the requested type; it stops at the first match. `NotContainItemsAssignableTo<TExpected>()` checks that no item matches. For these membership checks, null and non-matching items are ignored, an empty sequence passes only the negative check, and a null sequence fails. Both visit the source at most once.

```csharp
IEnumerable<object> handlers = DiscoverHandlers();

handlers.Should()
    .AllBeAssignableTo<IRequestHandler>()
    .HaveCount(3);

handlers.Should().ContainItemsAssignableTo(typeof(IAsyncRequestHandler));
```

Dictionary assertions include `BeEmpty`, `NotBeEmpty`, single-key and key/value checks, batch key and value checks, entry counts, same-count checks, reference identity, and order-independent mapping comparisons.

Read-only dictionaries support the same assertion chain as mutable dictionaries. Key and key/value lookups use the dictionary's own comparer through `ContainsKey` and `TryGetValue`; pair-sequence subjects use the default key equality comparer (`EqualityComparer<TKey>.Default`). The chain includes single and batch key/value checks, counts, mapping equality, structural equivalence, and reference identity. `HaveSameCount(expectedEntries)` accepts a finite entry sequence, reads it once, and compares only the number of entries.

Mutable dictionaries, read-only dictionaries, and `IEnumerable<KeyValuePair<TKey, TValue>>` sequences start dictionary checks with the ordinary `.Should()` entry point. The read-only dictionary and pair-sequence overloads return the same dictionary assertion API; pair sequences use default key equality and each assertion enumerates its subject at most once.

`Equal(expectedEntries)` and `NotEqual(unexpectedEntries)` compare dictionary mappings regardless of entry order. Their expected input is a finite sequence of entries with unique, non-null keys, and the expected sequence is enumerated once. Keys and values use their default equality comparers (`EqualityComparer<TKey>.Default` and `EqualityComparer<TValue>.Default`), so null values compare normally. A null expected sequence throws `ArgumentNullException`; null subjects fail both checks; duplicate expected keys throw `ArgumentException`, and null keys are rejected. `Equal` fails when the entry count, key set, or values differ. `NotEqual` succeeds when any part of the mapping differs and fails when the mappings are equal. Failure messages report only the differing category, never keys or values.

```csharp
IDictionary<string, int> actual = new Dictionary<string, int>
{
    ["first"] = 1,
    ["second"] = 2,
};

IEnumerable<KeyValuePair<string, int>> expectedEntries = new[]
{
    new KeyValuePair<string, int>("second", 2),
    new KeyValuePair<string, int>("first", 1),
};

IEnumerable<KeyValuePair<string, int>> previousEntries = new[]
{
    new KeyValuePair<string, int>("first", 1),
    new KeyValuePair<string, int>("second", 3),
};

actual.Should().Equal(expectedEntries);
actual.Should().NotEqual(previousEntries);
```

Key/value checks (`ContainKey`, `NotContainKey`, `ContainValue`, `NotContainValue`, and `Contain(key, value)`) and their batch forms also work with `IReadOnlyDictionary<TKey, TValue>` and `IEnumerable<KeyValuePair<TKey, TValue>>` subjects. Mutable and read-only dictionaries use their own key comparer. Plain key/value-pair sequences use `EqualityComparer<TKey>.Default` for keys. Each pair-sequence assertion enumerates its subject at most once and disposes its enumerator.

`ContainKeys(keys...)` succeeds when every expected key is present; `NotContainKeys(keys...)` succeeds when none of them is present. Both use the dictionary's key comparer. Repeated expected keys are presence checks, so one matching entry can satisfy repeated occurrences.

`ContainValues(values...)` and `NotContainValues(values...)` use `EqualityComparer<TValue>.Default`. Repeated expected values are also presence checks; they do not require distinct entries. Empty key or value batches succeed even when the dictionary subject is `null`. Non-empty batches, single-key or value checks, key/value-pair checks, and dictionary content or count checks fail when the subject is `null`.

`HaveSameCount(other)`, `HaveCountGreaterThan(count)`, and `HaveCountLessThan(count)` compare entry counts. `HaveSameCount` accepts a finite key/value-pair sequence, enumerates it once, and checks only its count; expected keys do not need to be unique. Negative expected counts are rejected with `ArgumentOutOfRangeException`. A null `other` argument to `HaveSameCount` is rejected with `ArgumentNullException`.

Dictionary assertion failures do not print keys or dictionary values. Count failures may include entry counts.

```csharp
var settings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    ["Mode"] = "Strict",
    ["Region"] = "eu",
};

settings.Should()
    .NotBeEmpty()
    .And.ContainKeys("mode", "REGION")
    .And.ContainValues("Strict")
    .And.HaveCountGreaterThan(1)
    .And.HaveCountLessThan(3);
```

### Asynchronous sequence checks

`IAsyncEnumerable<T>.Should()` and its async sequence assertions are available on the `net8.0`, `net9.0`, and `net10.0` package assets. The methods are `BeEmptyAsync`, `NotBeEmptyAsync`, `HaveCountAsync`, `ContainAsync`, `NotContainAsync`, `OnlyContainAsync`, `OnlyHaveUniqueItemsAsync`, `ContainEquivalentItemsAsync`, `HaveSameItemsAsync`, `ContainSingleAsync`, `ContainInOrderAsync`, `ContainConsecutiveAsync`, `NotContainInOrderAsync`, `NotContainInConsecutiveOrderAsync`, `AllSatisfyAsync`, `SatisfyRespectivelyAsync`, `EqualAsync`, and `ThrowAsync<TException>`. `ContainAsync` and `NotContainAsync` each support expected-value and predicate overloads. Await each assertion. `ContainSingleAsync` returns the only item through `.Which`.

Each assertion call acquires at most one asynchronous enumerator, disposes it on success or failure, and forwards its `CancellationToken` when acquiring it. A later assertion call acquires a new enumerator, so a sequence must support another enumeration when multiple checks are made against it. For ordinary sequence checks, cancellation, exceptions raised by the sequence producer, and exceptions from a supplied predicate or equality comparer propagate to the caller.

`ThrowAsync<TException>(cancellationToken)` enumerates until the sequence completes or throws. When it throws `TException` or a derived type, the assertion returns that exception through `ExceptionAssertions<TException>` and its `.Which` property. Completion without an exception or an exception of another type fails the assertion. The provided token is forwarded to the enumerator, which is disposed on every outcome.

The expected-value overloads of `ContainAsync` and `NotContainAsync` accept an optional `IEqualityComparer<T>` and use `EqualityComparer<T>.Default` when none is supplied. Their predicate overloads accept `Func<T, bool>`. `OnlyContainAsync` checks that every item satisfies its predicate. `OnlyHaveUniqueItemsAsync`, `ContainEquivalentItemsAsync`, and `HaveSameItemsAsync` accept an optional comparer and default to `EqualityComparer<T>.Default`; they check uniqueness, requested duplicate-aware containment, and exact duplicate-aware membership without requiring order, respectively. `ContainEquivalentItemsAsync` can stop once every requested item occurrence has matched.

`ContainInOrderAsync(expected)` allows gaps between expected items; `ContainConsecutiveAsync(expected)` requires adjacent items. Both use `EqualityComparer<T>.Default`, consume the expected `IEnumerable<T>` once, and dispose its enumerator. `EqualAsync` also compares the expected enumerable once in order using `EqualityComparer<T>.Default`.

`NotContainInOrderAsync(expected, cancellationToken)` fails when the expected items appear as an ordered subsequence; gaps are allowed. `NotContainInConsecutiveOrderAsync` fails only when the items appear adjacent. Both use `EqualityComparer<T>.Default`, so repeated expected values must match distinct subject positions and null items compare normally. The expected enumerable must be finite and is consumed once. A null expected enumerable throws `ArgumentNullException`; a null async subject fails both checks. For a non-null subject, an empty expectation succeeds without acquiring an async enumerator. A successful negative check must reach the end of the subject, so the subject must be finite for success.

When a subject enumerator is acquired, each check acquires at most one, forwards the supplied `CancellationToken`, and disposes it on success, assertion failure, or cancellation. A matching pattern fails with only its ending index in the message; item values are not included.

`AllSatisfyAsync` awaits one callback for each item in sequence order. `SatisfyRespectivelyAsync` awaits one callback per item in order and requires the sequence item count to match the callback count. Callbacks run sequentially; a callback exception propagates and stops the operation without being aggregated.

`NotContainAsync` succeeds without enumerating a null subject; its predicate overload still requires a non-null predicate. A non-null empty expected sequence makes `ContainInOrderAsync` and `ContainConsecutiveAsync` succeed, including when the subject is null; in that case, no async enumerator is acquired.

Checks that must observe the end of a sequence require a finite source. This includes a missing-item `ContainAsync`, successful `NotContainAsync` on a non-null subject, `OnlyContainAsync`, an exact `HaveCountAsync`, `BeEmptyAsync`, a successful `ContainSingleAsync`, unsuccessful ordered or consecutive membership checks, a successful `EqualAsync`, and successful full checks by `OnlyHaveUniqueItemsAsync`, `HaveSameItemsAsync`, `AllSatisfyAsync`, or `SatisfyRespectivelyAsync`. `ContainEquivalentItemsAsync` may finish as soon as every requested occurrence matches; if the request cannot be satisfied, it reads to the end. Expected sequences for `ContainInOrderAsync`, `ContainConsecutiveAsync`, `ContainEquivalentItemsAsync`, `HaveSameItemsAsync`, and `EqualAsync` must also be finite; each is enumerated once. `HaveCountAsync` stops as soon as it observes more items than requested. Membership and single-item checks stop as soon as their result is established.

```csharp
IAsyncEnumerable<string> emitted = ReadStatesAsync(cancellationToken);

await emitted.Should().ContainEquivalentItemsAsync(
    expected: new[] { "created", "saved", "saved" },
    comparer: StringComparer.OrdinalIgnoreCase,
    cancellationToken: cancellationToken);

IAsyncEnumerable<string> failedEvents = ReadFailedEventsAsync(cancellationToken);
var producerException = await failedEvents.Should().ThrowAsync<InvalidOperationException>(cancellationToken);
var capturedException = producerException.Which;
```

## Exceptions and function results

### Deferred actions and lazy sequences

`FluentActions.Invoking`, `FluentActions.Awaiting`, and `FluentActions.Enumerating`, along with the subject `.Invoking`, `.Awaiting`, and `.Enumerating` extensions, create delegates for fluent assertions without running the operation when the wrapper is created. The operation runs when the returned delegate is passed to an assertion such as `Throw`, `NotThrow`, `ThrowAsync`, or `NotThrowAsync`.

`FluentActions.Awaiting` and the subject `.Awaiting` extensions support `Task` operations on all four package targets. The subject extensions also support `ValueTask` operations on `net8.0`, `net9.0`, and `net10.0`; they adapt the result to `Task` for async assertions. `ValueTask` subject overloads are not available on `netstandard2.0`.

`Enumerating` accepts a factory for a generic or non-generic `IEnumerable`. It invokes the factory and fully consumes the returned sequence only when the assertion runs, so deferred iterator bodies execute at that point. The iterator's enumerator is disposed on normal completion or when enumeration throws. A null factory is rejected when the wrapper is created; a factory that returns null fails with `InvalidOperationException` when the assertion executes.

```csharp
var run = FluentActions.Invoking(() => service.Run());
run.Should().Throw<InvalidOperationException>();

var save = service.Awaiting(value => value.SaveAsync());
await save.Should().NotThrowAsync();

var enumerate = FluentActions.Enumerating(() => order.ReadEvents());
enumerate.Should().NotThrow();
```

Synchronous and asynchronous actions and functions support `Throw<TException>` or `ThrowAsync<TException>` and their corresponding `NotThrow` or `NotThrowAsync` checks. Successful no-throw function assertions retain the function result. Expected-exception assertions expose the exception through `.Which` or `.Subject`.

Exception message checks use ordinal, case-sensitive wildcard matching: `*` matches any run of characters and `?` matches one character. A failed message assertion does not print the expected pattern or actual message.

Captured exceptions are returned as `ExceptionAssertions<TException>` and can be checked with `BeOfType<TExpectedException>()` for an exact runtime type or `BeAssignableTo<TExpectedException>()` for a compatible type. Both return a typed assertion wrapper for further checks.

`HaveInnerException()` checks for an immediate inner exception and returns it for chaining; `NotHaveInnerException()` succeeds only when there is none. `WithInnerException<TInnerException>()` requires the immediate inner exception to be assignable to the requested type. `WithInnerExceptionExactly<TInnerException>()` requires an exact runtime type. Both return assertions over the matched inner exception, so they can be chained to inspect deeper levels. Runtime `Type` overloads are also available for both checks.

`WithInnerExceptionMessage(pattern)` checks the immediate inner exception's message using the same ordinal, case-sensitive wildcard rules. Missing inner exceptions and mismatches fail safely without printing exception messages or patterns.

`Where(predicate)` succeeds when the captured exception satisfies the predicate; `NotWhere(predicate)` succeeds when it does not. Each method invokes the predicate exactly once. A null predicate throws `ArgumentNullException`, and exceptions thrown by a predicate propagate unchanged.

```csharp
var captured = operation.Should().Throw<InvalidOperationException>();
captured.BeOfType<InvalidOperationException>()
    .WithInnerException<ArgumentException>()
    .WithInnerExceptionExactly<NotSupportedException>();

captured.WithInnerExceptionMessage("invalid * value");
captured.NotHaveInnerException();
captured.Where(exception => exception.InnerException is IOException);
captured.NotWhere(exception => exception is TimeoutException);
```

## XML assertions

`XDocument.Should()` and `XElement.Should()` return `XDocumentAssertions` and `XElementAssertions` on all four package targets: `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`.

Document assertions include `HaveRoot` / `NotHaveRoot`, `HaveElement` / `NotHaveElement`, and `BeEquivalentTo` / `NotBeEquivalentTo`. The element checks inspect only a direct child of the document root. Element assertions provide the same direct-child checks, `HaveAttribute` / `NotHaveAttribute`, `HaveAttributeWithValue`, `HaveValue` for the element's text value, and `BeEquivalentTo` / `NotBeEquivalentTo` for XML trees. Matching checks return assertions for the matched element so calls can be chained.

String names refer to names without a namespace. Overloads that accept `XName` allow namespace-aware element and attribute checks. `HaveAttributeWithValue` and `HaveValue` compare strings using ordinal comparison. XML equivalence compares expanded names and attribute sets, so namespace prefixes and unused namespace declarations do not affect the result. It ignores an `XDocument` XML declaration, preserves child-node order, treats CDATA and text as the same character data, and compares comments, processing instructions, and document types. Failed checks do not include compared XML text or attribute values in their messages. Null subjects fail as assertions; invalid names or null expected values are rejected as invalid arguments.

```csharp
using System.Xml.Linq;
using AstraFlow.Assertions;

XNamespace orders = "urn:orders";
var document = XDocument.Parse(
    "<order xmlns='urn:orders'><line id='42'><sku>ABC-7</sku></line></order>");

document.Should()
    .HaveRoot(orders + "order")
    .HaveElement(orders + "line")
    .HaveAttributeWithValue("id", "42")
    .HaveElement(orders + "sku")
    .HaveValue("ABC-7");

var expected = XDocument.Parse(
    "<order xmlns='urn:orders'><line id='42'><sku>ABC-7</sku></line></order>");
document.Should().BeEquivalentTo(expected);
```

These equivalence checks compare `XDocument` and `XElement` trees. They do not compare raw serialized XML strings.

## HTTP response assertions

`HttpResponseMessage.Should()` returns `HttpResponseMessageAssertions`. `HaveStatusCode` / `NotHaveStatusCode` check an exact `HttpStatusCode`; `BeSuccessful` / `NotBeSuccessful` check whether the numeric status is in or outside the 2xx range.

Methods include `HaveResponseHeader`, `NotHaveResponseHeader`, `HaveResponseHeaderValue`, `NotHaveResponseHeaderValue`, `HaveContentHeader`, `NotHaveContentHeader`, `HaveContentHeaderValue`, and `NotHaveContentHeaderValue`. Header-name lookup follows HTTP's case-insensitive rules; header values use ordinal, case-sensitive comparison. Content-header checks inspect `response.Content.Headers` without reading content. When the response has no content, a required content header fails and an absent-content-header check succeeds.

```csharp
using System.Net;
using AstraFlow.Assertions;

response.Should()
    .HaveStatusCode(HttpStatusCode.OK)
    .BeSuccessful()
    .HaveResponseHeader("ETag")
    .HaveResponseHeaderValue("ETag", "\"v7\"")
    .HaveContentHeader("Content-Type")
    .HaveContentHeaderValue("Content-Type", "application/json");
```

Status and header checks do not read or serialize response content and do not mutate or dispose the response or content. Header failures omit values and request URIs. Body checks read and buffer the response content without disposing it; body failures omit expected and actual text.

## Reviewing migration candidates

`AstraFlow.Cli` provides `astraflow assertions analyze [path] --format text|json` for read-only review of fluent assertion calls in C# source. It reports relative locations, method names, classifications, and safe suggestions. When a selected single-target project has existing restore assets, it can read package compile metadata for Roslyn binding. Only a small set of string equality calls currently has a behavior-verified AstraFlow mapping; other bound calls require manual review, while unresolved calls remain unknown. The command never runs MSBuild, restore, project targets, generators, scripts, or inspected project code, and it never edits source files. Results can remain partial when syntax errors, conditional branches, or unevaluated project settings affect analysis. Reports omit source expressions and literal values. See the [CLI guide](/docs/cli#assertion-migration-analysis) for formats, exit codes, and examples. The analysis dependency is confined to `AstraFlow.Cli`; `AstraFlow.Assertions` remains dependency-free.

`CompleteWithinAsync(timeout, cancellationToken)` succeeds only when a returned task finishes inside a nonnegative, finite, supported interval. `Timeout.InfiniteTimeSpan` and values greater than `Task.Delay` supports are rejected before delegate invocation. If the task completes with an exception inside the interval, that exception propagates. When the timeout expires, the underlying operation continues; any later fault is observed.

`NotCompleteWithinAsync(timeout, cancellationToken)` succeeds when the task remains pending for the entire interval. A task that has already completed or completes or faults early makes this assertion fail. Cancellation applies to the wait and is not passed to the operation, so canceling the assertion does not stop the task; late faults are still observed. The token is checked before the delegate runs. The timeout can observe only the returned task and cannot interrupt synchronous blocking inside the delegate.

## Collecting assertion failures

`AssertionScope` aggregates AstraFlow assertion failures only from actions passed explicitly to `Check(Action)` or awaited `CheckAsync(Func<Task>)`. It is not ambient: ordinary `.Should()` calls outside a checked action still fail immediately. Each checked action stops at its first failed assertion, so put each independent condition in its own `Check` or `CheckAsync` call. A nested scope created with `BeginScope()` forwards its failures to its parent when the child is disposed. Disposing the outer scope throws one `AstraFlowAssertionException` containing the collected failures. Other exceptions thrown by a checked action are not collected and propagate from that call.

```csharp
using AstraFlow.Assertions;

using var scope = new AssertionScope();
scope.Check(() => response.Id.Should().NotBeEmpty());
scope.Check(() => response.State.Should().Be("ready"));

using (var itemScope = scope.BeginScope())
{
    itemScope.Check(() => response.Items.Should().NotBeEmpty());
    itemScope.Check(() => response.Items.Count.Should().Be(2));
}

await scope.CheckAsync(async () =>
{
    var status = await GetStatusAsync();
    status.Should().Be("ready");
});
```

## Safe failures

Failure messages do not call arbitrary object `ToString()` and do not print string contents or GUID values by default. They identify the failed condition and may report safe details such as a type, length, index, count, or exception type.

## Use with AstraFlow test support

Use `AstraFlow.Assertions` to assert behavior in any .NET project. Use `AstraFlow.Testing` when a test also needs AstraFlow-specific fake senders, publishers, mediators, handler or pipeline harnesses, projection checks, diagnostics checks, or secure-ID helpers. Installing one package does not install the other.

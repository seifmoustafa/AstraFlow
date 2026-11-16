# AstraFlow Assertions

`AstraFlow.Assertions` is the general-purpose assertion library for tests of any .NET application. It checks values returned by the code under test and observable effects such as emitted items or thrown exceptions. It is independent of AstraFlow's mediator/mapper runtime and of test runners. The package is published; install the latest version from NuGet with:

```powershell
dotnet add package AstraFlow.Assertions
```

The 2.4.2 and 2.4.3 patches add the migration compatibility APIs described in [the migration guide](assertion-migration.md). Consumers who pin versions should use the exact version available on NuGet.org.

The 2.4.3 patch extends formatted failure context to Boolean equality, null/presence checks, whitespace checks, negative containment, and positive dictionary-key checks. The upcoming 2.4.4 hotfix adds reason overloads for type identity, numeric comparisons, collection and dictionary count/containment/prefix/single-item checks, dictionary key exclusion, predicate matching, and sync/async exception assertions. It also adds case-insensitive string `NotContainEquivalentOf`.

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

For migration from AwesomeAssertions, use the compile-tested call patterns in [the migration guide](assertion-migration.md). The guide calls out the few cases that need an explicit method-name change or a type alias.

Implemented checks currently include:

- Value equality and inequality, nullability, reference identity and runtime types.
- Typed nullable value assertions for null/presence, equality, comparison, ranges, and membership; nullable numeric values also support sign, approximation, NaN, and finite checks.
- Inclusive generic comparisons and ranges for comparable types; true/false; enum-defined and flag checks; GUID empty checks.
- Ordinal string equality, substring, prefix/suffix, empty and whitespace checks.
- Case-insensitive string substring exclusion with `NotContainEquivalentOf`.
- Negative string equality, explicit `StringComparison`, exact lengths, negative prefix/suffix checks, whole-string `*`/`?` matching, and regex matching with a required timeout.
- Predicate-based positive and negative checks for object values, plus negative enum-definition checks.
- Strict positive and negative checks for the eight standard integer types, `float`, `double`, `decimal`, and `TimeSpan`; floating-point NaN satisfies neither sign check, while matching infinities satisfy their sign check.
- Numeric absolute precision and safe `DateTime`, `DateTimeOffset`, `TimeSpan`, `DateOnly`, and `TimeOnly` comparisons.
- Structural object-graph equality and inequality across readable public properties, optionally included public instance fields, ordered sequences, and dictionaries, with mismatch paths, cycle tracking, per-call member exclusions, custom comparers, and a configurable recursion limit.
- Stream state checks for readable/writable/seekable capabilities and read-only/write-only mode; expected and unexpected length/position; beginning/end position; and `BufferedStream` size. These inspect metadata only and never read, seek, alter, or dispose the subject.
- Namespace-aware XML document and element checks for roots, direct children, attributes, attribute values, element text, and structural equivalence.
- Non-consuming `XmlReader` cursor checks for read state, node type, depth, and expanded name.
- Assembly metadata checks for referenced-assembly boundaries and declared types, by runtime type identity or exact full name.
- HTTP response status-class, response-header, and content-header checks with exact value matching; metadata checks do not read the body. Asynchronous body-text equality and substring checks read and buffer content without disposing the response or content.
- Runtime monitoring of standard and explicitly adapted custom event delegates, with raise/non-raise and exact-count assertions, cross-event ordering, captured sender/payload metadata, property-change helpers, and deterministic handler removal on disposal.
- One-run synchronous and asynchronous delegate timing, returning `TimeSpan` for the existing comparison assertions; delegate failures propagate unchanged.
- Enumerable null/empty and count checks, value/predicate/multiple-item membership, ordered equality, ordered subsequences, consecutive items, structural-equivalency membership/all-item checks, uniqueness and multiset checks, per-item callbacks, exact sequence runtime type, one-item checks, predicate constraints, and key checks for key-value-pair sequences.
- Asynchronous sequence checks for empty state, count, value/predicate membership, per-item predicate constraints, ordered subsequences, consecutive items, single-item capture, and ordered equality on the `net8.0`, `net9.0`, and `net10.0` package assets.
- Dictionary key and key/value checks, negative key/value and predicate checks, comparer-aware key batches, value batches, entry equality/inequality, empty-state checks, and entry-count comparisons. The key/value batch checks also work on `IReadOnlyDictionary<TKey,TValue>` and sequences of key-value pairs.
- Synchronous and asynchronous action/function expected-exception or no-throw checks, plus exception message patterns (`*` for any run of characters and `?` for one character).
- Deferred `Invoking`, `Awaiting`, and `Enumerating` helpers for static delegates, subject methods, `Task`/`ValueTask` operations, and lazy generic/non-generic sequences.
- Captured-exception exact/assignable type checks, immediate inner-exception traversal by generic or runtime type, inner-message matching, `ArgumentException` parameter-name checks, and positive/negative predicates.
- Async action/function checks for completion or continued incompletion within a finite timeout, with result capture for async functions and explicit cancellation semantics.
- Generic `TaskCompletionSource<T>` completion/non-completion checks on all targets, plus non-generic `TaskCompletionSource` checks on the `net8.0`, `net9.0`, and `net10.0` assets; completion returns a generic result when present.
- Typed property-value selection for reference subjects using a compile-checked property expression; nested paths are supported and each getter runs once.
- Explicit assertion scopes that collect failures from checked synchronous and asynchronous actions and report them together when the outer scope is disposed.

Sequence equality is order-sensitive and uses `EqualityComparer<T>.Default`. Generic range checks use `Comparer<T>.Default`; the type must provide meaningful comparison semantics. Predicate-based sequence checks enumerate the sequence once per assertion. Dictionary key behavior follows the dictionary's own comparer.

Dictionary batch checks treat repeated expected keys or values as repeated presence requests; one matching key or value is enough for each request. `ContainValues` and `NotContainValues` compare values with `EqualityComparer<TValue>.Default`. `IDictionary<TKey,TValue>` and `IReadOnlyDictionary<TKey,TValue>` subjects use their own key comparer; plain key-value-pair sequences use `EqualityComparer<TKey>.Default`. Sequence subjects are enumerated at most once per assertion and disposed. Empty expected batches succeed, including for a null subject. Other checks fail for a null subject. Failure messages describe the missing or unexpected condition without rendering keys or values.

Exception message matching is ordinal and case-sensitive. A failed message assertion does not include either the expected pattern or actual message in its output. Use `WithInnerException<T>()` or its `Type` overload to inspect the immediate inner exception by assignability; use `WithInnerExceptionExactly<T>()` or its `Type` overload for an exact runtime type. Each method returns an exception assertion, so calls can be chained to inspect deeper inner exceptions. `HaveInnerException()` returns the immediate inner exception, while `NotHaveInnerException()` checks its absence. `WithInnerExceptionMessage(pattern)` checks the immediate inner message without printing it on failure. Captured `ArgumentException` instances support `WithParameterName(expected)` and `NotHaveParameterName(name)`; matching ignores casing using ordinal rules, and failures omit both parameter names. The same checks can be chained directly from `ThrowAsync<TException>()` and are awaited before the exception result is returned. `Where` and `NotWhere` invoke their predicate once; predicate exceptions propagate unchanged. Expected exceptions and single-item sequence checks expose `Which` and `Subject`; selected assertion objects expose `And` to continue related checks.

`FluentActions.Invoking(action)` and `FluentActions.Awaiting(action)` make a delegate explicit before calling `.Should()`. Subject extensions such as `subject.Invoking(value => value.Save())` and `subject.Awaiting(value => value.SaveAsync())` defer the method call until the assertion executes. On `net8.0`, `net9.0`, and `net10.0`, `Awaiting` also accepts `ValueTask` and `ValueTask<TResult>` methods and adapts them to task-based assertions; `Task` overloads are available on all targets. `enumerableFactory.Enumerating()` forces a deferred iterator to run to completion so exceptions inside iterator bodies can be asserted; it disposes the enumerator on success and failure. These wrappers do not execute their delegates when created. A null sequence returned by an enumeration factory raises `InvalidOperationException` when the assertion invokes it.

`XDocument.Should()` supports `HaveRoot` and `NotHaveRoot` by local or qualified XML name, plus `HaveElement` and `NotHaveElement` for direct children of the document root. Documents and elements support `BeEquivalentTo` and `NotBeEquivalentTo`: comparison uses expanded XML names, ignores namespace-prefix and namespace-declaration spelling, compares attributes independent of their order, and preserves child-node order. Text and CDATA with the same value are equivalent; comments, processing instructions, and document types are compared by their node data. XML declarations are ignored. `XElement.Should()` supports direct-child checks, attribute presence/absence, attribute-value checks, and exact text-value checks. Names are namespace-aware when passed as `XName`; string names use no namespace. XML text and attribute values are never included in assertion failures.

`HttpResponseMessage.Should()` supports exact `HaveStatusCode`/`NotHaveStatusCode`, `BeSuccessful`/`NotBeSuccessful` for the 2xx range, and presence/value checks for response headers and content headers. Header names use HTTP's case-insensitive matching; header values use exact ordinal comparison. These metadata assertions do not read or dispose the response content. `HaveContentAsync`, `NotHaveContentAsync`, `ContainContentAsync`, and `NotContainContentAsync` read the body as text using `HttpContent.ReadAsStringAsync()` and compare with ordinal semantics. Reading buffers the response content; it does not dispose the response or content. Missing content is treated as empty text. Body assertion failures omit both expected and actual body text. Header failure output omits header values and request URIs.

## Event monitoring

`EventMonitor` records selected events without discovering events through reflection or generating dynamic code. Standard `EventHandler`, `EventHandler<TEventArgs>`, and `PropertyChangedEventHandler` events have direct registration methods. Use `Watch<TDelegate>` with a typed handler factory for any custom event delegate; the factory adapts its signature to the monitor's sender and payload callback:

```csharp
using var events = new EventMonitor()
    .Watch<SavedEventArgs>(nameof(editor.Saved),
        handler => editor.Saved += handler,
        handler => editor.Saved -= handler)
    .WatchPropertyChanged(
        handler => editor.PropertyChanged += handler,
        handler => editor.PropertyChanged -= handler)
    .Watch(nameof(editor.Closed),
        handler => editor.Closed += handler,
        handler => editor.Closed -= handler);

// Example for: event Action<int>? Progress;
events.Watch<Action<int>>(nameof(worker.Progress),
    handler => worker.Progress += handler,
    handler => worker.Progress -= handler,
    capture => percent => capture(worker, percent));

editor.Save();

events.Should()
    .Raise(nameof(editor.Saved))
    .RaisePropertyChangeFor(nameof(editor.Name))
    .RaiseTimes(nameof(editor.Closed), 0)
    .RaiseInOrder(nameof(editor.Saved), nameof(editor.PropertyChanged));
```

Event names must be unique within one monitor and are compared with ordinal matching. `RaiseInOrder` checks the complete captured sequence of watched events; register only the events relevant to that assertion. `OccurredEvents` returns a thread-safe snapshot with sequence numbers, sender, standard `EventArgs` when present, and the original payload through `Payload`. For custom delegates, the handler factory decides which values become sender and payload. Assertions identify event names and counts but do not render sender, arguments, or payload values. Dispose the monitor after the action under test; it removes handlers in reverse registration order, attempts every removal even if one accessor throws, and reports removal failures as an `AggregateException`. Events arriving after disposal are ignored. Event discovery stays explicit.

`RaisePropertyChange` and `NotRaisePropertyChange` check for any `PropertyChangedEventArgs`. `RaisePropertyChangeFor` and `NotRaisePropertyChangeFor` compare property names ordinally. A null or empty `PropertyName` is treated as a notification that affects every property. Property names are not included in assertion failure messages.

## Failure behavior and safe messages

An unsuccessful assertion throws `AstraFlowAssertionException`. Any normal .NET test runner reports an unhandled assertion exception as a failed test.

Failure messages do not call arbitrary object `ToString()` and do not print string contents or GUID values by default. This reduces accidental secret disclosure in CI logs. Messages still identify the expected condition, actual type, string length, sequence index/count, or exception type where useful.

## Assertion scopes

`AssertionScope` collects only the assertions explicitly passed to `Check` or `CheckAsync`. When the outer scope is disposed, it throws one `AstraFlowAssertionException` containing the collected safe failure messages. Nested scopes forward their failures to their parent.

```csharp
using var scope = new AssertionScope();
scope.Check(() => response.StatusCode.Should().Be(201));
scope.Check(() => response.Body.Should().Contain("created"));
await scope.CheckAsync(() => service.SaveAsync().Should().NotThrowAsync());
```

Await each `CheckAsync` call before disposing the scope. Dispose nested scopes before their parent. `Check` and `CheckAsync` catch `AstraFlowAssertionException`; other exceptions propagate immediately. A checked action stops at its first failed assertion, so use a separate `Check` call for each condition you want collected. Assertions called directly outside a checked action keep their normal immediate-failure behavior.

## Package boundaries

Use `AstraFlow.Assertions` for assertions over any application's behavior. Use `AstraFlow.Testing` when a test needs AstraFlow-specific fake senders/publishers/mediators, handler or pipeline harnesses, mapper/projection checks, diagnostics checks or secure-ID helpers. Installing one does not install the other.

## Current limits

The current implementation does not yet include exception property-path helpers, expression-name capture, rich string diffs, async-stream failure aggregation or timeouts, whole-reader comparison, file assertions, automatic custom-event delegate discovery, snapshot testing or mocking. HTTP body-text assertions read and buffer the response. Stream metadata checks do not consume the subject; exact byte-content checks do read it, restore seekable streams, and may consume non-seekable streams. Asynchronous sequence assertions are available from the `net8.0`, `net9.0`, and `net10.0` assets; they are not present in the `netstandard2.0` asset. Assertion scopes are explicit: they aggregate only actions passed to `Check` or `CheckAsync`, and do not implicitly collect `.Should()` calls made outside checked actions. Structural graph checks compare readable public properties, sequences, and dictionaries; call `IncludingFields()` to opt into public instance fields. Per-call type and path comparers, optional unordered sequence matching, and explicit path-based member selection are supported. The [v2.4 Assertions plan](plans/v2.4-assertions.md) records this candidate's verified surface and limits.

## Using the API

The fluent `Should()` entry point starts an AstraFlow assertion chain. Use the documented methods and semantics when adopting the package, then compile and run the consumer test suite.

## Type and member checks

`typeof(MyService).Should()` checks exact runtime type equality with `Be(expectedType)` and `NotBe(unexpectedType)`, plus CLR type shape and public metadata. It supports sealed, abstract and static type checks; base-class and interface relationships; public property presence and exact property types; public method overloads by exact parameter types; and public instance constructors by exact parameter types. Public inherited properties and methods are included. Property and method names use ordinal matching, and method/constructor parameter order matters. These checks inspect reflection metadata only: they do not create instances or invoke getters, methods, or constructors. Failures describe the structural condition without rendering application values.

`typeof(MyService).Assembly.Should()` can check whether the assembly references another assembly by simple name, and whether it defines a type by exact reflection full name or runtime `Type` identity. These checks read assembly metadata only; they do not load referenced assemblies or construct types. Full-name matching is case-sensitive, and nested type names use reflection's `+` notation.

## XML reader cursor

`XmlReader.Should()` checks the reader's current `ReadState`, `NodeType`, `Depth`, or expanded name. `HaveName(XName)` applies only when the current node is an element, end element, or attribute; it compares local name and namespace URI, so namespace prefixes do not affect the result. These checks never call `Read`, move to another node or attribute, close the reader, or dispose it. The caller retains ownership and controls positioning.

```csharp
using var reader = XmlReader.Create(input);
reader.Should().HaveReadState(ReadState.Initial);

reader.Read();
reader.Should()
    .HaveNodeType(XmlNodeType.Element)
    .HaveName(XName.Get("order", "urn:orders"));
```

Invalid expected enum values and negative depths are argument errors. Null readers and mismatches raise `AstraFlowAssertionException`; failures omit XML names, namespaces, and values. Reader property exceptions propagate unchanged.

## Nullable values

Calling `Should()` on `T?` creates `NullableValueAssertions<T>` and keeps the underlying type. `BeNull`, `NotBeNull`, `HaveValue`, and `NotHaveValue` check presence; `Which` returns a present value. Equality, comparison, inclusive range, and one-of checks operate on the underlying value. Checks that need a value fail safely when the subject is null. `NotBeOneOf` succeeds for null because null cannot equal any supplied non-nullable `T` value. Nullable GUID values also support `BeEmpty` and `NotBeEmpty`.

Nullable numeric values also support the matching sign checks for standard integer and floating-point types plus `decimal`, inclusive absolute approximation for `float`, `double`, and `decimal`, and NaN/finite classification for `float` and `double`. Nullable enums support defined-member and flag checks. Nullable `DateTime`, `DateTimeOffset`, and `TimeSpan` support the corresponding temporal ordering, precision, kind/offset, and duration-sign assertions. Nullable `DateOnly` and `TimeOnly` add the same date/clock operations on `net8.0` and later. A null numeric, temporal, or enum subject fails these value checks; assert nullability separately when null is expected. Floating-point NaN is neither positive nor negative and is not finite.

## Stream state and metadata

`Stream.Should()` supports `BeReadable`, `NotBeReadable`, `BeWritable`, `NotBeWritable`, `BeSeekable`, and `NotBeSeekable`. Seekable streams also support `HaveLength`, `HavePosition`, `BeAtBeginning`, and `BeAtEnd`. Length and position expectations must be nonnegative. Position and length checks require `CanSeek` and a supported metadata property; null, disposed, non-seekable, or unsupported-metadata subjects fail with `AstraFlowAssertionException`. Unexpected I/O exceptions propagate. These metadata checks only read capability and metadata properties; they never call `Read`, `Seek`, change `Position`, or dispose the stream.

Read/write mode checks include `BeReadOnly`/`NotBeReadOnly` and `BeWriteOnly`/`NotBeWriteOnly`. A read-only stream must report `CanRead` and not `CanWrite`; a write-only stream must report `CanWrite` and not `CanRead`. `NotHaveLength` and `NotHavePosition` check the inverse exact metadata conditions. `HaveBufferSize` and `NotHaveBufferSize` apply to `BufferedStream` on `net8.0`, `net9.0`, and `net10.0`; `BufferedStream.BufferSize` is not part of the `netstandard2.0` contract, so these methods are unavailable on that asset. Buffer-size checks do not inspect or dispose the wrapped stream. All numeric expectations are validated as nonnegative before metadata is read.

`HaveContent(byte[])` and `NotHaveContent(byte[])` compare the exact bytes available from the stream's current position, including the requirement that there are no additional trailing bytes. The check uses a fixed 4 KiB buffer instead of copying the stream into memory. Seekable streams are restored to their starting position after a successful comparison, mismatch, or read failure. Non-seekable streams are consumed as needed, so callers should use these assertions only when consuming the stream is acceptable. A mismatch message reports only the expected byte count; byte values are never included. Unexpected I/O exceptions propagate after a seekable stream's original position is restored.

## Async timeouts

Async actions and functions support `CompleteWithinAsync(timeout, cancellationToken)` and `NotCompleteWithinAsync(timeout, cancellationToken)`. The timeout must be finite, nonnegative, and supported by `Task.Delay`; zero is allowed. Invalid timeouts fail before the delegate is invoked. A pre-canceled token also prevents invocation. `CompleteWithinAsync` propagates the operation's exception and returns the result for an async function. `NotCompleteWithinAsync` fails if the operation completes or faults during the interval; for a function, it returns the original assertion object so other async-function checks can follow.

The cancellation token cancels the assertion's wait only; it is not passed to the operation and does not stop it. If a timed-out or canceled wait leaves the operation running, a later fault is observed to avoid an unobserved task exception. Delegate invocation happens before the assertion can await the returned `Task`, so synchronous blocking inside the delegate cannot be preempted by this timeout. Use a truly asynchronous operation for timeout checks.

`TaskCompletionSource<T>.Should()` and, on the `net8.0`, `net9.0`, and `net10.0` assets, `TaskCompletionSource.Should()` observe an already-created signal. `CompleteWithinAsync` awaits its task with a finite timeout; the generic form returns the result. A source-task fault or cancellation propagates unchanged. `NotCompleteWithinAsync` succeeds only if the task stays pending for the interval. Cancellation stops only the assertion's wait and never completes, cancels, or disposes the source. A wait that ends while a source remains pending installs a continuation to observe a later fault.

Use `HaveProperty` on a reference subject to select a typed property value and continue with its regular assertions:

```csharp
response.Should()
    .HaveProperty((WorkItemResponse item) => item.Title)
    .Which.Should()
    .Be("Ready");
```

The selector must be an instance-property path rooted at the declared selector type. Fields, indexers, static properties, and method calls are rejected before execution. Nested getters are evaluated once in order; their exceptions propagate unchanged. Failures omit property values and selector names. The lambda parameter type is explicit so the compiler can validate the selected type and member.

## Execution time

`Action` delegates support `ExecutionTime()`. The action runs exactly once on the calling thread and returns the elapsed `TimeSpan`. `Func<Task>` and `Func<Task<TResult>>` support `ExecutionTimeAsync()`, which invokes and awaits the operation once before returning its elapsed time; a function's result is discarded. `ExecutionTimeOf` measures one synchronous `Action<T>` against a supplied subject; `ExecutionTimeOfAsync` measures and awaits an async operation against that same subject. Exceptions from the delegate propagate unchanged. A null subject or delegate is an argument error, and a delegate that returns a null task fails with `InvalidOperationException`.

The returned `TimeSpan` can use the ordinary comparison and precision assertions:

```csharp
Action refresh = service.Refresh;
refresh.ExecutionTime().Should().BeLessThan(TimeSpan.FromMilliseconds(50));

Func<Task> save = service.SaveAsync;
(await save.ExecutionTimeAsync()).Should().BeLessThanOrEqualTo(TimeSpan.FromSeconds(1));

service.ExecutionTimeOf(value => value.RefreshCache())
    .Should().BeLessThan(TimeSpan.FromMilliseconds(100));
```

Execution-time measurement runs the operation to completion; it is not a timeout, does not cancel work, and does not dispatch it to a worker thread. Use `CompleteWithinAsync` when a test needs to assert a completion deadline.

## Numeric precision

`BeApproximately` and `NotBeApproximately` compare `float`, `double`, and `decimal` values using an inclusive absolute tolerance. The tolerance must be finite and nonnegative. NaN operands are outside the tolerance; equal signed infinities are within it. Decimal subtraction overflow is outside the tolerance. `BeNaN`, `NotBeNaN`, and `BeFinite` classify floating-point values. Numeric precision failures do not include operands or tolerance.

`BePositive` and `BeNegative` are available for the eight standard integer types (`sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, and `ulong`), `float`, `double`, `decimal`, and `TimeSpan`. They use strict comparisons with zero, so zero passes neither assertion. Unsigned values cannot pass `BeNegative`; floating-point NaN passes neither check, while positive and negative infinity pass their matching check. Successful checks keep the same assertion wrapper; failures do not print the subject value.

## Dates and durations

`BeBefore`, `BeAfter`, and `BeCloseTo` compare `DateTime` values by their ticks without converting their kinds; `HaveKind` checks the kind separately. For `DateTimeOffset`, comparisons use UTC instants and `HaveOffset` checks the stored offset. Offsets must be whole minutes within fourteen hours of UTC. `TimeSpan` supports `BeCloseTo`, `BePositive`, and `BeNegative`; zero is neither positive nor negative. Precision is nonnegative and inclusive, and comparisons handle the full value range. Temporal assertion failures omit operands and precision.

On `net8.0`, `net9.0`, and `net10.0`, `DateOnly` and `TimeOnly` also support `BeBefore`, `BeAfter`, and `BeCloseTo`. Date precision is measured in days; clock-time precision is a `TimeSpan`, with no wrap across midnight. These methods are unavailable on `netstandard2.0`.

## String and predicate checks

String matching and negative prefix/suffix checks use ordinal, case-sensitive rules. `Match` treats `*` as any number of characters and `?` as one character; both may match line breaks, and the pattern must cover the whole string. Empty wildcard patterns are rejected. `MatchRegex` uses .NET regular-expression search semantics, so it can match a substring unless the pattern is anchored. It requires a positive timeout and rejects an empty pattern. Invalid patterns throw a safe `ArgumentException`; a matching timeout throws `AstraFlowAssertionException`. Neither failure includes the pattern or subject. `HaveLength` accepts zero and rejects negative lengths as an argument error.

`BeEquivalentTo` requires an explicit `StringComparison`, so comparison behavior is never selected implicitly. `NotBeEmpty` fails for both null and empty strings. Negative prefix and suffix checks reject null search values. Object `Match` and `NotMatch` invoke the supplied predicate once; a null predicate is an argument error and exceptions thrown by the predicate propagate to the caller. These predicate failures omit the subject value.

`NotBeDefined` passes only when the enum value is not a declared enum member. For flags enums, a bit combination that has no explicit member is considered undefined.

## Sequence checks

`BeNull` and `BeNullOrEmpty` distinguish a null sequence from an empty one; `NotBeNullOrEmpty` requires at least one item. Count thresholds accept only nonnegative counts, including inclusive lower and upper bounds. `HaveSameCount` compares lengths without comparing values. `BeInAscendingOrder` and `BeInDescendingOrder` accept an optional comparer, allow equal adjacent items, and report the first failing index. `BeInAscendingOrderBy` and `BeInDescendingOrderBy` apply a key selector once per item, compare adjacent keys with an optional comparer, allow ties, and report the first failing index without exposing keys.

`OnlyHaveUniqueItems` uses equality semantics and an optional equality comparer. `ContainEquivalentItems` requires at least the requested multiplicity; `HaveSameItems` requires equal counts and multiplicities while ignoring order. These methods compare items with `EqualityComparer<T>` or the supplied comparer; they do not compare object graphs. Comparers are called directly rather than relying on their hash codes, so uniqueness and multiset checks can require quadratic equality comparisons.

`BeSubsetOf` and `NotBeSubsetOf` use set membership: repeated subject values need only one matching value in the superset. `IntersectWith` returns a new assertion object over the distinct shared values in subject order; `NotIntersectWith` requires no shared values. These relationship checks use default equality and enumerate each distinct input at most once. `NotContainNulls` requires a non-null subject and reports the first null item's index without exposing item values.

`AllBeAssignableTo<T>()` accepts the requested type and derived or implementing types; `AllBeOfType<T>()` requires an exact runtime type. Their generic forms return the matching values as a typed assertion sequence. Both also accept a `Type` argument and return the original assertion sequence. Empty sequences satisfy either all-items check; null sequences or null elements fail. `ContainItemsAssignableTo<T>()` and `NotContainItemsAssignableTo<T>()` check whether any item matches by assignability; null elements do not match. A null subject fails all four checks. Each check enumerates the subject at most once and disposes its enumerator on success or failure.

`HaveElementAt(index, expected)` checks the value at that zero-based position and returns it through `Which`. It reads only through the requested item, enumerates once, and disposes the enumerator. A negative index throws `ArgumentOutOfRangeException`; a null sequence, missing position, or unequal value raises `AstraFlowAssertionException` without printing string contents.

`HaveElementPreceding(successor, expectedPredecessor)` and `HaveElementSucceeding(predecessor, expectedSuccessor)` check an immediate neighbor of the first matching pivot, using `EqualityComparer<T>.Default`. Each reads the subject once and stops when that pivot and its neighbor are known. A null or empty subject, missing pivot, pivot at the relevant boundary, or unequal neighbor fails without printing compared values. Enumerator and comparer exceptions propagate unchanged.

```csharp
results.Should().HaveElementPreceding("completed", "active");
results.Should().HaveElementSucceeding("active", "completed");
```

`ContainInOrder` and `ContainInConsecutiveOrder` accept an expected sequence; the first allows gaps and the second requires adjacent matches. `ContainConsecutive` is an alias for the consecutive check. `NotContainInOrder` and `NotContainInConsecutiveOrder` assert the corresponding absence. Repeated expected items require distinct subject positions, and null items compare with `EqualityComparer<T>.Default`. Empty expectations succeed, including for a null subject in the positive checks; the negative checks require a non-null subject. The subject and a lazy expected sequence are each enumerated at most once and disposed. Failures identify the mismatch or ending index without printing item values.

`StartWith` and `EndWith` compare an ordered prefix or suffix against a finite expected sequence. They accept either `params` values or an `IEnumerable<T>` and an optional equality comparer. The expected sequence is read at most once; the subject is read at most once and disposed. Prefix checks stop after the expected items, while suffix checks read the complete subject. A null expected sequence throws `ArgumentNullException`; a null subject fails even for an empty expectation. An empty expectation succeeds for a non-null subject without enumerating it. Failure messages report only the mismatch index or item counts, not compared values.

`Contain(expected, because, args)` adds formatted failure context when an item is missing. For `IEnumerable<string>`, its reason overload overlaps with multi-item `Contain(params T[])`: cast string format arguments to `object` to select the reason overload, and pass multiple expected strings as one array (`Contain(new[] { first, second })`).

`ContainEquivalentOf`, `NotContainEquivalentOf`, and `AllBeEquivalentTo` compare sequence items structurally against one expected value using the same per-call options as `BeEquivalentTo`. The positive containment check returns the matched item through `Which`; all-items succeeds for an empty sequence, while positive containment fails. Null subjects fail all three checks. Each outer subject is enumerated once, and nested sequence and dictionary snapshots are shared across item comparisons so one-shot values are read at most once. Failures report the first item index and, for an all-items mismatch, the differing member path without printing object values.

For strings, `NotContainEquivalentOf(unexpected)` rejects a substring using ordinal case-insensitive comparison. Its reason overload appends formatted context on failure without printing either string.

`SatisfyRespectively` requires one action per item and invokes them once in sequence order. `AllSatisfy` invokes its action once per item and succeeds for an empty sequence. Callback exceptions propagate unchanged.

Each added sequence assertion enumerates its subject at most once and disposes the enumerator on success or failure. Multiset and per-item operations may materialize one snapshot before comparing or invoking callbacks. Inputs must be finite.

## Asynchronous sequence checks

On `net8.0`, `net9.0`, and `net10.0`, `IAsyncEnumerable<T>.Should()` provides `BeEmptyAsync`, `NotBeEmptyAsync`, `HaveCountAsync`, value and predicate overloads of `ContainAsync` and `NotContainAsync`, `OnlyContainAsync`, `OnlyHaveUniqueItemsAsync`, `ContainEquivalentItemsAsync`, `HaveSameItemsAsync`, `ContainInOrderAsync`, `NotContainInOrderAsync`, `ContainConsecutiveAsync`, `NotContainInConsecutiveOrderAsync`, `ContainSingleAsync`, `AllSatisfyAsync`, `SatisfyRespectivelyAsync`, `EqualAsync`, `ThrowAsync<TException>`, and `NotThrowAsync`. Value membership and multiset checks accept an optional equality comparer; ordered equality and subsequence checks use `EqualityComparer<T>.Default`. Negative ordered checks require a non-null subject, allow empty expectations, and report only the ending index of a matching sequence. `ContainSingleAsync` returns the item through `Which`. `ThrowAsync<TException>` enumerates the source and returns the matching exception if the producer throws; a successful completion or a different exception type fails the assertion. `NotThrowAsync` enumerates to completion and fails with the producer exception type but not its message. Caller-requested cancellation propagates unchanged from `NotThrowAsync`. `ContainAsync`, `OnlyContainAsync`, uniqueness, and multiset checks require a non-null subject; `NotContainAsync` succeeds for a null subject. Positive empty ordered and consecutive expectations also succeed for a null subject.

Each call obtains one async enumerator and disposes it on success, assertion failure, cancellation, or producer failure. Expected sequences are enumerated once. Methods that accept a cancellation token pass it to `GetAsyncEnumerator`. Cancellation, predicate, comparer, callback, and producer exceptions propagate unchanged, except that `ThrowAsync<TException>` converts the requested producer exception into `ExceptionAssertions<TException>` and `NotThrowAsync` converts a non-cancellation producer or disposal exception into an assertion failure. `AllSatisfyAsync` invokes its callback sequentially once per item; `SatisfyRespectivelyAsync` requires one callback per item and invokes them in order. Neither callback API aggregates multiple callback failures. Count checks stop once they have observed more items than requested; checks that need full absence, uniqueness, every-item validity, exact count, equal multisets, complete ordered equality, or completion without a producer exception must reach the end of the stream and therefore require finite sources. Multiset and uniqueness comparisons may require quadratic equality-comparer calls.

## Dictionary checks

`Equal` and `NotEqual` compare dictionary mappings regardless of entry order. Keys and values use `EqualityComparer<TKey>.Default` and `EqualityComparer<TValue>.Default`; this exact-value comparison is separate from `BeEquivalentTo`, which compares value graphs structurally. Expected entry sequences must be finite and contain unique keys, and are enumerated once. Null expected sequences throw `ArgumentNullException`; null subjects fail. Failure messages identify whether the entry count, key set, or values differ without printing keys or values.

Mutable dictionaries, read-only dictionaries, and key-value-pair sequences start dictionary checks with `Should()`. The dictionary overload preserves the subject's comparer for key lookups; pair sequences use `EqualityComparer<TKey>.Default` and are enumerated once per assertion. `HaveSameCount` accepts a finite key-value entry sequence and reads it once when it does not expose a count.

`ContainKeys` and `NotContainKeys` use the subject dictionary's key comparer. `ContainValues` and `NotContainValues` use default value equality and treat repeated expectations as presence checks. `NotContain(key, value)` uses the dictionary's key comparer and default value equality. Predicate-based `NotContain` evaluates each entry once in a single pass and stops at the first match; predicate exceptions propagate unchanged, and failure messages omit entry keys and values. A null predicate throws `ArgumentNullException`, while a null subject fails the assertion. Key/value batch assertions also support read-only dictionaries and key-value-pair sequences.

## Object-graph checks

`BeEquivalentTo` and `NotBeEquivalentTo` compare the expected object's public readable, non-indexed properties by exact member name. Public instance fields can be included with `IncludingFields()`; static fields are never compared. The subject and expected types may differ, and additional subject-only members are ignored; every non-excluded expected member must exist on the subject. Nested objects follow the same rule recursively. Sequences are ordered by default; `IgnoringCollectionOrder()` opts into one-to-one item matching that preserves duplicate counts. Dictionaries are matched by key using the subject dictionary's key comparer. Failure messages identify the first mismatch path and omit member values. Configure `Using<T>(IEqualityComparer<T>)` to compare values of a type with a per-call comparer, or `Using<T>("Billing.ApiKey", comparer)` to restrict it to one nested path. A path-specific comparer takes precedence over the comparer registered for that type.

`Excluding("MemberName")` skips a property or included field with that name at any depth, using case-insensitive name matching. `ExcludingPath("Billing.ApiKey")` skips only the named nested member; path names are case-insensitive and omit collection indexes, so `ExcludingPath("Items.ApiKey")` applies to that member in every item. `IncludingPath("Billing.ApiKey")` limits comparison to the selected path and its ancestors; once the selected member is reached, its value is compared structurally. Paths continue through sequence items and generic dictionary values, with indexes and keys omitted; dictionary counts and keys are still compared. A path that cannot be resolved in the expected graph throws `ArgumentException`, including when used with `NotBeEquivalentTo`, so an invalid selection cannot silently pass a negative assertion. Paths use dot-separated member names without a root marker or collection indexes; exclusions override inclusions. The default maximum graph depth is 32; `WithMaximumDepth` accepts 1 through 128. Revisited object pairs terminate cycles; graph aliasing shape is not compared. Nested sequence instances are snapshotted once during a comparison, including unordered candidate matching. Member getter and custom-comparer exceptions propagate to the caller. Unordered matching compares candidate pairs and can require quadratic comparisons for larger collections.

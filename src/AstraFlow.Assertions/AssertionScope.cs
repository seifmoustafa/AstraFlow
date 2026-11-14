using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Collects failures from explicitly checked assertion actions and reports them when disposed.</summary>
/// <remarks>Await every checked asynchronous action before disposing the scope.</remarks>
public sealed class AssertionScope : IDisposable
{
    private readonly AssertionScope? _parent;
    private readonly object _gate = new();
    private readonly List<string> _failures = new();
    private bool _isDisposed;

    /// <summary>Creates a top-level assertion scope.</summary>
    public AssertionScope()
    {
    }

    private AssertionScope(AssertionScope parent) => _parent = parent;

    /// <summary>Creates a nested scope whose failures are forwarded to this scope when disposed.</summary>
    public AssertionScope BeginScope()
    {
        ThrowIfDisposed();
        return new AssertionScope(this);
    }

    /// <summary>Runs one assertion action and records its AstraFlow assertion failure, if any.</summary>
    public AssertionScope Check(Action assertions)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        ThrowIfDisposed();
        try
        {
            assertions();
        }
        catch (AstraFlowAssertionException exception)
        {
            RecordFailure(exception.Message);
        }

        return this;
    }

    /// <summary>Runs one asynchronous assertion action and records its AstraFlow assertion failure, if any.</summary>
    public async Task CheckAsync(Func<Task> assertions)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        ThrowIfDisposed();
        try
        {
            await assertions().ConfigureAwait(false);
        }
        catch (AstraFlowAssertionException exception)
        {
            RecordFailure(exception.Message);
        }
    }

    /// <summary>Forwards collected failures to the parent or throws one aggregate assertion exception.</summary>
    public void Dispose()
    {
        List<string> failures;
        lock (_gate)
        {
            if (_isDisposed)
            {
                return;
            }

            _isDisposed = true;
            failures = new List<string>(_failures);
        }

        if (_parent is not null)
        {
            _parent.RecordFailures(failures);
        }
        else if (failures.Count > 0)
        {
            AssertionFailure.Fail(FormatFailures(failures));
        }
    }

    private void RecordFailure(string message)
    {
        lock (_gate)
        {
            if (_isDisposed)
            {
                throw new InvalidOperationException("Cannot record an assertion failure after its scope has been disposed.");
            }

            _failures.Add(message);
        }
    }

    private void RecordFailures(IReadOnlyList<string> failures)
    {
        lock (_gate)
        {
            if (_isDisposed)
            {
                throw new InvalidOperationException("Cannot add nested assertion failures after the parent scope has been disposed.");
            }

            for (var index = 0; index < failures.Count; index++)
            {
                _failures.Add(failures[index]);
            }
        }
    }

    private void ThrowIfDisposed()
    {
        lock (_gate)
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException(nameof(AssertionScope));
            }
        }
    }

    private static string FormatFailures(IReadOnlyList<string> failures)
    {
        var message = new StringBuilder("Assertion scope collected ");
        message.Append(failures.Count.ToString(CultureInfo.InvariantCulture));
        message.Append(failures.Count == 1 ? " failure:" : " failures:");

        for (var index = 0; index < failures.Count; index++)
        {
            message.AppendLine();
            message.Append((index + 1).ToString(CultureInfo.InvariantCulture));
            message.Append(". ");
            message.Append(failures[index]);
        }

        return message.ToString();
    }
}
